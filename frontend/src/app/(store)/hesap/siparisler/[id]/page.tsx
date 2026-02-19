"use client";

import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    ChevronLeft,
    MapPin,
    CreditCard,
    Printer,
    FileText
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";

// In a real application, this data would come from an API or database context
const MOCK_ORDERS_DATABASE = {
    "SIP-2024-001": {
        id: "SIP-2024-001",
        date: "15 Şubat 2024 - 14:30",
        status: "Teslim Edildi",
        statusColor: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
        cargoTracking: "TR-123456789",
        cargoCompany: "Yurtiçi Kargo",
        paymentMethod: "Kredi Kartı / Banka Kartı",
        paymentDetail: "**** **** **** 4582",
        subtotal: "2.500,00 ₺",
        shipping: "100,00 ₺",
        discount: "-150,00 ₺",
        total: "2.450,00 ₺",
        couponCode: "HOŞGELDİN20",
        shippingAddress: {
            title: "Ev Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Atatürk Mah. Cumhuriyet Cad. No: 123 Daire: 5",
            district: "Kadıköy",
            city: "İstanbul"
        },
        billingAddress: {
            title: "Ev Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Atatürk Mah. Cumhuriyet Cad. No: 123 Daire: 5",
            district: "Kadıköy",
            city: "İstanbul",
            taxOffice: "",
            taxNo: ""
        },
        items: [
            {
                id: 1,
                name: "Premium Deri Çanta",
                variant: "Siyah / L",
                unitPrice: "1.200,00 ₺",
                quantity: 1,
                totalPrice: "1.250,00 ₺",
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
                unitPrice: "1.250,00 ₺",
                quantity: 1,
                totalPrice: "1.250,00 ₺",
                image: "/placeholder-bag-2.jpg",
                options: []
            }
        ]
    },
    "SIP-2024-002": {
        id: "SIP-2024-002",
        date: "18 Şubat 2024 - 10:15",
        status: "Kargoda",
        statusColor: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
        cargoTracking: "KP-987654321",
        cargoCompany: "Aras Kargo",
        paymentMethod: "Kredi Kartı / Banka Kartı",
        paymentDetail: "**** **** **** 1234",
        subtotal: "850,00 ₺",
        shipping: "100,00 ₺",
        discount: null,
        total: "950,00 ₺",
        couponCode: null,
        shippingAddress: {
            title: "İş Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Plaza İş Merkezi Kat: 3 No: 15",
            district: "Maslak",
            city: "İstanbul"
        },
        billingAddress: {
            title: "İş Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Plaza İş Merkezi Kat: 3 No: 15",
            district: "Maslak",
            city: "İstanbul",
            taxOffice: "",
            taxNo: ""
        },
        items: [
            {
                id: 3,
                name: "Canvas Sırt Çantası",
                variant: "Gri / Standart",
                unitPrice: "850,00 ₺",
                quantity: 1,
                totalPrice: "950,00 ₺", // 850 + 100
                image: "/placeholder-bag-3.jpg",
                options: [
                    { name: "İsim Yazdırma (B.İ.)", price: "+100,00 ₺" }
                ]
            }
        ]
    },
    "SIP-2024-003": {
        id: "SIP-2024-003",
        date: "19 Şubat 2024 - 09:45",
        status: "Hazırlanıyor",
        statusColor: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
        cargoTracking: "-",
        cargoCompany: "Hazırlanıyor",
        paymentMethod: "Kapıda Ödeme",
        paymentDetail: "Nakit",
        subtotal: "3.350,00 ₺",
        shipping: "0,00 ₺", // Free shipping for high value?
        discount: "-250,00 ₺",
        total: "3.100,00 ₺",
        couponCode: "BAHAR25",
        shippingAddress: {
            title: "Ev Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Atatürk Mah. Cumhuriyet Cad. No: 123 Daire: 5",
            district: "Kadıköy",
            city: "İstanbul"
        },
        billingAddress: {
            title: "Ev Adresim",
            name: "Burak İtik",
            phone: "+90 555 123 45 67",
            address: "Atatürk Mah. Cumhuriyet Cad. No: 123 Daire: 5",
            district: "Kadıköy",
            city: "İstanbul",
            taxOffice: "",
            taxNo: ""
        },
        items: [
            {
                id: 4,
                name: "Minimalist Portföy",
                variant: "Bej",
                unitPrice: "3.200,00 ₺",
                quantity: 1,
                totalPrice: "3.350,00 ₺", // 3200 + 150 option
                image: "/placeholder-bag-4.jpg",
                options: [
                    { name: "Ekstra Zincir Askı", price: "+150,00 ₺" }
                ]
            }
        ]
    }
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // In Next.js 15+, params is a promise and MUST be unwrapped with React.use()
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;
    const order = MOCK_ORDERS_DATABASE[orderId as keyof typeof MOCK_ORDERS_DATABASE];

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold mb-2">Sipariş Bulunamadı</h2>
                <Link href="/hesap/siparisler" className="text-blue-600 hover:underline">Siparişlerime Dön</Link>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
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
                                    {order.status === "Teslim Edildi" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {order.status === "Kargoda" && <Truck className="w-3.5 h-3.5" />}
                                    {order.status === "Hazırlanıyor" && <Package className="w-3.5 h-3.5" />}
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Sipariş Tarihi: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{order.date}</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Yazdır
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                                <FileText className="w-4 h-4" />
                                Fatura Görüntüle
                            </button>
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
                                        {/* Image Placeholder */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-400">
                                                <Package className="w-8 h-8 opacity-20" />
                                            </div>
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

                                            {/* Options */}
                                            {item.options && item.options.length > 0 && (
                                                <div className="mt-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 space-y-1">
                                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ek Seçenekler</p>
                                                    {item.options.map((opt, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-zinc-600 dark:text-zinc-400">{opt.name}</span>
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-200">{opt.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery & Cargo Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Delivery Address */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    Teslimat Adresi
                                </div>
                                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300 flex-1">
                                    <p className="font-medium text-zinc-900 dark:text-white">{order.shippingAddress.title}</p>
                                    <p>{order.shippingAddress.name}</p>
                                    <p className="text-zinc-500">{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.phone}</p>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    Fatura Adresi
                                </div>
                                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300 flex-1">
                                    <p className="font-medium text-zinc-900 dark:text-white">{order.billingAddress.title}</p>
                                    <p>{order.billingAddress.name}</p>
                                    <p className="text-zinc-500">{order.billingAddress.address}</p>
                                    <p>{order.billingAddress.district} / {order.billingAddress.city}</p>
                                    <p>{order.billingAddress.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Payment & Summary) */}
                    <div className="space-y-6">

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4 text-zinc-900 dark:text-white font-semibold">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                Ödeme Bilgileri
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Ödeme Yöntemi</span>
                                    <span className="font-medium text-zinc-900 dark:text-white text-right">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Kart Numarası</span>
                                    <span className="font-medium text-zinc-900 dark:text-white font-mono">{order.paymentDetail}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cargo Info */}
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
                                    <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                        Kargom Nerede?
                                    </button>
                                </div>
                            </div>
                            {/* Decorative Truck Icon */}
                            <Truck className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-100 dark:text-blue-900/20 rotate-[-10deg]" />
                        </div>

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
                                {order.discount && order.discount !== "0,00 ₺" && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>İndirim ({order.couponCode})</span>
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
                        <div className="mt-1.5 text-[9px] text-zinc-500">
                            <p>Bağdat Caddesi No:123, Kadıköy / İSTANBUL</p>
                            <p>Web: www.cantambutik.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-base font-semibold mb-1">SİPARİŞ ÖZETİ</h2>
                        <div className="space-y-0.5 text-[10px]">
                            <p><span className="font-semibold">Sipariş No:</span> {order.id}</p>
                            <p><span className="font-semibold">Tarih:</span> {order.date}</p>
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase border-b border-zinc-300 pb-0.5 mb-1.5 text-zinc-700">Müşteri / Teslimat</h3>
                        <div className="text-[10px] space-y-0.5">
                            <p className="font-semibold">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                            <p className="mt-0.5">{order.shippingAddress.phone}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold uppercase border-b border-zinc-300 pb-0.5 mb-1.5 text-zinc-700">Fatura Adresi</h3>
                        <div className="text-[10px] space-y-0.5">
                            <p className="font-semibold">{order.billingAddress.name}</p>
                            <p>{order.billingAddress.address}</p>
                            <p>{order.billingAddress.district} / {order.billingAddress.city}</p>
                            {order.billingAddress.taxOffice && <p>V.D: {order.billingAddress.taxOffice}</p>}
                            {order.billingAddress.taxNo && <p>V.No: {order.billingAddress.taxNo}</p>}
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="mb-4">
                    <table className="w-full text-[10px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left">
                                <th className="py-1 w-[45%]">ÜRÜN / HİZMET</th>
                                <th className="py-1 w-[20%] text-center">SEÇENEKLER</th>
                                <th className="py-1 w-[10%] text-center">ADET</th>
                                <th className="py-1 w-[12.5%] text-right">BİRİM</th>
                                <th className="py-1 w-[12.5%] text-right">TOPLAM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-1.5 pr-2 align-top">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-[9px] text-zinc-500">{item.variant}</p>
                                    </td>
                                    <td className="py-1.5 align-top text-center text-[9px] text-zinc-600">
                                        {item.options.length > 0 ? (
                                            item.options.map((opt, i) => (
                                                <div key={i}>{opt.name} ({opt.price})</div>
                                            ))
                                        ) : (
                                            "-"
                                        )}
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
                        {order.discount && order.discount !== "0,00 ₺" && (
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
