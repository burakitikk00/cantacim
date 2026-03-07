import Link from "next/link";
import { db } from "@/lib/db";
import { formatDistanceToNow, subDays, startOfDay, format } from "date-fns";
import { tr } from "date-fns/locale";
import RefreshButton from "@/components/admin/RefreshButton";
import DashboardCharts from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 6)); // 6 days before + today = 7 days
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Total Sales (Bugüne Kadarki Toplam Satış)
    const totalSalesResult = await db.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
    });
    const totalSales = Number(totalSalesResult._sum.total || 0);

    // 2. Total Orders (Toplam Sipariş)
    const totalOrders = await db.order.count({
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
    });

    // 3. Open Orders (Açık Sipariş)
    const openOrdersCount = await db.order.count({
        where: { status: { in: ["PENDING", "PREPARING"] } },
    });

    // 4. Sales of the last 30 days (Son 30 Gün Satış)
    const last30DaysSalesResult = await db.order.aggregate({
        _sum: { total: true },
        where: {
            status: { notIn: ["CANCELLED", "REFUNDED"] },
            createdAt: { gte: thirtyDaysAgo },
        },
    });
    const last30DaysSales = Number(last30DaysSalesResult._sum.total || 0);

    // 5. Refunded Orders Stats (İade Edilenler)
    const refundedStats = await db.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { status: "REFUNDED" }
    });
    const refundedTotal = Number(refundedStats._sum.total || 0);
    const refundedCount = refundedStats._count.id;

    // 6. Active Carts Analysis (Aktif Sepetler - Fixed Potential)
    const activeCartsResult = await db.cartItem.groupBy({
        by: ['userId'],
    });
    const activeCartsCount = activeCartsResult.length;

    // Fetch active discounts to calculate potential accurately
    const activeDiscounts = await db.discount.findMany({
        where: {
            isActive: true,
            startDate: { lte: now },
            OR: [
                { endDate: null },
                { endDate: { gte: now } }
            ]
        },
        include: {
            products: { select: { id: true } },
            categories: { select: { id: true } }
        }
    });

    const allCartItems = await db.cartItem.findMany({
        include: {
            variant: {
                include: { product: true }
            }
        }
    });

    const activeCartsTotal = allCartItems.reduce((acc, item) => {
        const basePrice = Number(item.variant.price);

        // Find applicable discounts
        const itemDiscounts = activeDiscounts.filter(d =>
            d.products.some(p => p.id === item.variant.productId) ||
            d.categories.some(c => c.id === item.variant.product.categoryId)
        );

        let bestPrice = basePrice;
        itemDiscounts.forEach(d => {
            let priceWithThisDiscount = basePrice;
            if (d.discountType === "PERCENTAGE") {
                priceWithThisDiscount = basePrice * (1 - Number(d.value) / 100);
            } else {
                priceWithThisDiscount = Math.max(0, basePrice - Number(d.value));
            }
            if (priceWithThisDiscount < bestPrice) bestPrice = priceWithThisDiscount;
        });

        return acc + (bestPrice * item.quantity);
    }, 0);


    // 7. Chart Data (Son 7 Günlük Satış & Adet)
    const last7DaysOrders = await db.order.findMany({
        where: {
            status: { notIn: ["CANCELLED", "REFUNDED"] },
            createdAt: { gte: sevenDaysAgo }
        },
        select: {
            total: true,
            createdAt: true
        }
    });

    const chartsDataMap = new Map();
    for (let i = 0; i < 7; i++) {
        const date = format(subDays(now, i), "dd MMM", { locale: tr });
        chartsDataMap.set(date, { total: 0, count: 0 });
    }

    last7DaysOrders.forEach(order => {
        const dateKey = format(order.createdAt, "dd MMM", { locale: tr });
        if (chartsDataMap.has(dateKey)) {
            const current = chartsDataMap.get(dateKey);
            chartsDataMap.set(dateKey, {
                total: current.total + Number(order.total),
                count: current.count + 1
            });
        }
    });

    const chartsData = Array.from(chartsDataMap.entries())
        .map(([date, val]) => ({ date, total: val.total, count: val.count }))
        .reverse();


    // 7. Top Selling Products (En Çok Satan Ürünler)
    const topSellingVariants = await db.orderItem.groupBy({
        by: ['variantId'],
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: 5,
        where: {
            order: {
                status: {
                    notIn: ["CANCELLED", "REFUNDED"],
                }
            }
        }
    });

    const variantIds = topSellingVariants.map(v => v.variantId);
    const topVariantsDetails = await db.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
    });

    const topSellingProducts = topSellingVariants.map(ts => {
        const detail = topVariantsDetails.find(d => d.id === ts.variantId);
        return detail ? {
            id: detail.product.id,
            name: detail.product.name,
            image: detail.image || detail.product.images[0],
            price: Number(detail.price || 0),
            quantity: ts._sum.quantity || 0,
        } : null;
    }).filter((p): p is any => p !== null && p.id !== undefined);

    // 8. Recent Activity (Son İşlemler)
    const recentOrdersRaw = await db.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, total: true, createdAt: true }
    });
    const recentOrders = recentOrdersRaw.map(o => ({ ...o, type: "ORDER" as const }));

    const recentUsersRaw = await db.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, surname: true, createdAt: true }
    });
    const recentUsers = recentUsersRaw.map(u => ({ ...u, type: "USER" as const }));

    const lowStockVariants = await db.productVariant.findMany({
        take: 3,
        where: { stock: { lte: 2 } },
        orderBy: { updatedAt: 'desc' },
        include: { product: { select: { name: true } } },
    });
    const recentStockAlerts = lowStockVariants.map(v => ({
        id: v.id,
        name: v.product.name,
        stock: v.stock,
        createdAt: v.updatedAt,
        type: "STOCK" as const
    }));

    const allRecentActivities = [
        ...recentOrders,
        ...recentUsers,
        ...recentStockAlerts
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hesap Özeti</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dükkanınızın genel durumunu buradan takip edebilirsiniz.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Son Güncelleme: {now.toLocaleTimeString("tr-TR")}</span>
                    <RefreshButton />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                {/* Total Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Satış</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSales.toLocaleString("tr-TR")} TL</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-400">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        <span>Tüm zamanlar</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Sipariş</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-400">
                        <span className="material-icons text-sm mr-1">shopping_bag</span>
                        <span>Tüm zamanlar</span>
                    </div>
                </div>

                {/* Open Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Açık Sipariş</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{openOrdersCount}</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-orange-500">
                        <span className="material-icons text-sm mr-1">pending_actions</span>
                        <span>İşlem Bekliyor</span>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Son 30 Gün Satış</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{last30DaysSales.toLocaleString("tr-TR")} TL</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-400">
                        <span className="material-icons text-sm mr-1">date_range</span>
                        <span>Son 1 Ay</span>
                    </div>
                </div>

                {/* Refunded Total */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">İade Edilen Tutar</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{refundedTotal.toLocaleString("tr-TR")} TL</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-red-500">
                        <span className="material-icons text-sm mr-1">assignment_return</span>
                        <span>Toplam İade</span>
                    </div>
                </div>

                {/* Refunded Count */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow border-l-4 border-l-red-400">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">İade Adedi</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{refundedCount}</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-red-400">
                        <span className="material-icons text-sm mr-1">undo</span>
                        <span>İade Edilen Sipariş</span>
                    </div>
                </div>

                {/* Active Carts Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow border-l-4 border-l-[#FF007F]">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Sepetler</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-2xl font-bold text-gray-900">{activeCartsCount}</h3>
                            <span className="text-sm text-gray-500">Kişi</span>
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-[#FF007F]">
                        <span className="material-icons text-sm mr-1">shopping_cart</span>
                        <span className="truncate">Potansiyel: {activeCartsTotal.toLocaleString("tr-TR")} TL</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Satış Hacmi (Son 7 Gün)</h2>
                </div>
                <DashboardCharts data={chartsData} />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">En Çok Satan Ürünler</h2>
                        <Link href="/admin/urunler" className="text-sm text-[#FF007F] hover:text-[#D6006B] font-medium">Tümünü Gör</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Ürün Adı</th>
                                    <th className="px-6 py-3 font-medium text-right">Fiyat</th>
                                    <th className="px-6 py-3 font-medium text-right">Satış Adedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {topSellingProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">Henüz satış yapılmamış.</td>
                                    </tr>
                                ) : (
                                    topSellingProducts.map((product: any, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {product.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img alt={product.name} className="w-full h-full object-cover opacity-70" src={product.image} />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">Yok</div>
                                                    )}
                                                </div>
                                                <Link href={`/admin/urunler/yonet?id=${product.id}`} className="hover:text-[#FF007F]">
                                                    {product.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right">₺{product.price.toLocaleString("tr-TR")}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-[#FF007F]">{product.quantity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Son İşlemler</h2>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[400px]">
                        {allRecentActivities.length === 0 ? (
                            <p className="text-gray-500 text-sm italic text-center py-4">Son işlem bulunamadı.</p>
                        ) : (
                            allRecentActivities.map((activity, idx) => {
                                const timeAgo = formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: tr });

                                if (activity.type === "ORDER") {
                                    return (
                                        <div key={`order-${idx}`} className="flex gap-4">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <span className="material-icons text-xl">shopping_cart</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Yeni Sipariş <Link href={`/admin/siparisler/detay/${activity.id}`} className="text-[#FF007F] hover:underline">#{activity.orderNumber}</Link>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{timeAgo} • ₺{Number(activity.total).toLocaleString("tr-TR")}</p>
                                            </div>
                                        </div>
                                    );
                                } else if (activity.type === "USER") {
                                    return (
                                        <div key={`user-${idx}`} className="flex gap-4">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <span className="material-icons text-xl">person_add</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Yeni Üye Kaydı</p>
                                                <p className="text-xs text-gray-500 mt-1">{timeAgo} • {activity.name} {activity.surname}</p>
                                            </div>
                                        </div>
                                    );
                                } else if (activity.type === "STOCK") {
                                    return (
                                        <div key={`stock-${idx}`} className="flex gap-4">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                                <span className="material-icons text-xl">inventory_2</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Kritik Stok Uyarısı</p>
                                                <p className="text-xs text-gray-500 mt-1">{timeAgo} • {activity.name} ({activity.stock} kaldı)</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
