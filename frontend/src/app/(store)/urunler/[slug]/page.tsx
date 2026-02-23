import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            discounts: {
                where: {
                    isActive: true,
                    startDate: { lte: new Date() },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: new Date() } }
                    ]
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
        },
    });

    if (!product) {
        notFound();
    }

    // Calculate discount
    let discountInfo: { type: string; value: number; text: string } | null = null;
    const activeDiscount = product.discounts[0]; // use first active discount
    if (activeDiscount) {
        discountInfo = {
            type: activeDiscount.discountType,
            value: Number(activeDiscount.value),
            text: activeDiscount.discountType === "PERCENTAGE"
                ? `%${Number(activeDiscount.value)} İndirim`
                : `${Number(activeDiscount.value)}₺ İndirim`
        };
    } else {
        // Check category-level discounts
        const categoryDiscount = await db.discount.findFirst({
            where: {
                isActive: true,
                startDate: { lte: new Date() },
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } }
                ],
                categories: { some: { id: product.categoryId } }
            },
            orderBy: { value: "desc" }
        });
        if (categoryDiscount) {
            discountInfo = {
                type: categoryDiscount.discountType,
                value: Number(categoryDiscount.value),
                text: categoryDiscount.discountType === "PERCENTAGE"
                    ? `%${Number(categoryDiscount.value)} İndirim`
                    : `${Number(categoryDiscount.value)}₺ İndirim`
            };
        }
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
            discounts: {
                where: {
                    isActive: true,
                    startDate: { lte: new Date() },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: new Date() } }
                    ]
                }
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
        const disc = p.discounts[0];
        let discountedPrice: number | null = null;
        let discountText: string | null = null;
        if (disc) {
            if (disc.discountType === "PERCENTAGE") {
                discountedPrice = Number(p.basePrice) * (1 - Number(disc.value) / 100);
                discountText = `%${Number(disc.value)} İndirim`;
            } else {
                discountedPrice = Number(p.basePrice) - Number(disc.value);
                discountText = `${Number(disc.value)}₺ İndirim`;
            }
        }
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            basePrice: p.basePrice.toString(),
            images: p.images,
            category: { name: p.category.name, slug: p.category.slug },
            discountedPrice: discountedPrice?.toString() || null,
            discountText,
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
