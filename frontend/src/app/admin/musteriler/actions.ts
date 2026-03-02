"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Helpers ─────────────────────────────────────────
async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Yetkisiz erişim");
    }
    return session;
}

// ─── Stats ───────────────────────────────────────────
export async function getCustomerStats() {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, eliteCount, platinumCount, newThisMonth, avgOrder] = await Promise.all([
        db.user.count({ where: { role: "USER", deletedAt: null } }),
        db.user.count({ where: { role: "USER", tier: "ELITE", deletedAt: null } }),
        db.user.count({ where: { role: "USER", tier: "PLATINUM", deletedAt: null } }),
        db.user.count({
            where: { role: "USER", deletedAt: null, createdAt: { gte: startOfMonth } },
        }),
        db.order.aggregate({
            _avg: { total: true },
            where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        }),
    ]);

    return {
        totalCustomers,
        vipCustomers: eliteCount + platinumCount,
        newThisMonth,
        avgOrderValue: avgOrder._avg.total
            ? Number(avgOrder._avg.total).toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
                minimumFractionDigits: 0,
            })
            : "₺0",
    };
}

// ─── Customer List ───────────────────────────────────
export async function getCustomers(search?: string) {
    await requireAdmin();

    const where: any = { role: "USER" as const, deletedAt: null };

    if (search && search.trim().length > 0) {
        const q = search.trim();
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { surname: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
        ];
    }

    const customers = await db.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            tier: true,
            totalSpent: true,
            createdAt: true,
            _count: { select: { orders: true } },
            orders: {
                select: { createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return customers.map((c) => ({
        id: c.id,
        name: [c.name, c.surname].filter(Boolean).join(" ") || "İsimsiz",
        email: c.email,
        phone: c.phone || "-",
        orders: c._count.orders,
        spent: Number(c.totalSpent).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
        }),
        lastOrder: c.orders[0]
            ? c.orders[0].createdAt.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "-",
        level: c.tier === "PLATINUM" ? "VIP" : c.tier === "ELITE" ? "Premium" : "Standart",
    }));
}

// ─── Customer Detail ─────────────────────────────────
export async function getCustomerDetail(customerId: string) {
    await requireAdmin();

    if (!customerId) throw new Error("Geçersiz müşteri ID");

    const customer = await db.user.findUnique({
        where: { id: customerId },
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            tier: true,
            totalSpent: true,
            createdAt: true,
            _count: { select: { orders: true } },
            addresses: {
                where: { deletedAt: null },
                select: { fullAddress: true, district: true, city: true },
                take: 1,
                orderBy: { isDefault: "desc" },
            },
            orders: {
                select: {
                    id: true,
                    orderNumber: true,
                    createdAt: true,
                    total: true,
                    status: true,
                },
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    if (!customer) throw new Error("Müşteri bulunamadı");

    const statusMap: Record<string, string> = {
        PENDING: "Bekliyor",
        PREPARING: "Hazırlanıyor",
        SHIPPED: "Kargoda",
        DELIVERED: "Teslim Edildi",
        CANCELLED: "İptal",
        REFUNDED: "İade",
    };

    return {
        id: customer.id,
        name: customer.name || "",
        surname: customer.surname || "",
        email: customer.email,
        phone: customer.phone || "",
        tier: customer.tier,
        totalSpent: Number(customer.totalSpent).toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
        }),
        orderCount: customer._count.orders,
        registeredAt: customer.createdAt.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        address: customer.addresses[0]
            ? `${customer.addresses[0].fullAddress}, ${customer.addresses[0].district}/${customer.addresses[0].city}`
            : "-",
        orders: customer.orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            date: o.createdAt.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            total: Number(o.total).toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
                minimumFractionDigits: 0,
            }),
            status: statusMap[o.status] || o.status,
        })),
    };
}
