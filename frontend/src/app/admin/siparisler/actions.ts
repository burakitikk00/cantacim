"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────
async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Yetkisiz erişim");
    }
    return session;
}

const STATUS_MAP: Record<string, string> = {
    PENDING: "Bekliyor",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
    REFUNDED: "İade",
};

const STATUS_REVERSE: Record<string, string> = {
    Bekliyor: "PENDING",
    Hazırlanıyor: "PREPARING",
    Kargoda: "SHIPPED",
    "Teslim Edildi": "DELIVERED",
    İptal: "CANCELLED",
    İade: "REFUNDED",
};

// ─── Order List ──────────────────────────────────────
export async function getOrders(statusFilter?: string) {
    await requireAdmin();

    const where: any = {};
    if (statusFilter && statusFilter !== "Tümü") {
        const dbStatus = STATUS_REVERSE[statusFilter];
        if (dbStatus) where.status = dbStatus;
    }

    const orders = await db.order.findMany({
        where,
        select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            total: true,
            status: true,
            user: {
                select: { name: true, surname: true, email: true },
            },
            _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return orders.map((o) => ({
        id: o.orderNumber,
        dbId: o.id,
        customer: [o.user.name, o.user.surname].filter(Boolean).join(" ") || "İsimsiz",
        email: o.user.email,
        date: o.createdAt.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        items: o._count.items,
        total: Number(o.total).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
        }),
        status: STATUS_MAP[o.status] || o.status,
    }));
}

// ─── Order Detail ────────────────────────────────────
export async function getOrderDetail(orderId: string) {
    await requireAdmin();

    if (!orderId) throw new Error("Geçersiz sipariş ID");

    const order = await db.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
        select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            subtotal: true,
            discount: true,
            shippingCost: true,
            total: true,
            cargoCompany: true,
            cargoTracking: true,
            customerNote: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    phone: true,
                },
            },
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
            coupon: { select: { code: true } },
            items: {
                select: {
                    id: true,
                    quantity: true,
                    unitPrice: true,
                    total: true,
                    variant: {
                        select: {
                            sku: true,
                            image: true,
                            product: {
                                select: {
                                    name: true,
                                    slug: true,
                                    images: true,
                                },
                            },
                            attributes: {
                                select: {
                                    attributeValue: {
                                        select: { value: true, attribute: { select: { name: true } } },
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

    const fmt = (v: any) =>
        Number(v).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
        });

    return {
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        status: STATUS_MAP[order.status] || order.status,
        statusEnum: order.status,
        subtotal: fmt(order.subtotal),
        discount: Number(order.discount) > 0 ? fmt(order.discount) : null,
        shippingCost: fmt(order.shippingCost),
        total: fmt(order.total),
        cargoCompany: order.cargoCompany || "",
        cargoTracking: order.cargoTracking || "",
        couponCode: order.coupon?.code || null,
        customerNote: order.customerNote || "",
        customer: {
            id: order.user.id,
            name: [order.user.name, order.user.surname].filter(Boolean).join(" ") || "İsimsiz",
            email: order.user.email,
            phone: order.user.phone || "-",
        },
        address: {
            title: order.address.title,
            fullName: order.address.fullName,
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
                sku: item.variant.sku,
                price: fmt(item.unitPrice),
                qty: item.quantity,
                total: fmt(item.total),
                img,
            };
        }),
    };
}

// ─── Update Order Status ─────────────────────────────
const updateStatusSchema = z.object({
    orderId: z.string().min(1),
    status: z.enum(["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
    cargoCompany: z.string().optional(),
    cargoTracking: z.string().optional(),
});

export async function updateOrderStatus(input: z.infer<typeof updateStatusSchema>) {
    await requireAdmin();

    const parsed = updateStatusSchema.parse(input);

    const currentOrder = await db.order.findUnique({
        where: { id: parsed.orderId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    });

    if (!currentOrder) throw new Error("Sipariş bulunamadı");

    // Kargoda durumuna geçişte kargo bilgileri zorunlu
    if (parsed.status === "SHIPPED") {
        if (!parsed.cargoCompany || parsed.cargoCompany.trim().length === 0) {
            throw new Error("Kargo firması gereklidir");
        }
        if (!parsed.cargoTracking || parsed.cargoTracking.trim().length === 0) {
            throw new Error("Takip kodu gereklidir");
        }
    }

    const data: any = {
        status: parsed.status,
    };

    if (parsed.status === "SHIPPED") {
        data.cargoCompany = parsed.cargoCompany!.trim();
        data.cargoTracking = parsed.cargoTracking!.trim();
        data.cargoUpdatedAt = new Date();
    }

    await db.order.update({
        where: { id: parsed.orderId },
        data,
    });

    // Create notifications if status changed
    if (currentOrder.status !== parsed.status) {
        // Only if changing to a valid status
        const statusMapKey = parsed.status;
        const mappedStatus = STATUS_MAP[statusMapKey] || statusMapKey;

        // Generic status update notification
        await db.notification.create({
            data: {
                userId: currentOrder.userId,
                title: "Sipariş Durumu Güncellendi",
                message: `#${currentOrder.orderNumber} numaralı siparişinizin durumu "${mappedStatus}" olarak güncellendi.`,
                type: "ORDER_STATUS_CHANGED",
                link: `/hesap/siparisler`,
                entityId: currentOrder.id,
            }
        });

        // Review notification if DELIVERED
        if (parsed.status === "DELIVERED") {
            await db.notification.create({
                data: {
                    userId: currentOrder.userId,
                    title: "Siparişiniz Teslim Edildi!",
                    message: `#${currentOrder.orderNumber} numaralı siparişiniz teslim edildi. Satın aldığınız ürünleri değerlendirebilir misiniz?`,
                    type: "ORDER_DELIVERED",
                    link: `/hesap/siparisler`,
                    entityId: currentOrder.id,
                    isModalShown: false,
                }
            });
        }
    }

    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${parsed.orderId}`);

    return { success: true };
}
