"use server";

import { db } from "@/lib/db";
import { getActiveCampaigns, getBestDiscountForProduct } from "@/lib/discounts";

export async function searchProducts(query: string) {
    if (!query || query.trim().length < 2) return [];

    const products = await db.product.findMany({
        where: {
            isActive: true,
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { category: { name: { contains: query, mode: "insensitive" } } },
            ]
        },
        include: {
            category: true,
            variants: {
                take: 1
            }
        },
        take: 10,
        orderBy: {
            createdAt: "desc"
        }
    });

    const activeCampaigns = await getActiveCampaigns();

    return products.map(p => {
        const discountData = getBestDiscountForProduct(p, activeCampaigns);
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: p.images[0] || p.variants[0]?.image || "",
            price: p.basePrice.toNumber(),
            discountedPrice: discountData.discountedPrice,
            categoryName: p.category.name
        };
    });
}
