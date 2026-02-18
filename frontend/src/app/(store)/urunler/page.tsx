import { db } from "@/lib/db";
import ProductsClient from "./ProductsClient";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const { page, minPrice, maxPrice, sort } = params;

    const rawCat = params.cat;
    // Normalize category to array
    const categorySlugs = Array.isArray(rawCat)
        ? rawCat
        : typeof rawCat === "string"
            ? [rawCat]
            : [];

    const currentPage = typeof page === "string" ? parseInt(page) : 1;
    const itemsPerPage = 24;

    const min = typeof minPrice === "string" ? parseFloat(minPrice) : undefined;
    const max = typeof maxPrice === "string" ? parseFloat(maxPrice) : undefined;

    // Fetch Attributes for Sidebar
    const attributes = await db.attribute.findMany({
        include: {
            values: {
                orderBy: { sortOrder: 'asc' }
            }
        },
        orderBy: { sortOrder: 'asc' }
    });

    // 1. Identify valid attribute slugs
    const attributeSlugs = attributes.map(a => a.slug);

    // 2. Parse selected attributes from params
    const selectedAttributes: Record<string, string[]> = {};
    for (const key of Object.keys(params)) {
        if (attributeSlugs.includes(key)) {
            const val = params[key];
            if (val) {
                selectedAttributes[key] = Array.isArray(val) ? val : [val];
            }
        }
    }

    // 3. Construct Where Clause
    const where: Prisma.ProductWhereInput = {
        isActive: true,
        // Category Filter (OR logic: product in ANY of selected categories)
        ...(categorySlugs.length > 0 && {
            category: { slug: { in: categorySlugs } }
        }),
        // Price Filter
        ...((min !== undefined || max !== undefined) && {
            basePrice: {
                ...(min !== undefined && { gte: min }),
                ...(max !== undefined && { lte: max }),
            }
        })
    };

    // Attribute Filter (AND logic: product must match ALL selected attribute TYPES)
    if (Object.keys(selectedAttributes).length > 0) {
        where.AND = Object.entries(selectedAttributes).map(([_, values]) => ({
            variants: {
                some: {
                    attributes: {
                        some: {
                            attributeValue: {
                                slug: { in: values }
                            }
                        }
                    }
                }
            }
        }));
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { basePrice: "asc" };
    else if (sort === "price_desc") orderBy = { basePrice: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const totalItems = await db.product.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const products = await db.product.findMany({
        where,
        include: {
            category: true,
            variants: {
                include: {
                    attributes: {
                        include: {
                            attributeValue: true
                        }
                    }
                }
            },
        },
        orderBy,
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
    });

    const serializedProducts = products.map(p => ({
        ...p,
        basePrice: p.basePrice.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        category: {
            ...p.category,
            createdAt: p.category.createdAt.toISOString(),
            updatedAt: p.category.updatedAt.toISOString(),
        },
        variants: p.variants.map(v => ({
            ...v,
            price: v.price.toString(),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
        }))
    }));

    const categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
    });

    return (
        <ProductsClient
            products={serializedProducts}
            categories={categories}
            attributes={attributes}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );
}
