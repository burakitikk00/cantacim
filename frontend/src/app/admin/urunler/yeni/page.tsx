import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export default async function NewProductPage() {
    const [categories, brands, attributes] = await Promise.all([
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

    return (
        <ProductForm
            title="Yeni Ürün Ekle"
            categories={categories}
            brands={brands}
            attributes={attributes}
        />
    );
}
