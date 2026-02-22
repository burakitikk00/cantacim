import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/é/g, "e")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const ATTRIBUTES = [
    {
        name: "numara seç varyasonu",
        values: [
            "NO:201", "NO:202", "NO:203", "NO:204", "NO:205",
            "1 NUMARA", "2 NUMARA", "3 NUMARA", "4 NUMARA", "5 NUMARA",
            "6 NUMARA", "7 NUMARA", "8 NUMARA", "9 NUMARA", "36 Numara",
            "37 Numara", "38 Numara", "39 Numara", "40 Numara", "10 Numara",
            "11 NUMARA", "12 NUMARA", "13 NUMARA", "14 NUMARA", "15 NUMARA",
            "16 NUMARA", "17 NUMARA", "18 NUMARA", "19 NUMARA", "20 NUMARA"
        ]
    },
    {
        name: "renk",
        values: [
            "Kırmızı Renk", "Beyaz Renk", "Siyah Renk", "Krem renk", "Bej Renk",
            "Pembe Renk", "Yeşil Renk", "Mavi Renk", "Lacivert Renk", "Kahverengi Renk",
            "Bordo Renk", "Lila Renk", "Pudra Rengi", "Çağla Yeşili", "Vizon Renk",
            "Mor Renk", "Gold Renk", "Gümüş Renk", "Sarı Renk", "Turuncu Renk",
            "Gri Renk", "Kiremit Renk", "Leopar Desen", "Taba Renk", "Hardal", "Haki",
            "Açık Kahverengi", "Siyah - Gri", "Düz Siyah", "Desenli Siyah",
            "Görsel Rengi", "Beyaz Desenli", "Bej - Leopar", "Beyaz - Siyah",
            "Siyah - Beyaz", "Krem - Siyah", "Siyah - Gümüş", "Siyah - Gold",
            "siyah - Bordo", "Siyah - Rugan Siyah", "Siyah - Taba", "Acı Kahverengi",
            "Acı Kahverengi Süet", "Acı Kahve Rengi Deri", "siyah Terlik",
            "Süet Taba", "Acıkahve Süet", "Vizon Gri", "Siyah - Lacoste  Renkli Baskı",
            "Lacivert -Lacoste Renkli Baskı"
        ]
    },
    {
        name: "askı rengi",
        values: [
            "Turuncu", "Fuşya", "Siyah", "Açık Pembe", "Krem Renk", "Kahverengi", "Mavi"
        ]
    },
    {
        name: "beden",
        values: ["S", "M", "L", "XL", "Standart Beden"]
    },
    {
        name: "renk seçimi",
        values: [
            "siyah", "Lacivert", "Mavi", "Acıkahve", "Sütlü Kahve", "Camel", "vizon",
            "Açık Gri", "Koyu Gri", "Haki", "Su Yeşili", "Lila", "Pudra", "Bej",
            "Taş", "Krem", "Bordo"
        ]
    },
    {
        name: "kemer uzunluğu",
        values: ["105", "110", "115", "120", "125", "130"]
    }
];

async function main() {
    console.log("Seeding variation attributes...\n");

    console.log("Clearing existing variation attributes...");
    await prisma.attribute.deleteMany({});
    console.log("Existing attributes cleared.\n");

    for (let i = 0; i < ATTRIBUTES.length; i++) {
        const attr = ATTRIBUTES[i];
        const attrSlug = generateSlug(attr.name);

        const created = await prisma.attribute.upsert({
            where: { slug: attrSlug },
            update: { name: attr.name },
            create: {
                name: attr.name,
                slug: attrSlug,
                sortOrder: i + 1,
            },
        });

        console.log(`  ✓ Attribute: ${created.name} (${created.id})`);

        for (let j = 0; j < attr.values.length; j++) {
            const val = attr.values[j];
            const valSlug = generateSlug(val);

            await prisma.attributeValue.upsert({
                where: {
                    attributeId_slug: {
                        attributeId: created.id,
                        slug: valSlug,
                    },
                },
                update: { value: val },
                create: {
                    attributeId: created.id,
                    value: val,
                    slug: valSlug,
                    sortOrder: j + 1,
                },
            });

            console.log(`      • ${val}`);
        }
    }

    console.log("\n✅ Variation seed complete!");
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
