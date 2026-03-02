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

    return orders.map((o) => ({
        id: o.orderNumber,
        dbId: o.id,
        date: o.createdAt.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        total: fmt(o.total),
        originalTotal: Number(o.discount) > 0 ? fmt(Number(o.subtotal)) : null,
        status: STATUS_MAP[o.status] || o.status,
        statusColor: STATUS_COLOR[o.status] || "",
        coupon: o.coupon
            ? {
                code: o.coupon.code,
                discount: `-${fmt(o.coupon.discountValue)}`,
            }
            : null,
        cargoCompany: o.cargoCompany,
        cargoTracking: o.cargoTracking,
        items: o.items.map((item) => {
            const variantStr = item.variant.attributes
                .map((a) => a.attributeValue.value)
                .join(" / ");
            const img =
                item.variant.image ||
                (item.variant.product.images.length > 0
                    ? item.variant.product.images[0]
                    : null);
            return {
                id: item.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                variant: variantStr || "-",
                unitPrice: fmt(item.unitPrice),
                totalPrice: fmt(item.total),
                quantity: item.quantity,
                image: img,
            };
        }),
    }));
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
            coupon: { select: { code: true } },
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
        subtotal: fmt(order.subtotal),
        shipping: fmt(order.shippingCost),
        discount: Number(order.discount) > 0 ? `-${fmt(order.discount)}` : null,
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
        items: order.items.map((item) => {
            const variantStr = item.variant.attributes
                .map((a) => a.attributeValue.value)
                .join(" / ");
            const img =
                item.variant.image ||
                (item.variant.product.images.length > 0
                    ? item.variant.product.images[0]
                    : null);
            return {
                id: item.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                variant: variantStr || "-",
                unitPrice: fmt(item.unitPrice),
                totalPrice: fmt(item.total),
                quantity: item.quantity,
                image: img,
            };
        }),
    };
}
