import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await db.product.findUnique({
        where: { id },
        include: {
            variants: {
                include: {
                    attributes: {
                        include: {
                            attributeValue: {
                                include: { attribute: true }
                            }
                        }
                    }
                }
            },
            category: true
        }
    });

    if (!product) {
        notFound();
    }

    const categories = await db.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
    });

    return <ProductForm title="Ürünü Düzenle" initialData={product} categories={categories} />;
}
