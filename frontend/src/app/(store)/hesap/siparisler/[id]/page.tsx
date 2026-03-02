import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    ChevronLeft,
    MapPin,
    CreditCard,
    Printer,
    FileText,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMyOrderDetail } from "../actions";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let order;
    try {
        order = await getMyOrderDetail(id);
    } catch {
        notFound();
    }

    const statusIcon = () => {
        switch (order.status) {
            case "Teslim Edildi": return <CheckCircle2 className="w-3.5 h-3.5" />;
            case "Kargoda": return <Truck className="w-3.5 h-3.5" />;
            case "Hazırlanıyor": return <Package className="w-3.5 h-3.5" />;
            case "Bekliyor": return <Clock className="w-3.5 h-3.5" />;
            case "İptal": return <AlertCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    return (
        <>
            {/* --- STANDARD UI (Hidden on Print) --- */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:hidden">
                {/* Header & Back Link */}
                <div className="flex flex-col gap-4">
                    <Link
                        href="/hesap/siparisler"
                        className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors w-fit"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Siparişlerime Dön
                    </Link>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    Sipariş #{order.id}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${order.statusColor}`}>
                                    {statusIcon()}
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Sipariş Tarihi: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{order.date}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Order Items & Status) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Order Items Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <h3 className="font-semibold text-zinc-900 dark:text-white">Sipariş İçeriği</h3>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                                        {/* Image */}
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

                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-zinc-900 dark:text-white text-lg">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-sm text-zinc-500">{item.variant}</p>
                                                </div>
                                                <p className="font-semibold text-zinc-900 dark:text-white text-lg">
                                                    {item.totalPrice}
                                                </p>
                                            </div>

                                            <div className="flex items-center text-sm text-zinc-500">
                                                <span>Birim Fiyat: {item.unitPrice}</span>
                                                <span className="mx-2">•</span>
                                                <span>Adet: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                Teslimat Adresi
                            </div>
                            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                                <p className="font-medium text-zinc-900 dark:text-white">{order.shippingAddress.title}</p>
                                <p>{order.shippingAddress.name}</p>
                                <p className="text-zinc-500">{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                                <p>{order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Cargo & Summary) */}
                    <div className="space-y-6">

                        {/* Cargo Info */}
                        {order.cargoCompany && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        Kargo Durumu
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 dark:text-zinc-400">Kargo Firması</span>
                                            <span className="font-medium text-zinc-900 dark:text-white">{order.cargoCompany}</span>
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-zinc-500 dark:text-zinc-400">Takip No</span>
                                            <span className="font-mono bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">{order.cargoTracking}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative Truck Icon */}
                                <Truck className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-100 dark:text-blue-900/20 rotate-[-10deg]" />
                            </div>
                        )}

                        {/* No cargo info yet */}
                        {!order.cargoCompany && (order.status === "Hazırlanıyor" || order.status === "Bekliyor") && (
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-3 text-zinc-900 dark:text-white font-semibold">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    Kargo Bilgisi
                                </div>
                                <p className="text-sm text-zinc-500">Siparişiniz hazırlandıktan sonra kargo takip bilgileri burada görünecektir.</p>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Sipariş Özeti</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                                    <span>Ara Toplam</span>
                                    <span>{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                                    <span>Kargo</span>
                                    <span>{order.shipping}</span>
                                </div>
                                {order.discount && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
                                        <span>{order.discount}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-2 flex justify-between items-center">
                                    <span className="font-semibold text-zinc-900 dark:text-white">Genel Toplam</span>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{order.total}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- PRINTABLE INVOICE Layout (Visible ONLY on Print) --- */}
            <div className="hidden print:block font-sans text-black bg-white p-6 max-w-[210mm] mx-auto text-[10px] leading-tight">

                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-zinc-800 pb-3 mb-4">
                    <div>
                        <h1 className="text-lg font-bold tracking-tight mb-0.5">ÇANTAM BUTİK</h1>
                        <p className="text-[10px] text-zinc-600">Özel Tasarım & Kalite</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-base font-semibold mb-1">SİPARİŞ ÖZETİ</h2>
                        <div className="space-y-0.5 text-[10px]">
                            <p><span className="font-semibold">Sipariş No:</span> {order.id}</p>
                            <p><span className="font-semibold">Tarih:</span> {order.date}</p>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                    <h3 className="text-[10px] font-bold uppercase border-b border-zinc-300 pb-0.5 mb-1.5 text-zinc-700">Müşteri / Teslimat</h3>
                    <div className="text-[10px] space-y-0.5">
                        <p className="font-semibold">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                        <p className="mt-0.5">{order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="mb-4">
                    <table className="w-full text-[10px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left">
                                <th className="py-1 w-[55%]">ÜRÜN / HİZMET</th>
                                <th className="py-1 w-[15%] text-center">ADET</th>
                                <th className="py-1 w-[15%] text-right">BİRİM</th>
                                <th className="py-1 w-[15%] text-right">TOPLAM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-1.5 pr-2 align-top">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-[9px] text-zinc-500">{item.variant}</p>
                                    </td>
                                    <td className="py-1.5 align-top text-center">{item.quantity}</td>
                                    <td className="py-1.5 align-top text-right">{item.unitPrice}</td>
                                    <td className="py-1.5 align-top text-right font-medium">{item.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                    <div className="w-1/2 md:w-1/3 space-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-zinc-600">Ara Toplam:</span>
                            <span className="font-medium">{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600">Kargo:</span>
                            <span className="font-medium">{order.shipping}</span>
                        </div>
                        {order.discount && (
                            <div className="flex justify-between text-zinc-600">
                                <span>İndirim:</span>
                                <span>{order.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-zinc-800 pt-1 mt-1 text-xs">
                            <span className="font-bold">GENEL TOPLAM:</span>
                            <span className="font-bold">{order.total}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="border-t border-zinc-200 pt-3 text-center text-[9px] text-zinc-500">
                    <p>Bu belge resmi fatura yerine geçmez, sipariş bilgilendirme formudur.</p>
                    <p className="mt-0.5">Çantam Butik - Bizi tercih ettiğiniz için teşekkür ederiz.</p>
                </div>

            </div>
        </>
    );
}
