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
    // Net TL cinsinden indirim tutarı üzerinden karşılaştırma yapmak için
    let bestNetSaving: number = 0;
    
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
        let currentNetSaving: number = 0;
        
        const valueNum = Number(c.discountValue);

        if (c.discountType === "PERCENTAGE") {
            currentDiscountedPrice = basePriceNum * (1 - valueNum / 100);
            currentPercent = valueNum;
            currentNetSaving = basePriceNum - currentDiscountedPrice;
            currentDiscountText = `%${valueNum} İndirim`;
        } else if (c.discountType === "FIXED") {
            currentDiscountedPrice = Math.max(0, basePriceNum - valueNum);
            currentPercent = basePriceNum > 0 ? (valueNum / basePriceNum) * 100 : 0;
            currentNetSaving = Math.min(valueNum, basePriceNum);
            currentDiscountText = `${valueNum}₺ İndirim`;
        } else if (c.discountType === "BUY_X_GET_Y" && c.buyX && c.getY) {
            currentDiscountText = `${c.buyX} Al ${c.getY} Öde`;
            // BUY X GET Y doesn't drop the unit price directly on the card
            currentDiscountedPrice = undefined;
            // Tahmini birim başına tasarruf: (buyX - getY) / buyX * birim fiyat
            const freeItems = c.buyX - c.getY;
            currentNetSaving = (freeItems / c.buyX) * basePriceNum;
            currentPercent = (freeItems / c.buyX) * 100;
        } else if (c.discountType === "FREE_SHIPPING") {
            currentDiscountText = `Ücretsiz Kargo`;
            currentDiscountedPrice = undefined;
            // Tahmini kargo bedeli tasarrufu (sabit değer)
            currentNetSaving = 50;
            currentPercent = 0;
        }

        if (currentDiscountText && c.discountMethod === "CODE") {
             currentDiscountText += ` (Kod: ${c.code})`;
        }

        // Net TL tasarrufu üzerinden en iyi indirimi seç
        if (
            bestDiscountText === undefined || 
            currentNetSaving > bestNetSaving
        ) {
            bestDiscountedPrice = currentDiscountedPrice;
            bestDiscountText = currentDiscountText;
            bestDiscountPercent = currentPercent;
            bestDiscountType = c.discountType;
            bestDiscountValue = valueNum;
            bestNetSaving = currentNetSaving;
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
