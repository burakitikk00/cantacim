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

const UNCATEGORIZED_SLUG = "kategorisiz";

async function ensureUncategorized(): Promise<string> {
    let cat = await db.category.findUnique({
        where: { slug: UNCATEGORIZED_SLUG },
    });
    if (!cat) {
        cat = await db.category.create({
            data: {
                name: "Kategorisiz",
                slug: UNCATEGORIZED_SLUG,
                isActive: true,
                sortOrder: 9999,
            },
        });
    }
    return cat.id;
}

// ─── READ ─────────────────────────────────────────────

export async function getCategories(search?: string) {
    try {
        const categories = await db.category.findMany({
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
            data: categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                isActive: c.isActive,
                productCount: c._count.products,
                createdAt: c.createdAt.toISOString().split("T")[0],
            })),
        };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { success: false, error: "Kategoriler yüklenirken hata oluştu.", data: [] };
    }
}

// ─── CREATE ───────────────────────────────────────────

export async function createCategory(name: string) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Kategori adı boş olamaz." };

        let slug = generateSlug(trimmed);

        // Ensure unique slug
        const existing = await db.category.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        await db.category.create({
            data: {
                name: trimmed,
                slug,
                isActive: true,
            },
        });

        revalidatePath("/admin/dukkan-yonetimi/kategori-ayarlari");
        return { success: true };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Kategori oluşturulurken hata oluştu." };
    }
}

// ─── UPDATE ───────────────────────────────────────────

export async function updateCategory(
    id: string,
    name: string,
    isActive: boolean
) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Kategori adı boş olamaz." };

        // Get old state
        const oldCategory = await db.category.findUnique({ where: { id } });
        if (!oldCategory) return { success: false, error: "Kategori bulunamadı." };

        // Cannot deactivate "Kategorisiz"
        if (oldCategory.slug === UNCATEGORIZED_SLUG && !isActive) {
            return { success: false, error: "'Kategorisiz' kategorisi pasif yapılamaz." };
        }

        let slug = oldCategory.slug;
        // Only regenerate slug if name changed
        if (oldCategory.name !== trimmed) {
            slug = generateSlug(trimmed);
            const existingSlug = await db.category.findFirst({
                where: { slug, NOT: { id } },
            });
            if (existingSlug) slug = `${slug}-${Date.now()}`;
        }

        // Handle status change
        const wasActive = oldCategory.isActive;
        const nowActive = isActive;

        // Active → Passive: move products to Kategorisiz
        if (wasActive && !nowActive) {
            const uncategorizedId = await ensureUncategorized();
            await db.product.updateMany({
                where: { categoryId: id, originalCategoryId: null },
                data: {
                    originalCategoryId: id,
                    categoryId: uncategorizedId,
                },
            });
        }

        // Passive → Active: move products back
        if (!wasActive && nowActive) {
            await db.product.updateMany({
                where: { originalCategoryId: id },
                data: {
                    categoryId: id,
                    originalCategoryId: null,
                },
            });
        }

        await db.category.update({
            where: { id },
            data: { name: trimmed, slug, isActive },
        });

        revalidatePath("/admin/dukkan-yonetimi/kategori-ayarlari");
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { success: false, error: "Kategori güncellenirken hata oluştu." };
    }
}

// ─── DELETE ───────────────────────────────────────────

export async function deleteCategory(id: string) {
    try {
        const category = await db.category.findUnique({ where: { id } });
        if (!category) return { success: false, error: "Kategori bulunamadı." };

        // Cannot delete "Kategorisiz" itself
        if (category.slug === UNCATEGORIZED_SLUG) {
            return { success: false, error: "'Kategorisiz' kategorisi silinemez." };
        }

        const uncategorizedId = await ensureUncategorized();

        // Move products to Kategorisiz
        await db.product.updateMany({
            where: { categoryId: id },
            data: {
                categoryId: uncategorizedId,
                originalCategoryId: null, // No going back after delete
            },
        });

        // Also clear originalCategoryId pointing to this category
        await db.product.updateMany({
            where: { originalCategoryId: id },
            data: { originalCategoryId: null },
        });

        await db.category.delete({ where: { id } });

        revalidatePath("/admin/dukkan-yonetimi/kategori-ayarlari");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "Kategori silinirken hata oluştu." };
    }
}
