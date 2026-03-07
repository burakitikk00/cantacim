"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/api-helpers";

/**
 * Fetches coupons that are visible to the current user.
 * Includes:
 * - General coupons (no tier/user targeting, not CODE type)
 * - Coupons targeting the user's tier
 * - Coupons targeting the user specifically
 * - Coupons the user has claimed via code (UserCoupon table)
 * Also returns used coupons with isUsed flag.
 */
export async function getMyVisibleCoupons() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Oturum bulunamadı.", data: [] };
        }

        const now = new Date();

        // Get coupon IDs the user has claimed via code
        const claimedRecords = await db.userCoupon.findMany({
            where: { userId: user.id },
            select: { couponId: true },
        });
        const claimedCouponIds = claimedRecords.map((r) => r.couponId);

        const coupons = await db.coupon.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                AND: [
                    {
                        OR: [
                            { validUntil: null },
                            { validUntil: { gte: now } },
                        ],
                    },
                    {
                        OR: [
                            // General coupons (no targeting) — exclude CODE method
                            {
                                targetTier: null,
                                targetUserId: null,
                                discountMethod: { not: "CODE" },
                            },
                            // Coupons matching user's tier
                            { targetTier: user.tier },
                            // Coupons targeting this specific user
                            { targetUserId: user.id },
                            // Coupons the user has claimed via code entry
                            ...(claimedCouponIds.length > 0
                                ? [{ id: { in: claimedCouponIds } }]
                                : []),
                        ],
                    },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        // Filter out maxUses exceeded coupons (but keep claimed ones)
        const activeCoupons = coupons.filter(
            (c) => !c.maxUses || c.usedCount < c.maxUses || claimedCouponIds.includes(c.id)
        );

        // Get all coupon IDs the user has already used (in orders)
        const usedOrders = await db.order.findMany({
            where: {
                userId: user.id,
                couponId: { not: null },
            },
            select: { couponId: true },
        });
        const usedCouponIds = new Set(usedOrders.map((o) => o.couponId));

        // Separate into available and used
        const availableCoupons = activeCoupons.filter(
            (c) => !usedCouponIds.has(c.id)
        );
        const usedCouponsFromActive = activeCoupons.filter(
            (c) => usedCouponIds.has(c.id)
        );

        // Also fetch used coupons that might have expired or been deactivated
        // but were used by this user (so they still see them)
        const usedButExpiredCoupons = await db.coupon.findMany({
            where: {
                id: { in: Array.from(usedCouponIds).filter(Boolean) as string[] },
                NOT: {
                    id: { in: activeCoupons.map((c) => c.id) },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const mapCoupon = (c: typeof coupons[0], isUsed: boolean) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            description: c.description,
            discountType: c.discountType,
            discountValue: Number(c.discountValue),
            buyX: c.buyX,
            getY: c.getY,
            validUntil: c.validUntil?.toISOString() || null,
            maxUses: c.maxUses,
            usedCount: c.usedCount,
            isUsed,
        });

        const data = [
            ...availableCoupons.map((c) => mapCoupon(c, false)),
            ...usedCouponsFromActive.map((c) => mapCoupon(c, true)),
            ...usedButExpiredCoupons.map((c) => mapCoupon(c, true)),
        ];

        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch visible coupons:", error);
        return { success: false, error: "Kuponlar yüklenirken hata oluştu.", data: [] };
    }
}

/**
 * Apply a coupon code to the user's account.
 * Validates the code, saves it to UserCoupon table, and returns the coupon data.
 */
export async function applyCouponCode(code: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Oturum bulunamadı." };
        }

        const trimmedCode = code.trim().toUpperCase();
        if (!trimmedCode) {
            return { success: false, error: "Kupon kodu boş olamaz." };
        }

        // Find coupon by code
        const coupon = await db.coupon.findUnique({
            where: { code: trimmedCode },
        });

        if (!coupon) {
            return { success: false, error: "Kupon kodu bulunamadı." };
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return { success: false, error: "Bu kupon kodu artık aktif değil." };
        }

        // Check date validity
        const now = new Date();
        if (coupon.validFrom > now) {
            return { success: false, error: "Bu kupon henüz geçerli değil." };
        }
        if (coupon.validUntil && coupon.validUntil < now) {
            return { success: false, error: "Bu kupon kodunun süresi dolmuş." };
        }

        // Check max uses
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { success: false, error: "Bu kupon kodunun kullanım limiti dolmuş." };
        }

        // Check targeting — user must be eligible
        if (coupon.targetUserId && coupon.targetUserId !== user.id) {
            return { success: false, error: "Bu kupon kodu size tanımlı değil." };
        }
        if (coupon.targetTier && coupon.targetTier !== user.tier) {
            return { success: false, error: "Bu kupon kodu üyelik seviyenize uygun değil." };
        }

        // Check if user already used this coupon (in an order)
        const existingOrder = await db.order.findFirst({
            where: {
                userId: user.id,
                couponId: coupon.id,
            },
        });
        if (existingOrder) {
            return { success: false, error: "Bu kupon kodunu zaten kullandınız." };
        }

        // Check if coupon is already claimed by this user
        const existingClaim = await db.userCoupon.findUnique({
            where: {
                userId_couponId: {
                    userId: user.id,
                    couponId: coupon.id,
                },
            },
        });

        // If not CODE type, check if it's already visible to the user
        if (coupon.discountMethod !== "CODE") {
            const isAlreadyVisible =
                (!coupon.targetTier && !coupon.targetUserId) ||
                coupon.targetTier === user.tier ||
                coupon.targetUserId === user.id;

            if (isAlreadyVisible) {
                return { success: false, error: "Bu kupon zaten hesabınızda tanımlı." };
            }
        }

        if (existingClaim) {
            return { success: false, error: "Bu kupon zaten hesabınıza eklenmiş." };
        }

        // Save the claim to UserCoupon table (persists across page refreshes)
        await db.userCoupon.create({
            data: {
                userId: user.id,
                couponId: coupon.id,
            },
        });

        // Success — return the coupon data
        return {
            success: true,
            data: {
                id: coupon.id,
                name: coupon.name,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: Number(coupon.discountValue),
                buyX: coupon.buyX,
                getY: coupon.getY,
                validUntil: coupon.validUntil?.toISOString() || null,
                maxUses: coupon.maxUses,
                usedCount: coupon.usedCount,
                isUsed: false,
            },
        };
    } catch (error) {
        console.error("Failed to apply coupon code:", error);
        return { success: false, error: "Kupon kodu uygulanırken bir hata oluştu." };
    }
}
