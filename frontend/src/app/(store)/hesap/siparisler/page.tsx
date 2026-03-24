import { Package, Truck, CheckCircle2, Clock, ChevronRight, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMyOrders } from "./actions";

export default async function OrdersPage() {
    const orders = await getMyOrders();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Siparişlerim
                </h2>
                <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">
                    Geçmiş siparişlerinizi ve güncel durumlarını buradan takip edebilirsiniz.
                </p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Henüz siparişiniz yok</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">İlk siparişinizi verin, burada görüntüleyin.</p>
                    <Link href="/urunler" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                        Alışverişe Başla
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.dbId}
                            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            {/* Order Header */}
                            <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center justify-between">
                                <div className="grid grid-cols-2 md:flex flex-wrap gap-4 sm:gap-8 items-start sm:items-center">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sipariş No</span>
                                        <p className="font-semibold text-zinc-900 dark:text-white font-mono">{order.id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tarih</span>
                                        <p className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {order.date}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Toplam Tutar</span>
                                        <div className="flex flex-col">
                                            {order.originalTotal ? (
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-sm font-medium text-zinc-400 line-through decoration-zinc-400/50">
                                                        {order.originalTotal}
                                                    </span>
                                                    <p className="font-bold text-zinc-900 dark:text-white">
                                                        {order.total}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="font-bold text-zinc-900 dark:text-white">{order.total}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 w-fit ${order.statusColor}`}>
                                    {order.status === "Teslim Edildi" && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    {order.status === "Kargoda" && <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    {order.status === "Hazırlanıyor" && <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    {order.status === "Bekliyor" && <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    {order.status === "İptal" && <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    {order.status}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 sm:gap-6 items-start">
                                            {/* Image */}
                                            <Link href={`/urunler/${item.slug}`}>
                                                <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image.startsWith("http") ? item.image : `/uploads/products/${item.image}`}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="96px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-400">
                                                            <Package className="w-8 h-8 opacity-20" />
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                                                    <div>
                                                        <Link href={`/urunler/${item.slug}`} className="hover:underline">
                                                            <h4 className="font-medium text-zinc-900 dark:text-white text-base sm:text-lg leading-tight">
                                                                {item.name}
                                                            </h4>
                                                        </Link>
                                                        <p className="text-sm text-zinc-500 mt-1">{item.variant}</p>
                                                        {item.quantity > 1 && (
                                                            <p className="text-xs text-zinc-400 mt-1">Adet: {item.quantity}</p>
                                                        )}
                                                    </div>

                                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                        {item.originalUnitPrice ? (
                                                            <div className="flex flex-col items-start sm:items-end">
                                                                <span className="text-sm text-zinc-400 line-through decoration-zinc-400/50">
                                                                    {item.originalUnitPrice}
                                                                </span>
                                                                <p className="font-semibold text-zinc-900 dark:text-white text-base sm:text-lg">
                                                                    {item.unitPrice}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="font-semibold text-zinc-900 dark:text-white text-base sm:text-lg">
                                                                {item.totalPrice}
                                                            </p>
                                                        )}
                                                        {item.quantity > 1 && (
                                                            <span className="text-xs text-zinc-400 mt-0.5">
                                                                (Toplam: {item.totalPrice})
                                                            </span>
                                                        )}
                                                        {order.status === "Teslim Edildi" && (
                                                            <div className="mt-2 text-right">
                                                                <Link href={`/urunler/${item.slug}#reviews`} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1 group/evaluate">
                                                                    Değerlendir
                                                                    <ChevronRight className="w-3 h-3 group-hover/evaluate:translate-x-0.5 transition-transform" />
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cargo tracking info */}
                                {order.status === "Kargoda" && order.cargoCompany && (
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div className="text-sm">
                                            <span className="text-zinc-600 dark:text-zinc-400">{order.cargoCompany} • </span>
                                            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{order.cargoTracking}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Discount Summary */}
                                {(order.autoDiscountTotal || order.couponDiscountAmount) && (
                                    <div className="mt-6 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/50 space-y-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-2">İndirim Detayları</h4>
                                        {order.autoDiscountTotal && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-600 dark:text-zinc-400">Ürün İndirimleri</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">{order.autoDiscountTotal}</span>
                                            </div>
                                        )}
                                        {order.coupon && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    Kupon ({order.coupon.code}) — {order.coupon.discountText}
                                                </span>
                                                <span className="font-medium text-green-600 dark:text-green-400">{order.coupon.discountAmount}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer Info & Actions */}
                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex flex-wrap gap-3 justify-end">
                                        <Link
                                            href={`/hesap/siparisler/${order.dbId}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors group/btn"
                                        >
                                            Sipariş Detayı
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
