import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminPassword = await bcrypt.hash("Admin123!", 12);

    // Admin User
    await prisma.user.upsert({
        where: { email: "admin@linabutik.com" },
        update: {},
        create: {
            email: "admin@linabutik.com",
            name: "Admin",
            surname: "User",
            hashedPassword: adminPassword,
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });

    // Categories
    const categories = [
        { name: "Çantalar", slug: "cantalar" },
        { name: "Gözlükler", slug: "gozlukler" },
        { name: "Cüzdanlar", slug: "cuzdanlar" },
        { name: "Aksesuarlar", slug: "aksesuarlar" },
    ];

    const categoryMap = new Map();

    for (const c of categories) {
        const cat = await prisma.category.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
        categoryMap.set(c.slug, cat.id);
    }

    // Attributes
    const colorAttr = await prisma.attribute.upsert({
        where: { slug: "renk" },
        update: {},
        create: { name: "Renk", slug: "renk" },
    });

    const sizeAttr = await prisma.attribute.upsert({
        where: { slug: "beden" },
        update: {},
        create: { name: "Beden", slug: "beden" },
    });

    // Attribute Values
    const colors = ["Siyah", "Kırmızı", "Bej", "Taba", "Altın"];
    const sizes = ["Standart", "Nano", "Small", "Medium"];

    const attrValueMap = new Map();

    for (const color of colors) {
        const val = await prisma.attributeValue.upsert({
            where: { attributeId_slug: { attributeId: colorAttr.id, slug: color.toLowerCase() } },
            update: {},
            create: { attributeId: colorAttr.id, value: color, slug: color.toLowerCase() },
        });
        attrValueMap.set(`color:${color}`, val.id);
    }

    for (const size of sizes) {
        const val = await prisma.attributeValue.upsert({
            where: { attributeId_slug: { attributeId: sizeAttr.id, slug: size.toLowerCase() } },
            update: {},
            create: { attributeId: sizeAttr.id, value: size, slug: size.toLowerCase() },
        });
        attrValueMap.set(`size:${size}`, val.id);
    }

    // --- PRODUCTS ---

    // 1. Bag: Saint Laurent Loulou
    const bag1 = await prisma.product.upsert({
        where: { slug: "saint-laurent-loulou-medium" },
        update: {},
        create: {
            name: "Saint Laurent Loulou Medium Bag",
            slug: "saint-laurent-loulou-medium",
            description: "Kapitone deri, ikonik YSL logosu ve zincir askılı omuz çantası.",
            categoryId: categoryMap.get("cantalar"),
            basePrice: 45000,
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAnUsTKCO1TbwzbHR1ulJ_-pFNwTB43brmxykrNtuP29ysJcpIN4oNyC8XfVNQA1seLX-hW4GlvW0s7I7gO0KzTlgzYJBVjIKtqaMTy-brSlFCrG5rlMLL2dVym3ILSH2uUjxa6Ht0Md_j23ePBCchKhAnjoQi3Jht-vuGIO_O6OmimVdZ0uQANWWTOHIrvguzwWWlkYYM0zTg-6eSuo9oRyC4nbASg1agoI2HCo7TY0A1gAiBij0eO66zEuglXXvaScCWn6CtJU7jn"],
            isActive: true,
            isFeatured: true,
        },
    });

    // Variant for Bag 1
    await prisma.productVariant.upsert({
        where: { sku: "SL-LOULOU-001" },
        update: {},
        create: {
            productId: bag1.id,
            sku: "SL-LOULOU-001",
            price: 45000,
            stock: 5,
            attributes: {
                create: [
                    { attributeValueId: attrValueMap.get("color:Siyah") },
                    { attributeValueId: attrValueMap.get("size:Medium") },
                ]
            }
        },
    });

    // 2. Bag: Gucci Dionysus
    const bag2 = await prisma.product.upsert({
        where: { slug: "gucci-dionysus-mini" },
        update: {},
        create: {
            name: "Gucci Dionysus Mini Leather Bag",
            slug: "gucci-dionysus-mini",
            description: "Dokulu kaplan başı tokası ile tanımlanan mini çanta.",
            categoryId: categoryMap.get("cantalar"),
            basePrice: 24500,
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBwBQX8dRVkHZ2H1Gfv7OOzQm8AniVNCTWyGGjmrhY5nyRBLiBl1PMYRyFn-UfwsWbz-1WS38JCZpe53K_LGIheaxyU-6ariFK_I_u0UTgWpn_S_e7IwOhDjlu9GCdJ6DYkUSuevOvoPSFxdCmPqnd0Uyq1WoNC7fQHP5DbWraSxEpcP8hOTFIlsdQpKVT2YWG_ibtMmHgJiHJHVftQdvyCJMy4OZWaJsO6fITfMKWi1VYaU_cYYLso3ioFmpz13WEC5js5dR6KwW9g"],
            isActive: true,
            isFeatured: true,
        },
    });

    await prisma.productVariant.upsert({
        where: { sku: "GU-DIO-001" },
        update: {},
        create: {
            productId: bag2.id,
            sku: "GU-DIO-001",
            price: 24500,
            stock: 3,
            attributes: {
                create: [
                    { attributeValueId: attrValueMap.get("color:Bej") },
                    { attributeValueId: attrValueMap.get("size:Nano") },
                ]
            }
        },
    });

    // 3. Glasses: RayBan Hexagonal
    const glasses1 = await prisma.product.upsert({
        where: { slug: "rayban-hexagonal" },
        update: {},
        create: {
            name: "Ray-Ban Hexagonal Flat Lenses",
            slug: "rayban-hexagonal",
            description: "Altıgen şekilli metal çerçeve ve kristal camlar.",
            categoryId: categoryMap.get("gozlukler"),
            basePrice: 5500,
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC-dt8Aavkwzw5kXpmQ0WTv5H6k14yC5JgJydPYHirb_gcU0ZyJ9pXMW5UYO-LztnM8tmbKpGXGIbmpXbylOn5Tsw40x1MiuAWTR9CfSEE5M85pLHkEGaMIAZOXUFxNSx50FYVYptItRL0NCwo6AUMYCDGixhrS5DG18j0KHlZVaJXTduUBS8rA0pJkkgxssHpDNCBQpGBGkN5ob5Nu_EcfoQZoU6MLXaP0CBYDtXlLI8PcKmFaYXdmsyKuiaLquRaT9NDDZCwGnnVZ"],
            isActive: true,
        },
    });

    await prisma.productVariant.upsert({
        where: { sku: "RB-HEX-001" },
        update: {},
        create: {
            productId: glasses1.id,
            sku: "RB-HEX-001",
            price: 5500,
            stock: 10,
            attributes: {
                create: [
                    { attributeValueId: attrValueMap.get("color:Altın") },
                    { attributeValueId: attrValueMap.get("size:Standart") },
                ]
            }
        },
    });

    console.log("Seeding completed.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
