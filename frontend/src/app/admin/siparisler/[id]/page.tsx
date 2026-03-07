"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getOrderDetail, updateOrderStatus } from "../actions";

const statusOptions = [
    { value: "PENDING", label: "Bekliyor" },
    { value: "PREPARING", label: "Hazırlanıyor" },
    { value: "SHIPPED", label: "Kargoda" },
    { value: "DELIVERED", label: "Teslim Edildi" },
    { value: "CANCELLED", label: "İptal" },
    { value: "REFUNDED", label: "İade" },
];

const statusColors: Record<string, string> = {
    Kargoda: "bg-blue-50 text-blue-700",
    Hazırlanıyor: "bg-yellow-50 text-yellow-700",
    "Teslim Edildi": "bg-green-50 text-green-700",
    İptal: "bg-red-50 text-red-700",
    İade: "bg-purple-50 text-purple-700",
    Bekliyor: "bg-gray-50 text-gray-700",
};

type OrderDetail = Awaited<ReturnType<typeof getOrderDetail>>;

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [cargoCompany, setCargoCompany] = useState("");
    const [cargoTracking, setCargoTracking] = useState("");
    const [showCargoForm, setShowCargoForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const loadOrder = useCallback(async () => {
        try {
            const { id } = await params;
            const data = await getOrderDetail(id);
            setOrder(data);
            setStatus(data.statusEnum);
            setCargoCompany(data.cargoCompany);
            setCargoTracking(data.cargoTracking);
        } catch (err: any) {
            setError(err.message || "Sipariş yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        setShowCargoForm(newStatus === "SHIPPED");
        setSaveMessage("");
    };

    const handleSave = async () => {
        if (!order) return;
        setSaving(true);
        setSaveMessage("");
        try {
            await updateOrderStatus({
                orderId: order.id,
                status: status as any,
                cargoCompany: cargoCompany || undefined,
                cargoTracking: cargoTracking || undefined,
            });
            setSaveMessage("Durum güncellendi!");
            setShowCargoForm(false);
            // reload the order
            const { id } = await params;
            const data = await getOrderDetail(id);
            setOrder(data);
        } catch (err: any) {
            setSaveMessage(err.message || "Hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF007F]"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-xl font-bold mb-2 text-[#111827]">Sipariş Bulunamadı</h2>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <Link href="/admin/siparisler" className="text-[#FF007F] hover:underline text-sm">
                    Siparişlere Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <Link href="/admin/siparisler" className="text-sm text-gray-500 hover:text-[#FF007F] mb-2 inline-flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                        Siparişlere Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-[#111827]">
                        Sipariş Detayı <span className="text-gray-400 font-normal">#{order.orderNumber}</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]"
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[#FF007F] text-white rounded-lg text-sm font-medium hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <span className="material-icons text-sm">save</span>
                        )}
                        Kaydet
                    </button>
                </div>
            </div>

            {saveMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.includes("güncellendi") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {saveMessage}
                </div>
            )}

            {/* Cargo Form — shown when SHIPPED selected */}
            {(showCargoForm || status === "SHIPPED") && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-[#111827] flex items-center gap-2">
                        <span className="material-icons text-blue-600">local_shipping</span>
                        Kargo Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Firması *</label>
                            <select
                                value={cargoCompany}
                                onChange={(e) => setCargoCompany(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F] bg-white"
                            >
                                <option value="">Seçiniz...</option>
                                <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                                <option value="Aras Kargo">Aras Kargo</option>
                                <option value="MNG Kargo">MNG Kargo</option>
                                <option value="PTT Kargo">PTT Kargo</option>
                                <option value="Sürat Kargo">Sürat Kargo</option>
                                <option value="UPS">UPS</option>
                                <option value="DHL">DHL</option>
                                <option value="Trendyol Express">Trendyol Express</option>
                                <option value="Hepsijet">Hepsijet</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Takip Kodu *</label>
                            <input
                                value={cargoTracking}
                                onChange={(e) => setCargoTracking(e.target.value)}
                                placeholder="Kargo takip numarası"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="p-6 border-b border-[#E5E7EB]">
                            <h2 className="font-bold text-[#111827]">Sipariş İçeriği</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex items-center gap-4">
                                    <Link href={`/urunler/${item.slug}`}>
                                        {item.img ? (
                                            <img
                                                src={item.img.startsWith("http") ? item.img : `/uploads/products/${item.img}`}
                                                alt={item.name}
                                                className="w-16 h-20 object-cover rounded-lg border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="material-icons text-gray-300">image</span>
                                            </div>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <Link href={`/urunler/${item.slug}`} className="hover:underline">
                                            <h3 className="font-medium text-[#111827]">{item.name}</h3>
                                        </Link>
                                        <p className="text-sm text-gray-500">{item.variant}</p>
                                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{item.total}</p>
                                        <p className="text-sm text-gray-500">x{item.qty} • {item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6 border-t border-[#E5E7EB] space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ara Toplam</span>
                                <span>{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Kargo</span>
                                <span>{order.shippingCost}</span>
                            </div>
                            {order.discount && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
                                    <span>-{order.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-[#111827] pt-2 border-t border-gray-200">
                                <span>Toplam</span>
                                <span>{order.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="space-y-8">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-[#111827]">Müşteri</h2>
                            <Link href={`/admin/musteriler/${order.customer.id}`} className="text-xs text-[#FF007F] font-medium hover:underline">
                                Profili Gör
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-[#FF007F]/10 rounded-full flex items-center justify-center text-[#FF007F] font-bold">
                                {order.customer.name[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{order.customer.name}</p>
                                <p className="text-xs text-gray-500">{order.customer.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">İletişim</label>
                                <p className="text-sm">{order.customer.phone}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Teslimat Adresi</label>
                                <p className="text-sm">{order.address.address}</p>
                                <p className="text-sm text-gray-500">{order.address.district} / {order.address.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cargo Info (if shipped) */}
                    {order.cargoCompany && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 space-y-3">
                            <h2 className="font-bold text-[#111827] flex items-center gap-2">
                                <span className="material-icons text-blue-600">local_shipping</span>
                                Kargo Bilgileri
                            </h2>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Kargo Firması</span>
                                <span className="font-medium">{order.cargoCompany}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Takip No</span>
                                <span className="font-mono bg-white px-2 py-1 rounded border border-blue-100 text-xs font-semibold">{order.cargoTracking}</span>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="font-bold text-[#111827]">Durum</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-50 text-gray-700"}`}>
                            {order.status}
                        </span>
                        {order.customerNote && (
                            <div className="mt-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Müşteri Notu</label>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.customerNote}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
