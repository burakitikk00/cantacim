"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Helpers ─────────────────────────────────────────
async function requireUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
        throw new Error("Oturum açmanız gerekiyor");
    }
    return (session.user as any).id as string;
}

const STATUS_MAP: Record<string, string> = {
    PENDING: "Bekliyor",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
    REFUNDED: "İade",
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    PREPARING: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    SHIPPED: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    DELIVERED: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    CANCELLED: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    REFUNDED: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
};

// ─── My Orders ───────────────────────────────────────
export async function getMyOrders() {
    const userId = await requireUser();

    const orders = await db.order.findMany({
        where: { userId },
        select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            subtotal: true,
            discount: true,
            total: true,
            status: true,
            cargoCompany: true,
            cargoTracking: true,
            coupon: { select: { code: true, discountValue: true, discountType: true } },
            items: {
                select: {
                    id: true,
                    quantity: true,
                    unitPrice: true,
                    total: true,
                    variant: {
                        select: {
                            price: true,
                            image: true,
                            product: {
                                select: { name: true, slug: true, images: true },
                            },
                            attributes: {
                                select: {
                                    attributeValue: {
                                        select: { value: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const fmt = (v: any) =>
        Number(v).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
        });

    return orders.map((o) => {
        // Calculate auto-discount total (difference between variant original price and order unit price)
        let autoDiscountTotal = 0;
        const mappedItems = o.items.map((item) => {
            const variantStr = item.variant.attributes
                .map((a) => a.attributeValue.value)
                .join(" / ");
            const img =
                item.variant.image ||
                (item.variant.product.images.length > 0
                    ? item.variant.product.images[0]
                    : null);
            const origPrice = Number(item.variant.price);
            const orderPrice = Number(item.unitPrice);
            const hasAutoDiscount = origPrice > orderPrice;
            if (hasAutoDiscount) {
                autoDiscountTotal += (origPrice - orderPrice) * item.quantity;
            }
            return {
                id: item.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                variant: variantStr || "-",
                unitPrice: fmt(item.unitPrice),
                originalUnitPrice: hasAutoDiscount ? fmt(origPrice) : null,
                totalPrice: fmt(item.total),
                quantity: item.quantity,
                image: img,
            };
        });

        const couponDiscountAmount = Number(o.discount);
        const totalSavings = autoDiscountTotal + couponDiscountAmount;

        // Build coupon display text with correct format
        let couponInfo: { code: string; discountText: string; discountAmount: string } | null = null;
        if (o.coupon) {
            let discountText = "";
            if (o.coupon.discountType === "PERCENTAGE") {
                discountText = `%${Number(o.coupon.discountValue)} indirim uygulandı`;
            } else if (o.coupon.discountType === "FIXED") {
                discountText = `${fmt(o.coupon.discountValue)} indirim uygulandı`;
            } else if (o.coupon.discountType === "FREE_SHIPPING") {
                discountText = `Ücretsiz kargo uygulandı`;
            } else if (o.coupon.discountType === "BUY_X_GET_Y") {
                discountText = `Al/Öde kampanyası uygulandı`;
            } else {
                discountText = `indirim uygulandı`;
            }
            couponInfo = {
                code: o.coupon.code,
                discountText,
                discountAmount: couponDiscountAmount > 0 ? `-${fmt(couponDiscountAmount)}` : "",
            };
        }

        // Calculate original total (sum of original prices)
        const originalItemsTotal = o.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

        return {
            id: o.orderNumber,
            dbId: o.id,
            date: o.createdAt.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            total: fmt(o.total),
            originalTotal: totalSavings > 0 ? fmt(originalItemsTotal) : null,
            status: STATUS_MAP[o.status] || o.status,
            statusColor: STATUS_COLOR[o.status] || "",
            coupon: couponInfo,
            autoDiscountTotal: autoDiscountTotal > 0 ? `-${fmt(autoDiscountTotal)}` : null,
            couponDiscountAmount: couponDiscountAmount > 0 ? `-${fmt(couponDiscountAmount)}` : null,
            cargoCompany: o.cargoCompany,
            cargoTracking: o.cargoTracking,
            items: mappedItems,
        };
    });
}

// ─── My Order Detail (IDOR protected) ────────────────
export async function getMyOrderDetail(orderIdentifier: string) {
    const userId = await requireUser();

    if (!orderIdentifier) throw new Error("Geçersiz sipariş ID");

    const order = await db.order.findFirst({
        where: {
            OR: [{ id: orderIdentifier }, { orderNumber: orderIdentifier }],
        },
        select: {
            id: true,
            orderNumber: true,
            userId: true,
            createdAt: true,
            status: true,
            subtotal: true,
            discount: true,
            shippingCost: true,
            total: true,
            cargoCompany: true,
            cargoTracking: true,
            coupon: { select: { code: true, discountValue: true, discountType: true } },
            address: {
                select: {
                    title: true,
                    fullName: true,
                    phone: true,
                    fullAddress: true,
                    neighborhood: true,
                    district: true,
                    city: true,
                },
            },
            items: {
                select: {
                    id: true,
                    quantity: true,
                    unitPrice: true,
                    total: true,
                    variant: {
                        select: {
                            price: true,
                            image: true,
                            product: {
                                select: { name: true, slug: true, images: true },
                            },
                            attributes: {
                                select: {
                                    attributeValue: {
                                        select: { value: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!order) throw new Error("Sipariş bulunamadı");

    // IDOR koruması: sadece kendi siparişini görebilir
    if (order.userId !== userId) {
        throw new Error("Bu siparişe erişim yetkiniz yok");
    }

    const fmt = (v: any) =>
        Number(v).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
        });

    // Calculate auto-discount total
    let autoDiscountTotal = 0;
    const mappedItems = order.items.map((item) => {
        const variantStr = item.variant.attributes
            .map((a) => a.attributeValue.value)
            .join(" / ");
        const img =
            item.variant.image ||
            (item.variant.product.images.length > 0
                ? item.variant.product.images[0]
                : null);
        const origPrice = Number(item.variant.price);
        const orderPrice = Number(item.unitPrice);
        const hasAutoDiscount = origPrice > orderPrice;
        if (hasAutoDiscount) {
            autoDiscountTotal += (origPrice - orderPrice) * item.quantity;
        }
        return {
            id: item.id,
            name: item.variant.product.name,
            slug: item.variant.product.slug,
            variant: variantStr || "-",
            unitPrice: fmt(item.unitPrice),
            originalUnitPrice: hasAutoDiscount ? fmt(origPrice) : null,
            totalPrice: fmt(item.total),
            quantity: item.quantity,
            image: img,
        };
    });

    const couponDiscountAmount = Number(order.discount);
    const originalItemsTotal = order.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

    // Build coupon display info
    let couponDisplay: { code: string; discountText: string } | null = null;
    if (order.coupon) {
        let discountText = "";
        if (order.coupon.discountType === "PERCENTAGE") {
            discountText = `%${Number(order.coupon.discountValue)} indirim`;
        } else if (order.coupon.discountType === "FIXED") {
            discountText = `${fmt(order.coupon.discountValue)} indirim`;
        } else if (order.coupon.discountType === "FREE_SHIPPING") {
            discountText = `Ücretsiz kargo`;
        } else if (order.coupon.discountType === "BUY_X_GET_Y") {
            discountText = `Al/Öde kampanyası`;
        } else {
            discountText = `indirim`;
        }
        couponDisplay = { code: order.coupon.code, discountText };
    }

    return {
        id: order.orderNumber,
        date: order.createdAt.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        status: STATUS_MAP[order.status] || order.status,
        statusColor: STATUS_COLOR[order.status] || "",
        cargoCompany: order.cargoCompany || null,
        cargoTracking: order.cargoTracking || null,
        subtotal: fmt(originalItemsTotal),
        shipping: fmt(order.shippingCost),
        autoDiscount: autoDiscountTotal > 0 ? `-${fmt(autoDiscountTotal)}` : null,
        couponDiscount: couponDiscountAmount > 0 ? `-${fmt(couponDiscountAmount)}` : null,
        couponDisplay,
        total: fmt(order.total),
        couponCode: order.coupon?.code || null,
        shippingAddress: {
            title: order.address.title,
            name: order.address.fullName,
            phone: order.address.phone,
            address: [order.address.fullAddress, order.address.neighborhood].filter(Boolean).join(", "),
            district: order.address.district,
            city: order.address.city,
        },
        items: mappedItems,
    };
}
