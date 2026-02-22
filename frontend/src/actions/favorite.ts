"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db as prisma } from "../lib/db";
import { authOptions } from "../lib/auth";

export async function toggleFavorite(productId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    try {
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: user.id,
                    productId
                }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            revalidatePath("/hesap/favorilerim");
            return { success: true, action: "removed", message: "Favorilerden kaldırıldı" };
        } else {
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    productId
                }
            });
            revalidatePath("/hesap/favorilerim");
            return { success: true, action: "added", message: "Favorilere eklendi" };
        }
    } catch (error) {
        console.error("Toggle favorite error:", error);
        return { error: "Favori işlemi sırasında bir hata oluştu" };
    }
}

export async function getFavoriteProductIds(): Promise<string[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return [];
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        select: { productId: true }
    });

    return favorites.map(f => f.productId);
}

export async function getFavoriteCount(): Promise<number> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return 0;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return 0;
    }

    return prisma.favorite.count({
        where: { userId: user.id }
    });
}

export async function getFavoritesWithProducts() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return [];
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
            product: {
                include: {
                    category: true,
                    variants: {
                        include: {
                            attributes: {
                                include: {
                                    attributeValue: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return favorites.map(f => ({
        favoriteId: f.id,
        addedAt: f.createdAt.toISOString(),
        product: {
            id: f.product.id,
            name: f.product.name,
            slug: f.product.slug,
            basePrice: f.product.basePrice.toString(),
            images: f.product.images,
            category: {
                name: f.product.category.name,
                slug: f.product.category.slug
            },
            variants: f.product.variants.map(v => ({
                ...v,
                price: v.price.toString(),
                createdAt: v.createdAt.toISOString(),
                updatedAt: v.updatedAt.toISOString(),
            }))
        }
    }));
}
