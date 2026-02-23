"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/api-helpers";

/**
 * Fetches coupons that are visible to the current user.
 * Includes:
 * - General coupons (no tier/user targeting)
 * - Coupons targeting the user's tier
 * - Coupons targeting the user specifically
 */
export async function getMyVisibleCoupons() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Oturum bulunamadı.", data: [] };
        }

        const now = new Date();

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
                            // General coupons (no targeting)
                            { targetTier: null, targetUserId: null },
                            // Coupons matching user's tier
                            { targetTier: user.tier },
                            // Coupons targeting this specific user
                            { targetUserId: user.id },
                        ],
                    },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        // Filter out maxUses exceeded coupons
        const activeCoupons = coupons.filter(
            (c) => !c.maxUses || c.usedCount < c.maxUses
        );

        return {
            success: true,
            data: activeCoupons.map((c) => ({
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
            })),
        };
    } catch (error) {
        console.error("Failed to fetch visible coupons:", error);
        return { success: false, error: "Kuponlar yüklenirken hata oluştu.", data: [] };
    }
}
