import { Package, Truck, CheckCircle2, Clock, ChevronRight, ExternalLink, Tag, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock Data
const MOCK_ORDERS = [
    {
        id: "SIP-2024-001",
        date: "15 Şubat 2024",
        originalTotal: "2.600,00 ₺",
        total: "2.450,00 ₺",
        status: "Teslim Edildi",
        statusColor: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
        coupon: {
            code: "HOŞGELDİN20",
            discount: "-150,00 ₺"
        },
        items: [
            {
                id: 1,
                name: "Premium Deri Çanta",
                variant: "Siyah / L",
                originalPrice: "1.200,00 ₺",
                finalPrice: "1.250,00 ₺", // 1200 + 50
                image: "/placeholder-bag-1.jpg",
                options: [
                    { name: "Hediye Paketi", price: "+50,00 ₺" },
                    { name: "Toz Torbası", price: "Ücretsiz" }
                ]
            },
            {
                id: 2,
                name: "Vintage Omuz Çantası",
                variant: "Kahverengi",
                originalPrice: "1.250,00 ₺",
                finalPrice: "1.250,00 ₺",
                image: "/placeholder-bag-2.jpg",
                options: []
            }
        ]
    },
    {
        id: "SIP-2024-002",
        date: "18 Şubat 2024",
        total: "950,00 ₺",
        status: "Kargoda",
        statusColor: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
        coupon: null,
        items: [
            {
                id: 3,
                name: "Canvas Sırt Çantası",
                variant: "Gri / Standart",
                originalPrice: "850,00 ₺",
                finalPrice: "950,00 ₺", // 850 + 100
                image: "/placeholder-bag-3.jpg",
                options: [
                    { name: "İsim Yazdırma (B.İ.)", price: "+100,00 ₺" }
                ]
            }
        ]
    },
    {
        id: "SIP-2024-003",
        date: "19 Şubat 2024",
        originalTotal: "3.350,00 ₺",
        total: "3.100,00 ₺",
        status: "Hazırlanıyor",
        statusColor: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
        coupon: {
            code: "BAHAR25",
            discount: "-250,00 ₺"
        },
        items: [
            {
                id: 4,
                name: "Minimalist Portföy",
                variant: "Bej",
                originalPrice: "3.200,00 ₺",
                finalPrice: "3.350,00 ₺", // 3200 + 150
                image: "/placeholder-bag-4.jpg",
                options: [
                    { name: "Ekstra Zincir Askı", price: "+150,00 ₺" }
                ]
            }
        ]
    }
];

export default function OrdersPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Siparişlerim
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Geçmiş siparişlerinizi ve güncel durumlarını buradan takip edebilirsiniz.
                </p>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {MOCK_ORDERS.map((order) => (
                    <div
                        key={order.id}
                        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        {/* Order Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-6 items-center justify-between">
                            <div className="flex flex-wrap gap-8 items-center">
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
                                        {order.coupon ? (
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

                            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${order.statusColor}`}>
                                {order.status === "Teslim Edildi" && <CheckCircle2 className="w-4 h-4" />}
                                {order.status === "Kargoda" && <Truck className="w-4 h-4" />}
                                {order.status === "Hazırlanıyor" && <Package className="w-4 h-4" />}
                                {order.status}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 sm:gap-6 items-start">
                                        {/* Image Placeholder */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                            {/* Using a colored div instead of Image to avoid 404s/config issues with external domains for this mock */}
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-400">
                                                <Package className="w-8 h-8 opacity-20" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="font-medium text-zinc-900 dark:text-white text-lg">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-sm text-zinc-500 mt-1">{item.variant}</p>

                                                    {/* Options Section */}
                                                    {item.options && item.options.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            {item.options.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-2 py-1 rounded border border-zinc-100 dark:border-zinc-800">
                                                                    <Plus className="w-3 h-3 text-zinc-400" />
                                                                    <span>{opt.name}</span>
                                                                    {opt.price !== "Ücretsiz" && (
                                                                        <>
                                                                            <span className="text-zinc-400 mx-1">•</span>
                                                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{opt.price}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">
                                                            {item.finalPrice}
                                                        </p>
                                                        {item.originalPrice !== item.finalPrice && (
                                                            <span className="text-xs text-zinc-400 mt-0.5">
                                                                (Ürün: {item.originalPrice})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Info & Actions */}
                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                {order.coupon && (
                                    <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                                        <Tag className="w-4 h-4 text-green-500" />
                                        <span>"<span className="font-medium text-zinc-700 dark:text-zinc-300">{order.coupon.code}</span>" kupon kodu ile <span className="text-green-600 dark:text-green-400 font-medium">{order.coupon.discount}</span> indirim uygulandı.</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 justify-end">
                                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                        Fatura Görüntüle
                                    </button>
                                    <Link
                                        href={`/hesap/siparisler/${order.id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors group/btn"
                                    >
                                        Sipariş Detayı
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Link>                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
