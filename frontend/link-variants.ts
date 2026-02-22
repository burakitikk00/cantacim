import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Fetching all attribute values...");
    const attributeValues = await prisma.attributeValue.findMany();
    // Sort by length to try matching "siyah-beyaz" before "siyah"
    const sortedVals = attributeValues.sort((a, b) => b.slug.length - a.slug.length);

    console.log("Fetching all product variants...");
    const variants = await prisma.productVariant.findMany();

    let matches = 0;
    for (const v of variants) {
        let matchedVal = null;
        const skuLower = v.sku.toLowerCase();

        for (const val of sortedVals) {
            if (skuLower.endsWith("-" + val.slug) || skuLower === val.slug) {
                matchedVal = val;
                break;
            }
        }

        if (matchedVal) {
            const existing = await prisma.productVariantAttributeValue.findUnique({
                where: {
                    variantId_attributeValueId: {
                        variantId: v.id,
                        attributeValueId: matchedVal.id
                    }
                }
            });

            if (!existing) {
                await prisma.productVariantAttributeValue.create({
                    data: {
                        variantId: v.id,
                        attributeValueId: matchedVal.id
                    }
                });
                console.log(`Matched & Linked: SKU ${v.sku} -> Slug: ${matchedVal.slug}`);
                matches++;
            }
        } else {
            console.log(`Could not find a matching attribute for SKU: ${v.sku}`);
        }
    }

    console.log(`\n✅ Finished linking! Successfully re-linked ${matches} variants.`);
}

main().catch(console.error).finally(async () => {
    await pool.end();
    await prisma.$disconnect();
});
