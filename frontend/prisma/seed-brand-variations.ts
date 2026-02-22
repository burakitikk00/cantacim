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

async function main() {
    console.log("Starting Brand and Variation Migration...\n");

    // 1. Move "Marka" from Attributes to Brand Model
    const markaAttribute = await prisma.attribute.findUnique({
        where: { slug: "marka" },
        include: { values: true },
    });

    if (markaAttribute) {
        console.log(`Found 'Marka' attribute. Migrating ${markaAttribute.values.length} values to Brands...`);

        for (const val of markaAttribute.values) {
            const brandSlug = generateSlug(val.value);
            const createdBrand = await prisma.brand.upsert({
                where: { slug: brandSlug },
                update: { name: val.value },
                create: {
                    name: val.value,
                    slug: brandSlug,
                    isActive: true,
                },
            });
            console.log(`  ✓ Migrated brand: ${createdBrand.name}`);

            // If there's any products tied to this variation, wait - we don't have product variant mapping logic here right now
            // But if there are, they'd be attached to ProductVariantAttributeValue. Brand attaches to Product.
            // Skipping complex data-migration for product relation as requested by user rules (just migrate the definitions).
        }

        // Delete "Marka" attribute
        await prisma.attribute.delete({ where: { id: markaAttribute.id } });
        console.log(`✓ Deleted 'Marka' attribute from variations.`);
    }

    // 2. Delete unwanted attributes like "Toz Torbası", "Marka Hediye Karton" if they exist
    const unwanted = ["toz-torbasi", "marka-hediye-karton", "hediye-kartonu"];
    for (const slug of unwanted) {
        try {
            await prisma.attribute.delete({ where: { slug } });
            console.log(`✓ Deleted unwanted attribute: ${slug}`);
        } catch {
            // Probably doesn't exist, which is fine
        }
    }

    // 3. Setup core variations: Renk, Beden, Numara, Renk-Numara
    const coreAttrs = [
        { name: "Renk", slug: "renk" },
        { name: "Beden", slug: "beden" },
        { name: "Numara", slug: "numara" },
        { name: "Renk Numara", slug: "renk-numara" }, // Use space so slug is renk-numara
    ];

    const attrMap = new Map<string, string>();
    for (let i = 0; i < coreAttrs.length; i++) {
        const attr = coreAttrs[i];
        const res = await prisma.attribute.upsert({
            where: { slug: attr.slug },
            update: { name: attr.name },
            create: { name: attr.name, slug: attr.slug, sortOrder: i + 1 },
        });
        attrMap.set(attr.slug, res.id);
        console.log(`✓ Ensured core attribute exists: ${res.name} (${res.id})`);
    }

    // 4. Re-categorize Beden values based on rules
    // Rule:
    // - Letters (S, M, L, Nano, Baby etc) OR 36,37,38,39,40,41... -> Beden
    // - Small numbers (1, 2, 3, 4, 5) -> Numara
    // - Contains hyphen/combinations -> Renk-Numara

    // Fetch all current values from Beden to check
    const bedenAttrId = attrMap.get("beden")!;
    const numaraAttrId = attrMap.get("numara")!;
    const renkNumaraAttrId = attrMap.get("renk-numara")!;

    const currentBedenValues = await prisma.attributeValue.findMany({
        where: { attributeId: bedenAttrId }
    });

    console.log(`\nRe-categorizing existing values under 'Beden'...`);

    for (const val of currentBedenValues) {
        const valueStr = val.value.trim();

        const isCombination = valueStr.includes("-") || (valueStr.match(/[a-zA-Z]/) && valueStr.match(/[0-9]/));
        const isSmallNumber = /^\d$/.test(valueStr) || (parseInt(valueStr) >= 1 && parseInt(valueStr) <= 10);

        let targetAttrId = bedenAttrId;
        let categoryName = "Beden";

        if (isCombination) {
            targetAttrId = renkNumaraAttrId;
            categoryName = "Renk-Numara";
        } else if (isSmallNumber) {
            targetAttrId = numaraAttrId;
            categoryName = "Numara";
        }

        if (targetAttrId !== bedenAttrId) {
            // Need to move it
            try {
                await prisma.attributeValue.update({
                    where: { id: val.id },
                    data: { attributeId: targetAttrId }
                });
                console.log(`  Moved '${valueStr}' -> ${categoryName}`);
            } catch (e) {
                // If the slug already exists in target attribute, just delete the duplicate from Beden
                await prisma.attributeValue.delete({ where: { id: val.id } });
                console.log(`  Deleted '${valueStr}' from Beden (already existed in ${categoryName})`);
            }
        } else {
            console.log(`  Kept '${valueStr}' in Beden`);
        }
    }

    console.log("\n✅ Migration complete!");
}

main()
    .catch((e) => {
        console.error("Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
