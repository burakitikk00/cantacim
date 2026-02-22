import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const COLOR_MAP: Record<string, string> = {
    "siyah": "#1A1A1A",
    "beyaz": "#FFFFFF",
    "kirmizi": "#8B0000",
    "mavi": "#00008B",
    "yesil": "#006400",
    "pembe": "#FFC0CB",
    "altin": "#D4AF37",
    "gumus": "#C0C0C0",
    "gri": "#808080",
    "bej": "#F5F5DC",
    "tan": "#C19A6B",
    "bordo": "#800000",
    "lacivert": "#000080",
    "krem": "#FFFDD0",
    "cagla-yesili": "#8F9779", // approx
    "vizon": "#7B6B59", // approx
    "mor": "#800080",
    "gold": "#D4AF37",
    "sari": "#FFFF00",
    "turuncu": "#FFA500",
    "kiremit": "#8C3A3A",
    "leopar": "#D4AF37", // fallback
    "taba": "#9B4E00",
    "hardal": "#FFDB58",
    "haki": "#4B5320",
    "acik-kahverengi": "#C4A484",
    "siyah-gri": "#4A4A4A",
    "duz-siyah": "#000000",
    "desenli-siyah": "#111111",
    "gorsel-rengi": "#CCCCCC",
    "beyaz-desenli": "#EEEEEE",
    "bej-leopar": "#E5D3B3",
    "beyaz-siyah": "#888888",
    "krem-siyah": "#AE9A7A",
    "siyah-gumus": "#5A5A5A",
    "siyah-gold": "#7A6A1A",
    "siyah-bordo": "#4B0000",
    "siyah-rugan": "#0A0A0A",
    "siyah-taba": "#4D2700",
    "aci-kahverengi": "#4E3524",
    "aci-kahverengi-suet": "#4E3524",
    "aci-kahve-rengi-deri": "#4E3524",
    "siyah-terlik": "#1A1A1A",
    "suet-taba": "#B5651D",
    "acikahve-suet": "#B5651D",
    "vizon-gri": "#A09E96",
    "sutlu-kahve": "#CBB3A1",
    "camel": "#C19A6B",
    "acik-gri": "#D3D3D3",
    "koyu-gri": "#A9A9A9",
    "su-yesili": "#A8E4A0",
    "lila": "#C8A2C8",
    "pudra": "#FFD1DC",
    "tas": "#C2B280",
};

async function main() {
    console.log("Seeding colors for AttributeValues...\n");

    const allValues = await prisma.attributeValue.findMany({
        include: {
            attribute: true,
        },
    });

    let count = 0;

    for (const val of allValues) {
        if (val.attribute.name.toLowerCase().includes("renk")) {
            // Determine base color code
            let colorCode = "#CCCCCC"; // Default fallback

            // Try matching against COLOR_MAP with slug
            let slugMatch = false;
            for (const [key, hex] of Object.entries(COLOR_MAP)) {
                if (val.slug.includes(key)) {
                    colorCode = hex;
                    slugMatch = true;
                    break;
                }
            }

            if (!slugMatch) {
                // Optional: specific string matches
                if (val.slug.includes("kirmizi")) colorCode = "#8B0000";
                else if (val.slug.includes("beyaz")) colorCode = "#FFFFFF";
                else if (val.slug.includes("siyah")) colorCode = "#1A1A1A";
            }

            // Update record
            await prisma.attributeValue.update({
                where: { id: val.id },
                data: { colorCode },
            });
            count++;
            console.log(`Updated ${val.value} with ${colorCode}`);
        }
    }

    console.log(`\n✅ Seed complete! Updated ${count} values.`);
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
