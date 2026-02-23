"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── VALIDATION ───────────────────────────────────────

const couponCreateSchema = z.object({
    name: z.string().min(1, "İsim gerekli").max(100),
    code: z.string().min(2, "Kod en az 2 karakter").max(30).toUpperCase(),
    description: z.string().max(500).optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y", "FREE_SHIPPING"]),
    discountValue: z.number().min(0),
    discountMethod: z.enum(["AUTO", "CODE", "TIER", "USER"]),
    scope: z.enum(["ALL", "CATEGORIES", "PRODUCTS", "CATEGORIES_AND_PRODUCTS"]),
    minOrderTotal: z.number().min(0).optional().nullable(),
    maxUses: z.number().int().min(1).optional().nullable(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional().nullable(),
    isActive: z.boolean(),
    buyX: z.number().int().min(1).optional().nullable(),
    getY: z.number().int().min(1).optional().nullable(),
    targetTier: z.enum(["STANDARD", "ELITE", "PLATINUM"]).optional().nullable(),
    targetUserId: z.string().optional().nullable(),
    minRequirement: z.enum(["MIN_TOTAL", "MIN_QUANTITY"]).optional().nullable(),
    minReqValue: z.number().min(0).optional().nullable(),
    categoryIds: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
});

// ─── HELPERS ──────────────────────────────────────────

function sanitizeDecimal(val: number | null | undefined): number | undefined {
    if (val === null || val === undefined || val === 0) return undefined;
    return val;
}

// ─── READ ─────────────────────────────────────────────

export async function getCoupons() {
    try {
        const coupons = await db.coupon.findMany({
            include: {
                categories: { select: { id: true, name: true } },
                products: { select: { id: true, name: true } },
                targetUser: { select: { id: true, name: true, surname: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: coupons.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                description: c.description,
                discountType: c.discountType,
                discountValue: Number(c.discountValue),
                discountMethod: c.discountMethod,
                scope: c.scope,
                minOrderTotal: c.minOrderTotal ? Number(c.minOrderTotal) : null,
                maxUses: c.maxUses,
                usedCount: c.usedCount,
                isActive: c.isActive,
                validFrom: c.validFrom.toISOString(),
                validUntil: c.validUntil?.toISOString() || null,
                buyX: c.buyX,
                getY: c.getY,
                targetTier: c.targetTier,
                targetUserId: c.targetUserId,
                targetUser: c.targetUser,
                minRequirement: c.minRequirement,
                minReqValue: c.minReqValue ? Number(c.minReqValue) : null,
                categories: c.categories,
                products: c.products,
                createdAt: c.createdAt.toISOString(),
            })),
        };
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return { success: false, error: "Kuponlar yüklenirken hata oluştu.", data: [] };
    }
}

// ─── CREATE ───────────────────────────────────────────

export async function createCoupon(input: z.infer<typeof couponCreateSchema>) {
    try {
        const parsed = couponCreateSchema.safeParse(input);
        if (!parsed.success) {
            const firstErr = parsed.error.issues[0];
            return { success: false, error: firstErr?.message || "Geçersiz veri." };
        }
        const data = parsed.data;

        // Validate BUY_X_GET_Y specific fields
        if (data.discountType === "BUY_X_GET_Y") {
            if (!data.buyX || !data.getY) {
                return { success: false, error: "X Al Y Edin için X ve Y değerleri gerekli." };
            }
            if (data.getY >= data.buyX) {
                return { success: false, error: "Y değeri X'ten küçük olmalı." };
            }
        }

        // Validate PERCENTAGE range
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            return { success: false, error: "Yüzdesel indirim %100'den fazla olamaz." };
        }

        // Validate targeting
        if (data.discountMethod === "TIER" && !data.targetTier) {
            return { success: false, error: "Müşteri çeşidi seçimi için tier belirtilmeli." };
        }
        if (data.discountMethod === "USER" && !data.targetUserId) {
            return { success: false, error: "Müşteri seçimi için bir müşteri belirtilmeli." };
        }

        // Check unique code
        const existing = await db.coupon.findUnique({ where: { code: data.code } });
        if (existing) {
            return { success: false, error: "Bu kupon kodu zaten mevcut." };
        }

        // Validate dates
        const from = data.validFrom ? new Date(data.validFrom) : new Date();
        const until = data.validUntil ? new Date(data.validUntil) : null;
        if (until && until <= from) {
            return { success: false, error: "Bitiş tarihi başlangıç tarihinden sonra olmalı." };
        }

        await db.coupon.create({
            data: {
                name: data.name.trim(),
                code: data.code,
                description: data.description?.trim() || null,
                discountType: data.discountType,
                discountValue: data.discountType === "FREE_SHIPPING" || data.discountType === "BUY_X_GET_Y" ? 0 : data.discountValue,
                discountMethod: data.discountMethod,
                scope: data.scope,
                minOrderTotal: sanitizeDecimal(data.minOrderTotal),
                maxUses: data.maxUses || null,
                isActive: data.isActive,
                validFrom: from,
                validUntil: until,
                buyX: data.discountType === "BUY_X_GET_Y" ? data.buyX : null,
                getY: data.discountType === "BUY_X_GET_Y" ? data.getY : null,
                targetTier: data.discountMethod === "TIER" ? data.targetTier : null,
                targetUserId: data.discountMethod === "USER" ? data.targetUserId : null,
                minRequirement: data.minRequirement || null,
                minReqValue: sanitizeDecimal(data.minReqValue),
                categories: data.categoryIds?.length
                    ? { connect: data.categoryIds.map((id) => ({ id })) }
                    : undefined,
                products: data.productIds?.length
                    ? { connect: data.productIds.map((id) => ({ id })) }
                    : undefined,
            },
        });

        revalidatePath("/admin/indirimler");
        return { success: true };
    } catch (error) {
        console.error("Failed to create coupon:", error);
        return { success: false, error: "Kupon oluşturulurken hata oluştu." };
    }
}

// ─── UPDATE ───────────────────────────────────────────

export async function updateCoupon(id: string, input: z.infer<typeof couponCreateSchema>) {
    try {
        if (!id) return { success: false, error: "ID gerekli." };

        const parsed = couponCreateSchema.safeParse(input);
        if (!parsed.success) {
            const firstErr = parsed.error.issues[0];
            return { success: false, error: firstErr?.message || "Geçersiz veri." };
        }
        const data = parsed.data;

        const existing = await db.coupon.findUnique({ where: { id } });
        if (!existing) return { success: false, error: "Kupon bulunamadı." };

        // Validate BUY_X_GET_Y
        if (data.discountType === "BUY_X_GET_Y") {
            if (!data.buyX || !data.getY) {
                return { success: false, error: "X Al Y Edin için X ve Y değerleri gerekli." };
            }
            if (data.getY >= data.buyX) {
                return { success: false, error: "Y değeri X'ten küçük olmalı." };
            }
        }

        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            return { success: false, error: "Yüzdesel indirim %100'den fazla olamaz." };
        }

        if (data.discountMethod === "TIER" && !data.targetTier) {
            return { success: false, error: "Müşteri çeşidi seçimi için tier belirtilmeli." };
        }
        if (data.discountMethod === "USER" && !data.targetUserId) {
            return { success: false, error: "Müşteri seçimi için bir müşteri belirtilmeli." };
        }

        // Check unique code (exclude self)
        const codeExists = await db.coupon.findFirst({
            where: { code: data.code, NOT: { id } },
        });
        if (codeExists) {
            return { success: false, error: "Bu kupon kodu başka bir kuponda zaten mevcut." };
        }

        const from = data.validFrom ? new Date(data.validFrom) : new Date();
        const until = data.validUntil ? new Date(data.validUntil) : null;
        if (until && until <= from) {
            return { success: false, error: "Bitiş tarihi başlangıç tarihinden sonra olmalı." };
        }

        await db.coupon.update({
            where: { id },
            data: {
                name: data.name.trim(),
                code: data.code,
                description: data.description?.trim() || null,
                discountType: data.discountType,
                discountValue: data.discountType === "FREE_SHIPPING" || data.discountType === "BUY_X_GET_Y" ? 0 : data.discountValue,
                discountMethod: data.discountMethod,
                scope: data.scope,
                minOrderTotal: sanitizeDecimal(data.minOrderTotal),
                maxUses: data.maxUses || null,
                isActive: data.isActive,
                validFrom: from,
                validUntil: until,
                buyX: data.discountType === "BUY_X_GET_Y" ? data.buyX : null,
                getY: data.discountType === "BUY_X_GET_Y" ? data.getY : null,
                targetTier: data.discountMethod === "TIER" ? data.targetTier : null,
                targetUserId: data.discountMethod === "USER" ? data.targetUserId : null,
                minRequirement: data.minRequirement || null,
                minReqValue: sanitizeDecimal(data.minReqValue),
                categories: {
                    set: [],
                    connect: (data.categoryIds || []).map((cid) => ({ id: cid })),
                },
                products: {
                    set: [],
                    connect: (data.productIds || []).map((pid) => ({ id: pid })),
                },
            },
        });

        revalidatePath("/admin/indirimler");
        return { success: true };
    } catch (error) {
        console.error("Failed to update coupon:", error);
        return { success: false, error: "Kupon güncellenirken hata oluştu." };
    }
}

