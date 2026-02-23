import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [product, categories, brands, attributes] = await Promise.all([
        db.product.findUnique({
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
                category: true,
                brand: true,
            }
        }),
        db.category.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        db.brand.findMany({
            where: { isActive: true },
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
        }),
        db.attribute.findMany({
            include: {
                values: {
                    orderBy: { sortOrder: "asc" },
                    select: { id: true, value: true, slug: true, colorCode: true },
                },
            },
            orderBy: { sortOrder: "asc" },
        }),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <ProductForm
            title="Ürünü Düzenle"
            initialData={product}
            categories={categories}
            brands={brands}
            attributes={attributes}
        />
    );
}
