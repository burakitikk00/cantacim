
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as xlsx from 'xlsx';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { clearTimeout } from 'timers';

dotenv.config();

// Database setup
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Configuration
// Using Absolute Path because process.cwd() might be relative inside npx environment or subtle issue
const EXCEL_FILE = 'C:\\Users\\burak\\OneDrive\\Belgeler\\Cantam_Butik\\Shopier-Urunler-20260217.xlsx';
const STATE_FILE = path.join(process.cwd(), 'shopier-image-scraping-state.json');
const CDN_BASE = 'https://cdn.shopier.app/pictures_mid/';
const DELAY_MS = 2000; // 2 seconds delay between requests

interface ScrapingState {
    processed: string[];
    errors: { id: string; error: string }[];
}

async function loadState(): Promise<ScrapingState> {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    return { processed: [], errors: [] };
}

async function saveState(state: ScrapingState) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(str: string) {
    return str.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/\s+/g, ' ').trim();
}

async function main() {
    console.log('Starting Shopier Image Scraper...');
    console.log(`Excel Path: ${EXCEL_FILE}`);

    if (!fs.existsSync(EXCEL_FILE)) {
        console.error(`Excel file NOT found at: ${EXCEL_FILE}`);
        process.exit(1);
    }

    // 1. Read Excel
    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows in Excel.`);

    // 2. Load State
    const state = await loadState();
    console.log(`Already processed: ${state.processed.length} products.`);

    // 3. Iterate
    for (const row of data) {
        const link = row['Ürün Linki'];
        if (!link) continue;

        const parts = link.split('/');
        const possibleId = parts[parts.length - 1].split('?')[0];
        const shopierId = possibleId;

        if (!shopierId || isNaN(Number(shopierId))) {
            continue;
        }

        if (state.processed.includes(shopierId)) {
            continue;
        }

        console.log(`\nProcessing Product: ${shopierId}`);

        try {
            const dbProduct = await prisma.product.findUnique({
                where: { shopierId },
                include: {
                    variants: {
                        include: {
                            attributes: {
                                include: { attributeValue: true }
                            }
                        }
                    }
                }
            });

            if (!dbProduct) {
                console.log(`Product ${shopierId} not found in DB. Skipping.`);
                state.errors.push({ id: shopierId, error: 'Not found in DB' });
                await saveState(state);
                continue;
            }

            const response = await axios.get(link, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
            const html = response.data;
            const $ = cheerio.load(html);

            const nameToIdMap = new Map<string, string>();
            $('input[name="first_var"]').each((_, input) => {
                const id = $(input).attr('id');
                const val = $(input).val() as string;
                let labelText = '';
                if (id) {
                    const label = $(`label[for="${id}"]`);
                    labelText = label.text().trim();
                    if (!labelText) labelText = label.find('.variant-name, span').text().trim();
                }
                if (!labelText) labelText = $(input).data('title') || $(input).parent().text().trim();
                if (labelText) nameToIdMap.set(normalize(labelText), val);
            });

            let idToImageMap = new Map<string, string>();
            const jsonKey = '"variation_details":';
            const jsonIdx = html.indexOf(jsonKey);
            if (jsonIdx !== -1) {
                const start = html.indexOf('[', jsonIdx);
                let depth = 0; let end = -1;
                for (let i = start; i < html.length; i++) {
                    if (html[i] === '[') depth++;
                    if (html[i] === ']') depth--;
                    if (depth === 0) { end = i + 1; break; }
                }
                if (end !== -1) {
                    try {
                        const jsonStr = html.substring(start, end);
                        const details = JSON.parse(jsonStr);
                        details.forEach((d: any) => {
                            if (d.variation1 && d.image) idToImageMap.set(String(d.variation1), d.image);
                        });
                    } catch (e) { }
                }
            }

            let updatedCount = 0;

            if (nameToIdMap.size === 0) {
                let mainImageUrl = '';
                if (idToImageMap.size === 1) {
                    const img = idToImageMap.values().next().value;
                    if (img) mainImageUrl = `${CDN_BASE}${img}`;
                }
                if (!mainImageUrl) {
                    let domImg = $('.media-container img, .product-media img').first().attr('src'); // Try strict first
                    if (!domImg) {
                        // Aggressive fallback: any image with pictures_mid
                        domImg = $('img[src*="pictures_mid"]').first().attr('src');
                    }

                    if (domImg) {
                        if (domImg.startsWith('http')) mainImageUrl = domImg;
                        else if (domImg.startsWith('//')) mainImageUrl = `https:${domImg}`;
                        else mainImageUrl = `https://shopier.com${domImg}`;
                    }
                }

                if (mainImageUrl) {
                    if (dbProduct.variants.length === 1) {
                        await prisma.productVariant.update({
                            where: { id: dbProduct.variants[0].id },
                            data: { image: mainImageUrl }
                        });
                        updatedCount++;
                        console.log(`assigned main image to single variant: ${mainImageUrl}`);
                    } else {
                        await prisma.productVariant.updateMany({
                            where: { productId: dbProduct.id },
                            data: { image: mainImageUrl }
                        });
                        updatedCount = dbProduct.variants.length;
                        console.log(`assigned main image to ALL ${updatedCount} variants (fallback): ${mainImageUrl}`);
                    }
                } else {
                    console.log('No main image found for fallback (even aggressive).');
                }

            } else {
                for (const variant of dbProduct.variants) {
                    const variantName = variant.attributes.map(a => a.attributeValue.value).join(' ');
                    const normalizedDbName = normalize(variantName);

                    let matchedId = '';
                    for (const [key, val] of nameToIdMap.entries()) {
                        if (key.includes(normalizedDbName) || normalizedDbName.includes(key)) {
                            matchedId = val;
                            break;
                        }
                    }

                    if (matchedId) {
                        const imageFile = idToImageMap.get(matchedId);
                        if (imageFile) {
                            const fullUrl = `${CDN_BASE}${imageFile}`;
                            await prisma.productVariant.update({
                                where: { id: variant.id },
                                data: { image: fullUrl }
                            });
                            updatedCount++;
                        }
                    }
                }
            }

            console.log(`Updated images for ${updatedCount} variants.`);
            state.processed.push(shopierId);
            await saveState(state);

        } catch (error: any) {
            console.error(`Error processing ${shopierId}:`, error.message);
            state.errors.push({ id: shopierId, error: error.message });
            await saveState(state);
        }

        await delay(DELAY_MS);
    }

    console.log('Done!');
    await prisma.$disconnect();
    await pool.end();
}

main().catch(console.error);
