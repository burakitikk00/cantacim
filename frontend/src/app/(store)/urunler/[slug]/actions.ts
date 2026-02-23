"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addToCart(variantId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Giriş yapmalısınız." };
        }

        const variant = await db.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant || !variant.isActive) {
            return { success: false, error: "Varyant bulunamadı." };
        }

        if (variant.stock <= 0) {
            return { success: false, error: "Bu ürün stokta yok." };
        }

        // Upsert cart item
        await db.cartItem.upsert({
            where: {
                userId_variantId: {
                    userId: session.user.id,
                    variantId,
                }
            },
            update: {
                quantity: { increment: 1 }
            },
            create: {
                userId: session.user.id,
                variantId,
                quantity: 1,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to add to cart:", error);
        return { success: false, error: "Sepete eklenirken hata oluştu." };
    }
}

export async function subscribeStockNotification(variantId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Giriş yapmalısınız." };
        }

        await db.stockNotification.upsert({
            where: {
                userId_variantId: {
                    userId: session.user.id,
                    variantId,
                }
            },
            update: {},
            create: {
                userId: session.user.id,
                variantId,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to subscribe:", error);
        return { success: false, error: "Bildirim kaydı oluşturulamadı." };
    }
}

export async function submitReview(data: {
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Giriş yapmalısınız." };
        }

        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: "Geçersiz puan." };
        }

        // Verify user has a delivered order with this product
        const deliveredOrderItem = await db.orderItem.findFirst({
            where: {
                orderId: data.orderId,
                order: {
                    userId: session.user.id,
                    status: "DELIVERED",
                },
                variant: { productId: data.productId },
            },
        });

        if (!deliveredOrderItem) {
            return { success: false, error: "Bu ürün için yorum yapma yetkiniz yok." };
        }

        // Check if already reviewed
        const existingReview = await db.productReview.findUnique({
            where: {
                productId_userId_orderId: {
                    productId: data.productId,
                    userId: session.user.id,
                    orderId: data.orderId,
                }
            }
        });

        if (existingReview) {
            return { success: false, error: "Bu sipariş için zaten yorum yaptınız." };
        }

        await db.productReview.create({
            data: {
                productId: data.productId,
                userId: session.user.id,
                orderId: data.orderId,
                rating: data.rating,
                comment: data.comment?.trim() || null,
            }
        });

        revalidatePath(`/urunler`);
        return { success: true };
    } catch (error) {
        console.error("Failed to submit review:", error);
        return { success: false, error: "Yorum gönderilirken hata oluştu." };
    }
}
