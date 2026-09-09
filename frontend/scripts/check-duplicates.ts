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
    const products = await prisma.product.findMany();
    const nameCounts: Record<string, number> = {};
    products.forEach(p => nameCounts[p.name] = (nameCounts[p.name] || 0) + 1);
    const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
    console.log('Duplicate product names:', duplicates);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
