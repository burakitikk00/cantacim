
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables.');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FILE_PATH = 'c:\\Users\\burak\\OneDrive\\Belgeler\\Cantam_Butik\\Shopier-Urunler-20260217.xlsx';

function slugify(text: any) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function main() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`File not found: ${FILE_PATH}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${jsonData.length} rows in Excel file.`);

    // Cleanup option
    const CLEAN_SHOPIER_PRODUCTS = true;
    if (CLEAN_SHOPIER_PRODUCTS) {
        console.log('Cleaning up existing Shopier products...');
        await prisma.product.deleteMany({
            where: { shopierId: { not: null } }
        });
        console.log('Cleanup complete.');
    }

    // Ensure "Varyasyon" attribute exists
    let variantAttribute = await prisma.attribute.findUnique({
        where: { name: 'Varyasyon' },
    });

    // ... (existing attribute creation code) ...

    if (!variantAttribute) {
        variantAttribute = await prisma.attribute.create({
            data: {
                name: 'Varyasyon',
                slug: 'varyasyon',
                sortOrder: 1,
            },
        });
        console.log('Created default attribute: Varyasyon');
    }

    for (const row of jsonData) {
        try {
            const shopierLink = row['Ürün Linki'];
            if (!shopierLink) continue;

            const shopierId = shopierLink.split('/').pop();
            const productName = row['Ürün Adı'];
            const description = row['Ürün Açıklaması'];
            const priceRaw = row['İndirimli Fiyat'] || row['Orijinal Fiyat'];
            const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(priceRaw);

            const categoryName = row['Ürün Kategorisi'];
            const stock = parseInt(row['Stok Adedi'] || '0');

            const metadata = {
                '2.Opsiyon Fiyatı': row['2.Opsiyon Fiyatı'],
                '3.Opsiyon Adı': row['3.Opsiyon Adı'],
                '3.Opsiyon Fiyatı': row['3.Opsiyon Fiyatı'],
                'Teslimat Bildirimi': row['Teslimat Bildirimi'],
                'Özel Not': row['Özel Not'],
                'Tarih': row['Tarih'],
                '1.Opsiyon Adı': row['1.Opsiyon Adı'], // Store original option as metadata since we use Varyasyonlar
                '1.Opsiyon Fiyatı': row['1.Opsiyon Fiyatı']
            };

            if (!productName || !shopierId) {
                console.warn(`Skipping row with missing name or shopierId: ${JSON.stringify(row)}`);
                continue;
            }

            // 1. Find or Create Category
            let category = await prisma.category.findFirst({ where: { name: categoryName } });
            if (!category) {
                const catSlug = slugify(categoryName);
                const existingCatSlug = await prisma.category.findFirst({ where: { slug: catSlug } });
                const finalCatSlug = existingCatSlug ? `${catSlug}-${Date.now()}` : catSlug;
                category = await prisma.category.create({ data: { name: categoryName, slug: finalCatSlug } });
                console.log(`Created new category: ${categoryName}`);
            }

            // 2. Create Product
            // Since we cleaned up, we can just create (or findUnique just in case duplication within excel)
            let product = await prisma.product.findUnique({ where: { shopierId: shopierId } });
            if (!product) {
                product = await prisma.product.create({
                    data: {
                        name: productName,
                        slug: slugify(productName) + '-' + shopierId,
                        description: description,
                        basePrice: price,
                        categoryId: category.id,
                        shopierId: shopierId,
                        isActive: true,
                        metadata: metadata,
                        images: row['Görsel Linki'] ? [row['Görsel Linki']] : [],
                        sortOrder: parseInt(row['Sıra'] || '0')
                    },
                });
                console.log(`Created product: ${productName}`);
            } else {
                // Update existing product metadata
                await prisma.product.update({
                    where: { id: product.id },
                    data: { metadata: metadata }
                });
            }

            // 3. Handle Variants from "Varyasyonlar" column
            const varyasyonlarRaw = row['Varyasyonlar'];

            if (varyasyonlarRaw && typeof varyasyonlarRaw === 'string') {
                // Format: "Name: Stock (Price TL) \n Name: Stock (Price TL)"
                const lines = varyasyonlarRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

                for (const line of lines) {
                    // Parse each line
                    // "Beyaz Desenli: 16 (701.99 TL)"
                    let vName = 'Standart';
                    let vStock = stock; // Default to main stock if parse fails?
                    let vPrice = price;

                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        vName = parts[0].trim();
                        const rest = parts.slice(1).join(':').trim();
                        const stockMatch = rest.match(/^(\d+)/);
                        if (stockMatch) vStock = parseInt(stockMatch[1]);
                        const priceMatch = rest.match(/\(([\d\.]+)/);
                        if (priceMatch) vPrice = parseFloat(priceMatch[1]);
                    } else {
                        vName = line;
                    }

                    // Create Variant
                    await createVariant(product.id, shopierId, vName, vStock, vPrice, variantAttribute.id);
                }
            } else {
                // Fallback if no Varyasyonlar column but maybe 1.Opsiyon Adı?
                // Or just create a Default Variant
                const variantRaw = row['1.Opsiyon Adı'];
                // Only treat as variant if Varyasyonlar was empty.
                // But as we saw, 1.Opsiyon might be an upsell.
                // Create default variant with main price/stock
                await createVariant(product.id, shopierId, 'Standart', stock, price, variantAttribute.id, true);
            }

        } catch (e) {
            console.error(`Error processing row: ${JSON.stringify(row)}`, e);
        }
    }
}

async function createVariant(productId: string, shopierId: string, name: string, stock: number, price: number, attributeId: string, isDefault = false) {
    const slug = slugify(name);
    const sku = `${shopierId}-${slug}`; // SKU logic

    // Check if exists
    const exists = await prisma.productVariant.findFirst({ where: { sku } }); // Use findFirst just in case
    if (exists) return;

    const variant = await prisma.productVariant.create({
        data: {
            productId,
            sku,
            price,
            stock,
            isActive: true,
        }
    });

    if (!isDefault) {
        // Link Attribute
        let attrValue = await prisma.attributeValue.findFirst({
            where: { attributeId, slug }
        });
        if (!attrValue) {
            const existingValue = await prisma.attributeValue.findFirst({ where: { attributeId, value: name } });
            if (existingValue) attrValue = existingValue;
            else {
                attrValue = await prisma.attributeValue.create({
                    data: { attributeId, value: name, slug: slug + '-' + Math.floor(Math.random() * 10000) }
                });
            }
        }
        await prisma.productVariantAttributeValue.create({
            data: { variantId: variant.id, attributeValueId: attrValue.id }
        });
    }
    console.log(`  > Added variant: ${name} (Stock: ${stock}, Price: ${price})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
