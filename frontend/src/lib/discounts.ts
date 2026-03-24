import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type ActiveCampaign = {
    id: string;
    code: string;
    discountType: string;
    discountValue: Prisma.Decimal;
    discountMethod: string;
    scope: string;
    buyX: number | null;
    getY: number | null;
    categories: { id: string }[];
    products: { id: string }[];
};

export async function getActiveCampaigns() {
    return await db.coupon.findMany({
        where: {
            isActive: true,
            validFrom: { lte: new Date() },
            OR: [
                { validUntil: null },
                { validUntil: { gte: new Date() } }
            ],
            discountMethod: { in: ["AUTO", "CODE"] }, // We show both automatic and code-based campaigns
        },
        select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            discountMethod: true,
            scope: true,
            buyX: true,
            getY: true,
            categories: { select: { id: true } },
            products: { select: { id: true } },
        }
    });
}

export function getBestDiscountForProduct(
    product: { id: string; categoryId: string; basePrice: number | string | Prisma.Decimal },
    campaigns: ActiveCampaign[]
) {
    let bestDiscountedPrice: number | undefined = undefined;
    let bestDiscountText: string | undefined = undefined;
    let bestDiscountPercent: number = 0;
    let bestDiscountType: string | undefined = undefined;
    let bestDiscountValue: number | undefined = undefined;
    
    const basePriceNum = Number(product.basePrice);

    for (const c of campaigns) {
        // Check if applicable
        let applicable = false;
        if (c.scope === "ALL") {
            applicable = true;
        } else if (c.scope === "CATEGORIES") {
            applicable = c.categories.some(cat => cat.id === product.categoryId);
        } else if (c.scope === "PRODUCTS") {
            applicable = c.products.some(p => p.id === product.id);
        } else if (c.scope === "CATEGORIES_AND_PRODUCTS") {
            applicable = c.categories.some(cat => cat.id === product.categoryId) || c.products.some(p => p.id === product.id);
        }

        if (!applicable) continue;

        let currentDiscountedPrice: number | undefined = undefined;
        let currentDiscountText: string | undefined = undefined;
        let currentPercent: number = 0;
        
        const valueNum = Number(c.discountValue);

        if (c.discountType === "PERCENTAGE") {
            currentDiscountedPrice = basePriceNum * (1 - valueNum / 100);
            currentPercent = valueNum;
            currentDiscountText = `%${valueNum} İndirim`;
        } else if (c.discountType === "FIXED") {
            currentDiscountedPrice = Math.max(0, basePriceNum - valueNum);
            currentPercent = basePriceNum > 0 ? (valueNum / basePriceNum) * 100 : 0;
            currentDiscountText = `${valueNum}₺ İndirim`;
        } else if (c.discountType === "BUY_X_GET_Y" && c.buyX && c.getY) {
            currentDiscountText = `${c.buyX} Al ${c.getY} Öde`;
            // BUY X GET Y doesn't drop the unit price directly on the card
            currentDiscountedPrice = undefined;
            // Fake a small percent so it gets picked over "no discount" but less than actual price drops
            currentPercent = 1; 
        } else if (c.discountType === "FREE_SHIPPING") {
            currentDiscountText = `Ücretsiz Kargo`;
            currentDiscountedPrice = undefined;
            currentPercent = 0.5;
        }

        if (currentDiscountText && c.discountMethod === "CODE") {
             currentDiscountText += ` (Kod: ${c.code})`;
        }

        // We want to pick the discount that gives the lowest price (highest percent)
        // If it's the first applicable coupon, we take it. Or if it's better than the previous one.
        if (
            bestDiscountText === undefined || 
            currentPercent > bestDiscountPercent
        ) {
            bestDiscountedPrice = currentDiscountedPrice;
            bestDiscountText = currentDiscountText;
            bestDiscountPercent = currentPercent;
            bestDiscountType = c.discountType;
            bestDiscountValue = valueNum;
        }
    }

    return {
        discountedPrice: bestDiscountedPrice,
        discountText: bestDiscountText,
        discountPercent: bestDiscountPercent,
        discountType: bestDiscountType,
        discountValue: bestDiscountValue,
    };
}
