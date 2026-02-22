import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

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
                                        select: { // explicitly select to avoid type errors with recent db additions not in generated types yet
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
            }
        },
    });

    if (!product) {
        notFound();
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

    return <ProductDetailClient product={serializedProduct} />;
}