// ─── TOGGLE STATUS ────────────────────────────────────

export async function toggleCouponStatus(id: string) {
    try {
        const coupon = await db.coupon.findUnique({ where: { id } });
        if (!coupon) return { success: false, error: "Kupon bulunamadı." };

        await db.coupon.update({
            where: { id },
            data: { isActive: !coupon.isActive },
        });

        revalidatePath("/admin/indirimler");
        return { success: true, isActive: !coupon.isActive };
    } catch (error) {
        console.error("Failed to toggle coupon:", error);
        return { success: false, error: "Durum değiştirilirken hata oluştu." };
    }
}

// ─── DELETE ───────────────────────────────────────────

export async function deleteCoupon(id: string) {
    try {
        const coupon = await db.coupon.findUnique({ where: { id } });
        if (!coupon) return { success: false, error: "Kupon bulunamadı." };

        // Check if coupon has been used in orders
        const usedInOrders = await db.order.count({ where: { couponId: id } });
        if (usedInOrders > 0) {
            return {
                success: false,
                error: `Bu kupon ${usedInOrders} siparişte kullanılmış. Silmek yerine pasife çekin.`,
            };
        }

        await db.coupon.delete({ where: { id } });

        revalidatePath("/admin/indirimler");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete coupon:", error);
        return { success: false, error: "Kupon silinirken hata oluştu." };
    }
}

// ─── SELECT DATA ──────────────────────────────────────

export async function getCategoriesForSelect() {
    try {
        const categories = await db.category.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { success: false, data: [] };
    }
}

export async function getProductsForSelect(search?: string) {
    try {
        const products = await db.product.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                ...(search
                    ? { name: { contains: search, mode: "insensitive" as const } }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                basePrice: true,
                images: true,
            },
            orderBy: { name: "asc" },
            take: 50,
        });
        return {
            success: true,
            data: products.map((p) => ({
                id: p.id,
                name: p.name,
                price: Number(p.basePrice),
                image: p.images[0] || null,
            })),
        };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, data: [] };
    }
}

export async function getUsersForSelect(search?: string) {
    try {
        const users = await db.user.findMany({
            where: {
                role: "USER",
                isActive: true,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" as const } },
                            { surname: { contains: search, mode: "insensitive" as const } },
                            { email: { contains: search, mode: "insensitive" as const } },
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                tier: true,
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, data: [] };
    }
}
