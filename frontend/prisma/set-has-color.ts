import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Setting hasColor to true for existing color attributes...\n");

    const allAttributes = await prisma.attribute.findMany();

    let count = 0;

    for (const attr of allAttributes) {
        if (
            attr.name.toLowerCase().includes("renk")
        ) {
            await prisma.attribute.update({
                where: { id: attr.id },
                data: { hasColor: true },
            });
            count++;
            console.log(`Enabled hasColor for: ${attr.name}`);
        }
    }

    console.log(`\n✅ Script complete! Updated ${count} attributes.`);
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
