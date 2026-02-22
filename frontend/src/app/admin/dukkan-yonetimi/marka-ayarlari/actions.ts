"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── HELPERS ──────────────────────────────────────────

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const REVALIDATE_PATH = "/admin/dukkan-yonetimi/marka-ayarlari";

// ─── READ ─────────────────────────────────────────────

export async function getBrands(search?: string) {
    try {
        const brands = await db.brand.findMany({
            where: search
                ? { name: { contains: search, mode: "insensitive" } }
                : undefined,
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: brands.map((b) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                isActive: b.isActive,
                productCount: b._count.products,
                createdAt: b.createdAt.toISOString().split("T")[0],
            })),
        };
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        return { success: false, error: "Markalar yüklenirken hata oluştu.", data: [] };
    }
}

// ─── CREATE ───────────────────────────────────────────

export async function createBrand(name: string) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Marka adı boş olamaz." };

        let slug = generateSlug(trimmed);

        const existing = await db.brand.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        await db.brand.create({
            data: {
                name: trimmed,
                slug,
                isActive: true,
            },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to create brand:", error);
        return { success: false, error: "Marka oluşturulurken hata oluştu." };
    }
}

// ─── UPDATE ───────────────────────────────────────────

export async function updateBrand(
    id: string,
    name: string,
    isActive: boolean
) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Marka adı boş olamaz." };

        const oldBrand = await db.brand.findUnique({ where: { id } });
        if (!oldBrand) return { success: false, error: "Marka bulunamadı." };

        let slug = oldBrand.slug;
        if (oldBrand.name !== trimmed) {
            slug = generateSlug(trimmed);
            const existingSlug = await db.brand.findFirst({
                where: { slug, NOT: { id } },
            });
            if (existingSlug) slug = `${slug}-${Date.now()}`;
        }

        await db.brand.update({
            where: { id },
            data: { name: trimmed, slug, isActive },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to update brand:", error);
        return { success: false, error: "Marka güncellenirken hata oluştu." };
    }
}

// ─── DELETE ───────────────────────────────────────────

export async function deleteBrand(id: string) {
    try {
        const brand = await db.brand.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });

        if (!brand) return { success: false, error: "Marka bulunamadı." };

        // Before deleting, check if used in products
        if (brand._count.products > 0) {
            // Unlink current products
            await db.product.updateMany({
                where: { brandId: id },
                data: { brandId: null },
            });
        }

        await db.brand.delete({ where: { id } });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete brand:", error);
        return { success: false, error: "Marka silinirken hata oluştu." };
    }
}
