"use server";

import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStoreSettings } from "./settings";
import { calculateShippingCost, StoreSettingsParams } from "@/utils/shipping";
import { OrderStatus } from "@prisma/client";
import { getActiveCampaigns, getBestDiscountForProduct } from "@/lib/discounts";

export async function createOrder(data: {
    items: { variantId: string; quantity: number }[];
    addressId: string;
    shippingMethod: string;
    couponCode?: string | null;
    paymentInfo?: { bank?: string; brand?: string; last4?: string };
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Oturum açmanız gerekiyor." };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { success: false, error: "Kullanıcı bulunamadı." };
        }

        if (!data.items || data.items.length === 0) {
            return { success: false, error: "Sepetiniz boş." };
        }

        const address = await prisma.address.findUnique({
            where: { id: data.addressId },
        });

        if (!address || address.userId !== user.id) {
            return { success: false, error: "Adres geçersiz veya size ait değil." };
        }

        // Fetch variants to verify prices
        const variantIds = data.items.map(item => item.variantId);
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true },
        });

        if (variants.length !== data.items.length) {
            return { success: false, error: "Bazı ürünler bulunamadı." };
        }

        const activeCampaigns = await getActiveCampaigns();
        
        let subtotal = 0;

        const enrichedItems = data.items.map(item => {
            const variant = variants.find(v => v.id === item.variantId)!;
            const discountData = getBestDiscountForProduct(variant.product, activeCampaigns);
            
            let price = Number(variant.price);
            let isDiscountedThisItem = false;

            if (discountData.discountType === "PERCENTAGE" || discountData.discountType === "FIXED") {
                if (discountData.discountedPrice !== undefined) {
                    price = discountData.discountedPrice;
                    isDiscountedThisItem = true;
                }
            }

            subtotal += price * item.quantity;

            return {
                ...item,
                price,
                originalPrice: Number(variant.price),
                isDiscounted: isDiscountedThisItem,
                productName: variant.product.name,
                productId: variant.product.id,
                categoryId: variant.product.categoryId,
            };
        });

        // Handle Coupon
        let discountAmount = 0;
        let couponToUse: any = null;
        let isFreeShippingCoupon = false;

        if (data.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: data.couponCode },
                include: { products: { select: { id: true } }, categories: { select: { id: true } } },
            });

            if (coupon) {
                const now = new Date();
                const isValidDate = coupon.validFrom <= now && (!coupon.validUntil || coupon.validUntil >= now);
                const isUnderMaxUses = !coupon.maxUses || coupon.usedCount < coupon.maxUses;

                if (coupon.isActive && isValidDate && isUnderMaxUses) {
                    // Check if user has already used this coupon (one time use per user limit)
                    const previousUsage = await prisma.order.findFirst({
                        where: { userId: user.id, couponId: coupon.id }
                    });

                    if (previousUsage) {
                        return { success: false, error: "Bu kuponu daha önce kullandınız." };
                    }

                    couponToUse = coupon;

                    // Check scope: filter enriched items that the coupon applies to
                    const isItemInScope = (item: typeof enrichedItems[0]) => {
                        const scope = coupon.scope || 'ALL';
                        if (scope === 'ALL') return true;
                        
                        const productIds = coupon.products.map(p => p.id);
                        const categoryIds = coupon.categories.map(c => c.id);

                        if (scope === 'PRODUCTS') return productIds.includes(item.productId);
                        if (scope === 'CATEGORIES') return categoryIds.includes(item.categoryId);
                        if (scope === 'CATEGORIES_AND_PRODUCTS') {
                            return productIds.includes(item.productId) || categoryIds.includes(item.categoryId);
                        }
                        return true;
                    };

                    const eligibleItems = enrichedItems.filter(isItemInScope);
                    const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.price * i.quantity, 0);

                    if (eligibleSubtotal === 0 && coupon.discountType !== 'FREE_SHIPPING') {
                        return { success: false, error: "Kupon sepetinizdeki ürünler için geçerli değil." };
                    }

                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = eligibleSubtotal * (Number(coupon.discountValue) / 100);
                    } else if (coupon.discountType === 'FIXED') {
                        discountAmount = Math.min(Number(coupon.discountValue), eligibleSubtotal);
                    } else if (coupon.discountType === 'FREE_SHIPPING') {
                        isFreeShippingCoupon = true;
                    } else if (coupon.discountType === 'BUY_X_GET_Y') {
                        if (coupon.buyX && coupon.getY) {
                            const allUnitPrices: number[] = [];
                            eligibleItems.forEach(item => {
                                for (let i = 0; i < item.quantity; i++) {
                                    allUnitPrices.push(item.price);
                                }
                            });
                            allUnitPrices.sort((a, b) => a - b);
                            const totalQty = allUnitPrices.length;
                            const freeCountPerSet = coupon.buyX - coupon.getY;
                            const sets = Math.floor(totalQty / coupon.buyX);
                            const totalFreeCount = sets * freeCountPerSet;
                            for (let i = 0; i < totalFreeCount; i++) {
                                discountAmount += allUnitPrices[i];
                            }
                        }
                    }

                    discountAmount = Math.min(discountAmount, eligibleSubtotal);
                } else {
                    return { success: false, error: "Kupon süresi dolmuş, tükenmiş veya pasif." };
                }
            } else {
                return { success: false, error: "Kupon bulunamadı." };
            }
        }

        // Calculate Shipping
        let shippingCost = 0;
        if (!isFreeShippingCoupon) {
            const settingsRes = await getStoreSettings();
            if (settingsRes.success && settingsRes.data) {
                const settings = settingsRes.data as unknown as StoreSettingsParams;
                const paramForShipping = enrichedItems.map(i => ({ quantity: i.quantity, price: i.price }));
                const parseId = parseInt(data.shippingMethod);
                shippingCost = calculateShippingCost(settings, paramForShipping, isNaN(parseId) ? undefined : parseId);
            }
        }

        const totalCost = subtotal + shippingCost - discountAmount;

        const orderNumber = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Date.now().toString().slice(-4);

        // Transaction for Order Creation and Coupon Update
        const order = await prisma.$transaction(async (tx) => {
            // Update Coupon Usage
            if (couponToUse) {
                const newUsedCount = couponToUse.usedCount + 1;
                let newIsActive = couponToUse.isActive;
                if (couponToUse.maxUses && newUsedCount >= couponToUse.maxUses) {
                    newIsActive = false; // Disable if reached max uses
                }

                await tx.coupon.update({
                    where: { id: couponToUse.id },
                    data: {
                        usedCount: newUsedCount,
                        isActive: newIsActive,
                    }
                });
            }

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId: user.id,
                    addressId: address.id,
                    status: OrderStatus.PENDING,
                    subtotal: subtotal,
                    discount: discountAmount,
                    shippingCost: shippingCost,
                    total: totalCost,
                    couponId: couponToUse?.id || null,
                    items: {
                        create: enrichedItems.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            total: item.price * item.quantity,
                        }))
                    }
                }
            });

            // Update Stock
            for (const item of enrichedItems) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        return { success: true, orderId: order.id };

    } catch (error: any) {
        console.error("Sipariş oluşturma hatası:", error);
        return { success: false, error: error.message || "Sipariş oluşturulurken bir hata oluştu." };
    }
}
