"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getReviews(page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            db.productReview.findMany({
                include: {
                    product: {
                        select: {
                            name: true,
                            slug: true,
                            images: true,
                            variants: {
                                select: { image: true },
                                where: { image: { not: null } },
                                take: 1
                            }
                        }
                    },
                    user: { select: { name: true, surname: true, email: true } },
                    order: { select: { orderNumber: true } }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.productReview.count(),
        ]);

        return {
            success: true,
            data: {
                reviews,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return { success: false, error: "Yorumlar getirilirken bir hata oluştu." };
    }
}

export async function approveReview(id: string) {
    try {
        await db.productReview.update({
            where: { id },
            data: { isApproved: true }
        });

        // Find product ID to revalidate its page
        const review = await db.productReview.findUnique({
            where: { id },
            select: { product: { select: { slug: true } } }
        });

        if (review?.product?.slug) {
            revalidatePath(`/urunler/${review.product.slug}`);
            revalidatePath("/admin/yorumlar");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to approve review:", error);
        return { success: false, error: "Yorum onaylanırken hata oluştu." };
    }
}

export async function unapproveReview(id: string) {
    try {
        await db.productReview.update({
            where: { id },
            data: { isApproved: false }
        });

        const review = await db.productReview.findUnique({
            where: { id },
            select: { product: { select: { slug: true } } }
        });

        if (review?.product?.slug) {
            revalidatePath(`/urunler/${review.product.slug}`);
            revalidatePath("/admin/yorumlar");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to unapprove review:", error);
        return { success: false, error: "Yorum onayı kaldırılırken hata oluştu." };
    }
}

export async function deleteReview(id: string) {
    try {
        const review = await db.productReview.findUnique({
            where: { id },
            select: { product: { select: { slug: true } } }
        });

        await db.productReview.delete({ where: { id } });

        if (review?.product?.slug) {
            revalidatePath(`/urunler/${review.product.slug}`);
            revalidatePath("/admin/yorumlar");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete review:", error);
        return { success: false, error: "Yorum silinirken hata oluştu." };
    }
}
