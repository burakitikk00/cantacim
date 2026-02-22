"use server";

import { getServerSession } from "next-auth";
import { db as prisma } from "../lib/db";
import { authOptions } from "../lib/auth";

// ─── TYPES ────────────────────────────────────────────
interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    images: string[];
    category: { name: string; slug: string };
}

// ─── JACCARD BENZERLİK ───────────────────────────────
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;

    let intersectionSize = 0;
    for (const item of a) {
        if (b.has(item)) intersectionSize++;
    }

    const unionSize = a.size + b.size - intersectionSize;
    return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

// ─── K-NN KOMŞU BULMA ────────────────────────────────
function findKNearestNeighbors(
    targetUserId: string,
    userProductMap: Map<string, Set<string>>,
    K: number = 5
): string[] {
    const targetSet = userProductMap.get(targetUserId);
    if (!targetSet || targetSet.size === 0) return [];

    const scores: Array<[string, number]> = [];

    for (const [uid, productSet] of userProductMap.entries()) {
        if (uid === targetUserId) continue;
        if (productSet.size === 0) continue;

        const similarity = jaccardSimilarity(targetSet, productSet);
        if (similarity > 0) {
            scores.push([uid, similarity]);
        }
    }

    // Yüksekten düşüğe sırala
    scores.sort((a, b) => b[1] - a[1]);

    return scores.slice(0, K).map(s => s[0]);
}

// ─── ANA ÖNERİ FONKSİYONU ────────────────────────────
export async function getRecommendations(limit: number = 6): Promise<RecommendedProduct[]> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return [];

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return [];

        // 1️⃣ Tüm favori verilerini çek (tüm kullanıcılar)
        const allFavorites = await prisma.favorite.findMany({
            select: { userId: true, productId: true },
        });

        // 2️⃣ Kullanıcı-Ürün Map oluştur
        const userProductMap = new Map<string, Set<string>>();
        for (const fav of allFavorites) {
            if (!userProductMap.has(fav.userId)) {
                userProductMap.set(fav.userId, new Set());
            }
            userProductMap.get(fav.userId)!.add(fav.productId);
        }

        const targetSet = userProductMap.get(user.id);
        if (!targetSet || targetSet.size === 0) return [];

        // 3️⃣ K-NN ile en yakın komşuları bul
        const neighbors = findKNearestNeighbors(user.id, userProductMap, 5);

        // 4️⃣ Komşuların favori olduğu ama hedef kullanıcının favori olmadığı ürünleri topla
        const candidateScore = new Map<string, number>();

        for (const neighborId of neighbors) {
            const neighborSet = userProductMap.get(neighborId)!;
            for (const productId of neighborSet) {
                if (!targetSet.has(productId)) {
                    candidateScore.set(
                        productId,
                        (candidateScore.get(productId) ?? 0) + 1
                    );
                }
            }
        }

        // 5️⃣ En yüksek puanlı ürünleri sırala
        let recommendedIds = [...candidateScore.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(e => e[0]);

        // 6️⃣ FALLBACK: Yeterli öneri yoksa aynı kategorideki popüler ürünleri getir
        if (recommendedIds.length < limit) {
            const remaining = limit - recommendedIds.length;
            const userFavoriteProducts = await prisma.product.findMany({
                where: { id: { in: [...targetSet] } },
                select: { categoryId: true },
            });

            const categoryIds = [...new Set(userFavoriteProducts.map(p => p.categoryId))];

            // Favori kategorilerindeki ürünleri, en çok favorilenen sıralamasıyla getir
            const fallbackProducts = await prisma.product.findMany({
                where: {
                    categoryId: { in: categoryIds },
                    isActive: true,
                    id: {
                        notIn: [...targetSet, ...recommendedIds],
                    },
                },
                include: {
                    _count: {
                        select: { favorites: true },
                    },
                },
                orderBy: {
                    favorites: { _count: "desc" },
                },
                take: remaining,
            });

            recommendedIds = [
                ...recommendedIds,
                ...fallbackProducts.map(p => p.id),
            ];
        }

        if (recommendedIds.length === 0) return [];

        // 7️⃣ Ürün detaylarını çek (variant görselleri dahil)
        const products = await prisma.product.findMany({
            where: {
                id: { in: recommendedIds },
                isActive: true,
            },
            include: {
                category: { select: { name: true, slug: true } },
                variants: { select: { image: true }, where: { isActive: true } },
            },
        });

        // Sıralama: recommendedIds sırasına göre
        const productMap = new Map(products.map(p => [p.id, p]));
        const ordered = recommendedIds
            .map(id => productMap.get(id))
            .filter(Boolean);

        // Serializable hale getir (Decimal → string)
        return ordered.map(p => {
            // Ürün görseli yoksa variant görselini kullan
            const variantImage = p!.variants.find(v => v.image)?.image;
            const images = p!.images.length > 0
                ? p!.images
                : variantImage ? [variantImage] : [];

            return {
                id: p!.id,
                name: p!.name,
                slug: p!.slug,
                basePrice: p!.basePrice.toString(),
                images,
                category: {
                    name: p!.category.name,
                    slug: p!.category.slug,
                },
            };
        });
    } catch (error) {
        console.error("Recommendation error:", error);
        return [];
    }
}
