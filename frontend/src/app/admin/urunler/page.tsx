import Link from "next/link";
import { db } from "@/lib/db";
import ProductTable from "./ProductTable";
import { serializeData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const pageSize = 25;
    const skip = (page - 1) * pageSize;

    const [productsData, totalCount] = await Promise.all([
        db.product.findMany({
            take: pageSize,
            skip: skip,
            include: {
                category: true,
                variants: {
                    include: {
                        attributes: {
                            include: {
                                attributeValue: {
                                    include: {
                                        attribute: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        sku: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        db.product.count()
    ]);

    const products = serializeData(productsData);
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Mağazanızdaki tüm ürünleri buradan yönetebilirsiniz. Toplam {totalCount} ürün.
                    </p>
                </div>
                <Link
                    href="/admin/urunler/yeni"
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF007F] text-white rounded-lg hover:bg-[#D6006B] transition-colors text-sm font-medium"
                >
                    <span className="material-icons text-lg">add</span>
                    Yeni Ürün Ekle
                </Link>
            </div>

            <ProductTable
                products={products}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
