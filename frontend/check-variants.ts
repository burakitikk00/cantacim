import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Fetching variants...");
    const variants = await prisma.productVariant.findMany({
        take: 50,
        include: { product: true }
    });

    for (const v of variants) {
        console.log(`Variant ID: ${v.id}, SKU: ${v.sku}, Product: ${v.product.name}`);
    }
}

main().catch(console.error).finally(async () => {
    await pool.end();
    await prisma.$disconnect();
});
