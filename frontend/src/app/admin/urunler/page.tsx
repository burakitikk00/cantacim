import Link from "next/link";
import { db } from "@/lib/db";
import ProductManagementUI from "./ProductManagementUI";

export const dynamic = "force-dynamic";

interface SearchParams {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    dateStart?: string;
    dateEnd?: string;
    stockMin?: string;
    stockMax?: string;
    priceMin?: string;
    priceMax?: string;
    categories?: string;
    brands?: string;
    discountOnly?: string;
    hiddenOnly?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 25;
    const skip = (page - 1) * pageSize;

    // --- Build WHERE clause ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Date filter
    if (params.dateStart || params.dateEnd) {
        where.createdAt = {};
        if (params.dateStart) where.createdAt.gte = new Date(params.dateStart);
        if (params.dateEnd) {
            const endDate = new Date(params.dateEnd);
            endDate.setHours(23, 59, 59, 999);
            where.createdAt.lte = endDate;
        }
    }

    // Price filter (basePrice)
    if (params.priceMin || params.priceMax) {
        where.basePrice = {};
        if (params.priceMin) where.basePrice.gte = Number(params.priceMin);
        if (params.priceMax) where.basePrice.lte = Number(params.priceMax);
    }

    // Category filter (comma separated names)
    if (params.categories) {
        const catNames = params.categories.split(",").filter(Boolean);
        if (catNames.length > 0) {
            where.category = { name: { in: catNames } };
        }
    }

    // Brand filter (comma separated names)
    if (params.brands) {
        const brandNames = params.brands.split(",").filter(Boolean);
        if (brandNames.length > 0) {
            where.brand = { name: { in: brandNames } };
        }
    }

    // Discount only (products that have at least one active discount relation)
    if (params.discountOnly === "true") {
        where.discounts = { some: {} };
    }

    // Hidden only (inactive products)
    if (params.hiddenOnly === "true") {
        where.isActive = false;
    }

    // --- Build ORDER BY ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

    if (params.sortBy === "price") {
        orderBy = { basePrice: sortOrder };
    } else if (params.sortBy === "name") {
        orderBy = { name: sortOrder };
    } else {
        orderBy = { createdAt: sortOrder };
    }

    // --- Fetch data ---
    const [productsData, totalCount, categoriesData, brandsData] = await Promise.all([
        db.product.findMany({
            take: pageSize,
            skip: skip,
            where,
            include: {
                category: true,
                brand: true,
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
                discounts: {
                    where: { isActive: true },
                    select: { id: true },
                },
            },
            orderBy,
        }),
        db.product.count({ where }),
        db.category.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        db.brand.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    // Post-filter for stock (since stock is on variants, not product directly)
    let filteredProducts = productsData;
    if (params.stockMin || params.stockMax) {
        const sMin = params.stockMin ? Number(params.stockMin) : undefined;
        const sMax = params.stockMax ? Number(params.stockMax) : undefined;

        filteredProducts = productsData.filter(p => {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
            if (sMin !== undefined && totalStock < sMin) return false;
            if (sMax !== undefined && totalStock > sMax) return false;
            return true;
        });
    }

    const products = JSON.parse(JSON.stringify(filteredProducts));
    // For stock-filtered results, use filtered count; otherwise use DB count
    const effectiveCount = (params.stockMin || params.stockMax) ? filteredProducts.length : totalCount;
    const totalPages = Math.ceil(effectiveCount / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Mağazanızdaki tüm ürünleri buradan yönetebilirsiniz. Toplam {effectiveCount} ürün.
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

            <ProductManagementUI
                products={products}
                currentPage={page}
                totalPages={totalPages}
                totalCount={effectiveCount}
                categories={categoriesData}
                brands={brandsData}
            />
        </div>
    );
}
