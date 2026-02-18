"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export async function updateProduct(id: string, data: any) {
    try {
        // 1. Update Basic Info
        const { name, description, price, status, categoryId, images, variants } = data;

        await db.product.update({
            where: { id },
            data: {
                name,
                description,
                basePrice: price ? Number(price) : 0,
                isActive: status === 'Aktif',
                categoryId,
                images: images || [],
            }
        });

        // 2. Update Variants
        const existingVariants = await db.productVariant.findMany({
            where: { productId: id },
            select: { id: true }
        });
        const existingIds = existingVariants.map(v => v.id);
        const incomingIds = variants.map((v: any) => v.id).filter((vid: any) => typeof vid === 'string');

        // Delete removed variants
        const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
        if (toDelete.length > 0) {
            await db.productVariant.deleteMany({
                where: { id: { in: toDelete } }
            });
        }

        // Upsert variants
        for (const v of variants) {
            const variantData = {
                sku: v.sku || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                price: v.price ? Number(v.price) : Number(price),
                stock: v.stock ? Number(v.stock) : 0,
                image: v.image,
                productId: id
            };

            let variantId = typeof v.id === 'string' ? v.id : undefined;

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

            // Attributes
            await db.productVariantAttributeValue.deleteMany({
                where: { variantId: variantId }
            });

            if (v.color) await connectAttribute(variantId, "Renk", v.color);
            if (v.size) await connectAttribute(variantId, "Beden", v.size);
        }

        revalidatePath("/admin/urunler");
        revalidatePath(`/admin/urunler/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Ürün güncellenirken bir hata oluştu." };
    }
}

async function connectAttribute(variantId: string, attributeName: string, value: string) {
    const attribute = await db.attribute.findFirst({ where: { name: attributeName } });
    if (!attribute) return;

    // Find/Create AttributeValue
    let attrValue = await db.attributeValue.findFirst({
        where: { attributeId: attribute.id, value: value }
    });

    if (!attrValue) {
        const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        attrValue = await db.attributeValue.create({
            data: {
                attributeId: attribute.id,
                value: value,
                slug: slug
            }
        });
    }

    // Connect to Variant
    await db.productVariantAttributeValue.create({
        data: {
            variantId: variantId,
            attributeValueId: attrValue.id
        }
    });
}
