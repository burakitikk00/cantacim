import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const unlinked = await prisma.productVariant.findMany({
        where: {
            attributes: {
                none: {}
            }
        },
        include: { product: true }
    });

    console.log(`There are ${unlinked.length} unlinked variants.`);
    if (unlinked.length > 0) {
        console.log("Sample unlinked variants:");
        unlinked.slice(0, 10).forEach(v => {
            console.log(`SKU: ${v.sku} - Product: ${v.product.name}`);
        });
    }
}

main().catch(console.error).finally(async () => {
    await pool.end();
    await prisma.$disconnect();
});
