
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const productsCount = await prisma.product.count({
        where: { shopierId: { not: null } }
    });

    const variantsCount = await prisma.productVariant.count({
        where: { product: { shopierId: { not: null } } }
    });

    const categoriesCount = await prisma.category.count();

    console.log('--- Verification Results ---');
    console.log(`Total Products Imported from Shopier: ${productsCount}`);
    console.log(`Total Variants Linked to Shopier Products: ${variantsCount}`);
    console.log(`Total Categories: ${categoriesCount}`);

    // Sample Product
    const sample = await prisma.product.findFirst({
        where: { shopierId: { not: null } },
        include: {
            variants: {
                include: {
                    attributes: {
                        include: { attributeValue: true }
                    }
                }
            },
            category: true
        }
    });

    if (sample) {
        console.log('\n--- Sample Product ---');
        console.log(`Name: ${sample.name}`);
        console.log(`Shopier ID: ${sample.shopierId}`);
        console.log(`Category: ${sample.category?.name}`);
        console.log(`Price: ${sample.basePrice}`);
        console.log(`Variants (${sample.variants.length}):`);
        sample.variants.forEach(v => {
            const attrs = v.attributes.map(a => a.attributeValue.value).join(', ');
            console.log(` - SKU: ${v.sku} | Price: ${v.price} | Stock: ${v.stock} | Attrs: ${attrs}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
