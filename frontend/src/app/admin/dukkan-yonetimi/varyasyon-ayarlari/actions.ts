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

const REVALIDATE_PATH = "/admin/dukkan-yonetimi/varyasyon-ayarlari";

// ─── READ ─────────────────────────────────────────────

export async function getAttributes() {
    try {
        const attributes = await db.attribute.findMany({
            include: {
                values: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        _count: { select: { variants: true } },
                    },
                },
            },
            orderBy: { sortOrder: "asc" },
        });

        return {
            success: true,
            data: attributes.map((a) => ({
                id: a.id,
                name: a.name,
                slug: a.slug,
                hasColor: a.hasColor,
                sortOrder: a.sortOrder,
                values: a.values.map((v) => ({
                    id: v.id,
                    value: v.value,
                    slug: v.slug,
                    colorCode: v.colorCode,
                    productCount: v._count.variants,
                })),
                productCount: a.values.reduce((sum, v) => sum + v._count.variants, 0),
            })),
        };
    } catch (error) {
        console.error("Failed to fetch attributes:", error);
        return { success: false, error: "Özellikler yüklenirken hata oluştu.", data: [] };
    }
}

// ─── CREATE ATTRIBUTE ─────────────────────────────────

export async function createAttribute(name: string, hasColor: boolean = false) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Özellik adı boş olamaz." };

        let slug = generateSlug(trimmed);

        const existing = await db.attribute.findUnique({ where: { slug } });
        if (existing) {
            return { success: false, error: "Bu isimde bir özellik zaten mevcut." };
        }

        // Determine next sort order
        const maxSort = await db.attribute.aggregate({ _max: { sortOrder: true } });
        const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

        await db.attribute.create({
            data: {
                name: trimmed,
                slug,
                hasColor,
                sortOrder: nextSort,
            },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to create attribute:", error);
        return { success: false, error: "Özellik oluşturulurken hata oluştu." };
    }
}

// ─── UPDATE ATTRIBUTE ─────────────────────────────────

export async function updateAttribute(id: string, name: string, hasColor: boolean = false) {
    try {
        const trimmed = name.trim();
        if (!trimmed) return { success: false, error: "Özellik adı boş olamaz." };

        const old = await db.attribute.findUnique({ where: { id } });
        if (!old) return { success: false, error: "Özellik bulunamadı." };

        let slug = old.slug;
        if (old.name !== trimmed) {
            slug = generateSlug(trimmed);
            const existingSlug = await db.attribute.findFirst({
                where: { slug, NOT: { id } },
            });
            if (existingSlug) {
                return { success: false, error: "Bu isimde bir özellik zaten mevcut." };
            }
        }

        await db.attribute.update({
            where: { id },
            data: { name: trimmed, slug, hasColor },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to update attribute:", error);
        return { success: false, error: "Özellik güncellenirken hata oluştu." };
    }
}

// ─── DELETE ATTRIBUTE ─────────────────────────────────

export async function deleteAttribute(id: string) {
    try {
        const attribute = await db.attribute.findUnique({ where: { id } });
        if (!attribute) return { success: false, error: "Özellik bulunamadı." };

        // Cascade delete handles values + variant associations
        await db.attribute.delete({ where: { id } });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete attribute:", error);
        return { success: false, error: "Özellik silinirken hata oluştu." };
    }
}

// ─── CREATE ATTRIBUTE VALUE ───────────────────────────

export async function createAttributeValue(attributeId: string, value: string, colorCode?: string) {
    try {
        const trimmed = value.trim();
        if (!trimmed) return { success: false, error: "Değer boş olamaz." };

        const slug = generateSlug(trimmed);

        // Check if value already exists for this attribute
        const existing = await db.attributeValue.findUnique({
            where: { attributeId_slug: { attributeId, slug } },
        });
        if (existing) {
            return { success: false, error: "Bu değer zaten mevcut." };
        }

        // Determine next sort order
        const maxSort = await db.attributeValue.aggregate({
            where: { attributeId },
            _max: { sortOrder: true },
        });
        const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

        await db.attributeValue.create({
            data: {
                attributeId,
                value: trimmed,
                slug,
                colorCode,
                sortOrder: nextSort,
            },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to create attribute value:", error);
        return { success: false, error: "Değer eklenirken hata oluştu." };
    }
}

// ─── UPDATE ATTRIBUTE VALUE COLOR ─────────────────────

export async function updateAttributeValueColor(id: string, colorCode: string) {
    try {
        await db.attributeValue.update({
            where: { id },
            data: { colorCode },
        });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to update attribute value color:", error);
        return { success: false, error: "Renk güncellenirken hata oluştu." };
    }
}

// ─── DELETE ATTRIBUTE VALUE ───────────────────────────

export async function deleteAttributeValue(id: string) {
    try {
        const value = await db.attributeValue.findUnique({
            where: { id },
            include: { _count: { select: { variants: true } } },
        });
        if (!value) return { success: false, error: "Değer bulunamadı." };

        if (value._count.variants > 0) {
            return {
                success: false,
                error: `Bu değer ${value._count.variants} üründe kullanılıyor. Önce ürünlerden kaldırın.`,
            };
        }

        await db.attributeValue.delete({ where: { id } });

        revalidatePath(REVALIDATE_PATH);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete attribute value:", error);
        return { success: false, error: "Değer silinirken hata oluştu." };
    }
}
