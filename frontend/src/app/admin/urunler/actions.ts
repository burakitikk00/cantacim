"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── SINGLE PRODUCT OPERATIONS ─────────────────────────────

export async function deleteProduct(id: string) {
    try {
        await db.product.delete({
            where: { id },
        });
        revalidatePath("/admin/urunler");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Ürün silinirken bir hata oluştu." };
    }
}

export async function createProduct(data: any) {
    try {
        const { name, description, price, status, categoryId, brandId, images, variants, sku } = data;

        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Math.random().toString(36).substr(2, 6);

        const product = await db.product.create({
            data: {
                name,
                slug,
                description: description || null,
                basePrice: price ? Number(price) : 0,
                isActive: status === 'Aktif',
                categoryId,
                brandId: brandId || null,
                images: images || [],
            }
        });

        if (variants && variants.length > 0) {
            for (const v of variants) {
                const variantSku = v.sku || sku || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                const newVariant = await db.productVariant.create({
                    data: {
                        sku: variantSku + '-' + Math.random().toString(36).substr(2, 3).toUpperCase(),
                        price: v.price ? Number(v.price) : Number(price) || 0,
                        stock: v.stock ? Number(v.stock) : 0,
                        image: v.image || null,
                        productId: product.id
                    }
                });

                // Connect attribute values by ID
                if (v.attributeValueIds && v.attributeValueIds.length > 0) {
                    for (const avId of v.attributeValueIds) {
                        await db.productVariantAttributeValue.create({
                            data: {
                                variantId: newVariant.id,
                                attributeValueId: avId
                            }
                        });
                    }
                }
            }
        }

        revalidatePath("/admin/urunler");
        return { success: true, id: product.id };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Ürün oluşturulurken bir hata oluştu." };
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        const { name, description, price, status, categoryId, brandId, images, variants } = data;

        await db.product.update({
            where: { id },
            data: {
                name,
                description,
                basePrice: price ? Number(price) : 0,
                isActive: status === 'Aktif',
                categoryId,
                brandId: brandId || null,
                images: images || [],
            }
        });

        const existingVariants = await db.productVariant.findMany({
            where: { productId: id },
            select: { id: true }
        });
        const existingIds = existingVariants.map(v => v.id);
        const incomingIds = (variants || []).map((v: any) => v.id).filter((vid: any) => typeof vid === 'string' && !vid.startsWith('temp-'));

        const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
        if (toDelete.length > 0) {
            await db.productVariant.deleteMany({
                where: { id: { in: toDelete } }
            });
        }

        for (const v of (variants || [])) {
            const variantData = {
                sku: v.sku || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                price: v.price ? Number(v.price) : Number(price),
                stock: v.stock ? Number(v.stock) : 0,
                image: v.image || null,
                productId: id
            };

            let variantId = (typeof v.id === 'string' && !v.id.startsWith('temp-')) ? v.id : undefined;

            if (variantId) {
                await db.productVariant.update({
                    where: { id: variantId },
                    data: variantData
                });
            } else {
                const newVariant = await db.productVariant.create({
                    data: variantData
                });
                variantId = newVariant.id;
            }

            // Clear old attribute connections
            await db.productVariantAttributeValue.deleteMany({
                where: { variantId: variantId }
            });

            // Connect attribute values by ID
            if (v.attributeValueIds && v.attributeValueIds.length > 0) {
                for (const avId of v.attributeValueIds) {
                    await db.productVariantAttributeValue.create({
                        data: {
                            variantId: variantId,
                            attributeValueId: avId
                        }
                    });
                }
            }
        }

        revalidatePath("/admin/urunler");
        revalidatePath(`/admin/urunler/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Ürün güncellenirken bir hata oluştu." };
    }
}

// ─── GET ALL PRODUCT IDS (with filter support) ─────────────

export async function getAllProductIds(filters?: any): Promise<string[]> {
    try {
        const where: any = {};

        if (filters) {
            // Date filters
            if (filters.dateStart || filters.dateEnd) {
                where.createdAt = {};
                if (filters.dateStart) where.createdAt.gte = new Date(filters.dateStart);
                if (filters.dateEnd) {
                    const endDate = new Date(filters.dateEnd);
                    endDate.setHours(23, 59, 59, 999);
                    where.createdAt.lte = endDate;
                }
            }

            // Price filters
            if (filters.priceMin) where.basePrice = { ...where.basePrice, gte: Number(filters.priceMin) };
            if (filters.priceMax) where.basePrice = { ...where.basePrice, lte: Number(filters.priceMax) };

            // Category filter
            if (filters.categoriesSelected?.length > 0) {
                where.category = { name: { in: filters.categoriesSelected } };
            }

            // Brand filter
            if (filters.brandsSelected?.length > 0) {
                where.brand = { name: { in: filters.brandsSelected } };
            }

            // Discount only
            if (filters.discountOnly) {
                where.discounts = { some: {} };
            }

            // Hidden only
            if (filters.hiddenOnly) {
                where.isActive = false;
            }
        }

        const products = await db.product.findMany({
            where,
            select: {
                id: true,
                variants: {
                    select: { stock: true }
                }
            }
        });

        // Post-filter for stock
        let filtered = products;
        if (filters?.stockMin || filters?.stockMax) {
            const sMin = filters.stockMin ? Number(filters.stockMin) : undefined;
            const sMax = filters.stockMax ? Number(filters.stockMax) : undefined;
            filtered = products.filter(p => {
                const totalStock = p.variants.reduce((acc: number, v: { stock: number }) => acc + v.stock, 0);
                if (sMin !== undefined && totalStock < sMin) return false;
                if (sMax !== undefined && totalStock > sMax) return false;
                return true;
            });
        }

        return filtered.map(p => p.id);
    } catch (error) {
        console.error("Failed to fetch product IDs:", error);
        return [];
    }
}

// ─── BULK OPERATIONS ───────────────────────────────────────

export async function bulkUpdateStock(ids: string[], stock: number): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        // Update all variants of selected products
        const result = await db.productVariant.updateMany({
            where: { productId: { in: ids } },
            data: { stock: stock }
        });

        revalidatePath("/admin/urunler");
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Failed to bulk update stock:", error);
        return { success: false, error: "Stok güncellenirken bir hata oluştu." };
    }
}

export async function bulkUpdateStatus(ids: string[], isActive: boolean): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        const result = await db.product.updateMany({
            where: { id: { in: ids } },
            data: { isActive }
        });

        revalidatePath("/admin/urunler");
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Failed to bulk update status:", error);
        return { success: false, error: "Durum güncellenirken bir hata oluştu." };
    }
}

export async function bulkApplyDiscount(
    ids: string[],
    discountPct: number,
    cancelExisting: boolean
): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        if (cancelExisting) {
            // Remove all discount relations for the selected products
            // Disconnect discounts from products by removing the relation
            for (const id of ids) {
                await db.product.update({
                    where: { id },
                    data: { discounts: { set: [] } }
                });
            }

            if (discountPct === 0 || !discountPct) {
                revalidatePath("/admin/urunler");
                return { success: true, count: ids.length };
            }
        }

        if (discountPct > 0) {
            // Apply discount by reducing the basePrice
            // Fetch current prices
            const products = await db.product.findMany({
                where: { id: { in: ids } },
                select: { id: true, basePrice: true }
            });

            const multiplier = 1 - (discountPct / 100);

            for (const product of products) {
                const currentPrice = Number(product.basePrice);
                const newPrice = Math.round(currentPrice * multiplier * 100) / 100;

                await db.product.update({
                    where: { id: product.id },
                    data: { basePrice: newPrice }
                });

                // Also update all variant prices
                await db.productVariant.updateMany({
                    where: { productId: product.id },
                    data: {
                        price: {
                            multiply: multiplier
                        }
                    }
                });
            }
        }

        revalidatePath("/admin/urunler");
        return { success: true, count: ids.length };
    } catch (error) {
        console.error("Failed to bulk apply discount:", error);
        return { success: false, error: "İndirim uygulanırken bir hata oluştu." };
    }
}

export async function bulkPriceIncreasePercent(
    ids: string[],
    percent: number
): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        const multiplier = 1 + (percent / 100);

        const products = await db.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, basePrice: true }
        });

        for (const product of products) {
            const currentPrice = Number(product.basePrice);
            const newPrice = Math.round(currentPrice * multiplier * 100) / 100;

            await db.product.update({
                where: { id: product.id },
                data: { basePrice: newPrice }
            });

            await db.productVariant.updateMany({
                where: { productId: product.id },
                data: {
                    price: {
                        multiply: multiplier
                    }
                }
            });
        }

        revalidatePath("/admin/urunler");
        return { success: true, count: products.length };
    } catch (error) {
        console.error("Failed to bulk price increase (percent):", error);
        return { success: false, error: "Yüzdesel fiyat artırımı uygulanırken bir hata oluştu." };
    }
}

export async function bulkPriceIncreaseFlat(
    ids: string[],
    amount: number
): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        const products = await db.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, basePrice: true }
        });

        for (const product of products) {
            const currentPrice = Number(product.basePrice);
            const newPrice = Math.round((currentPrice + amount) * 100) / 100;

            await db.product.update({
                where: { id: product.id },
                data: { basePrice: Math.max(0, newPrice) }
            });

            // Increment variant prices
            await db.productVariant.updateMany({
                where: { productId: product.id },
                data: {
                    price: {
                        increment: amount
                    }
                }
            });
        }

        revalidatePath("/admin/urunler");
        return { success: true, count: products.length };
    } catch (error) {
        console.error("Failed to bulk price increase (flat):", error);
        return { success: false, error: "Tutar bazlı fiyat artırımı uygulanırken bir hata oluştu." };
    }
}

export async function bulkDeleteProducts(ids: string[]): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        if (ids.length === 0) return { success: false, error: "Hiç ürün seçilmedi." };

        // Products have cascade delete on variants, so just delete products
        const result = await db.product.deleteMany({
            where: { id: { in: ids } }
        });

        revalidatePath("/admin/urunler");
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Failed to bulk delete products:", error);
        return { success: false, error: "Ürünler silinirken bir hata oluştu." };
    }
}
