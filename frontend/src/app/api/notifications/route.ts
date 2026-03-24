import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ notifications: [] }, { status: 401 });
        }

        const notifications = await db.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        const withOrderData = await Promise.all(
            notifications.map(async (n: any) => {
                if (n.type === "ORDER_DELIVERED" && n.entityId) {
                    const order = await db.order.findUnique({
                        where: { id: n.entityId },
                        include: {
                            items: {
                                include: {
                                    variant: {
                                        include: { product: true }
                                    }
                                }
                            }
                        }
                    });

                    if (order) {
                        // Return unique products in the order
                        const uniqueProducts = Array.from(new Map(order.items.map(item => [item.variant.product.id, item.variant.product])).values());
                        return { ...n, orderProducts: uniqueProducts, orderNumber: order.orderNumber };
                    }
                }
                return n;
            })
        );

        return NextResponse.json({ notifications: withOrderData });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, markAsRead, markAllAsRead, markModalShown } = body;

        // Handle bulk mark all as read
        if (markAllAsRead) {
            await db.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            });
            return NextResponse.json({ success: true });
        }

        if (!notificationId) {
            return NextResponse.json({ error: "Notification ID mandatory" }, { status: 400 });
        }

        const notification = await db.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const dataToUpdate: any = {};
        if (markAsRead) dataToUpdate.isRead = true;
        if (markModalShown) dataToUpdate.isModalShown = true;

        const updated = await db.notification.update({
            where: { id: notificationId },
            data: dataToUpdate
        });

        return NextResponse.json({ notification: updated });
    } catch (error) {
        console.error("Notification update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, clearAll } = body;

        // Handle bulk clear all
        if (clearAll) {
            await db.notification.deleteMany({
                where: { userId: session.user.id }
            });
            return NextResponse.json({ success: true });
        }

        if (!notificationId) {
            return NextResponse.json({ error: "Notification ID mandatory" }, { status: 400 });
        }

        const notification = await db.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await db.notification.delete({
            where: { id: notificationId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notification delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
