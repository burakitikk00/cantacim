import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveCampaigns, getBestDiscountForProduct } from "@/lib/discounts";

// Force dynamic rendering if we want real-time stock updates, or keep cached
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const product = await db.product.findUnique({
        where: { slug },
        include: {
            category: true,
            variants: {
                where: { isActive: true },
                include: {
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                            sortOrder: true,
                                            hasColor: true,
                                            createdAt: true,
                                            updatedAt: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            reviews: {
                where: { isApproved: true },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: { select: { name: true } }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!product) {
        notFound();
    }

    // Calculate discount
    const activeCampaigns = await getActiveCampaigns();
    const discountData = getBestDiscountForProduct(product, activeCampaigns);
    let discountInfo: { type: string; value: number; text: string } | null = null;
    
    if (discountData.discountType && discountData.discountValue !== undefined && discountData.discountText) {
        discountInfo = {
            type: discountData.discountType,
            value: discountData.discountValue,
            text: discountData.discountText
        };
    }

    // Calculate average rating
    const approvedReviews = product.reviews;
    const avgRating = approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

    // "Stilini Tamamla" — products from OTHER categories, max 8
    const recommendedProducts = await db.product.findMany({
        where: {
            isActive: true,
            categoryId: { not: product.categoryId },
            id: { not: product.id },
        },
        include: {
            category: true,
            variants: {
                where: { isActive: true },
                select: { image: true }
            }
        },
        take: 8,
        orderBy: { createdAt: "desc" }
    });

    // Check if user can review (has DELIVERED order with this product)
    let canReview = false;
    let reviewableOrderId: string | null = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        const deliveredOrderItem = await db.orderItem.findFirst({
            where: {
                order: {
                    userId: session.user.id,
                    status: "DELIVERED",
                },
                variant: { productId: product.id },
            },
            include: { order: true }
        });
        if (deliveredOrderItem) {
            // Check if user hasn't already reviewed this product for this order
            const existingReview = await db.productReview.findUnique({
                where: {
                    productId_userId_orderId: {
                        productId: product.id,
                        userId: session.user.id,
                        orderId: deliveredOrderItem.orderId
                    }
                }
            });
            if (!existingReview) {
                canReview = true;
                reviewableOrderId = deliveredOrderItem.orderId;
            }
        }
    }

    // Transform Decimal to string for serialization
    const serializedProduct = {
        ...product,
        basePrice: product.basePrice.toString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
        variants: product.variants.map((v) => ({
            ...v,
            price: v.price.toString(),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
            attributes: v.attributes.map((a) => ({
                attribute: {
                    name: a.attributeValue.attribute.name,
                    hasColor: a.attributeValue.attribute.hasColor,
                },
                attributeValue: a.attributeValue,
            })),
        })),
    };

    const serializedReviews = approvedReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        userName: r.user.name ? `${r.user.name.charAt(0)}${"*".repeat(Math.max(0, r.user.name.length - 1))}` : "Anonim"
    }));

    const serializedRecommended = recommendedProducts.map(p => {
        const pDiscountData = getBestDiscountForProduct(p, activeCampaigns);
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            basePrice: p.basePrice.toString(),
            images: p.images.length > 0 ? p.images : p.variants.map((v) => v.image).filter(Boolean) as string[],
            category: { name: p.category.name, slug: p.category.slug },
            discountedPrice: pDiscountData.discountedPrice?.toString() || null,
            discountText: pDiscountData.discountText || null,
        };
    });

    return (
        <ProductDetailClient
            product={serializedProduct}
            discount={discountInfo}
            reviews={serializedReviews}
            avgRating={avgRating}
            reviewCount={approvedReviews.length}
            recommendedProducts={serializedRecommended}
            canReview={canReview}
            reviewableOrderId={reviewableOrderId}
        />
    );
}
