"use client";

import Link from "next/link";

// Mock Data
const CUSTOMER = {
    id: 1,
    name: "Ayşe Yılmaz",
    email: "ayse@mail.com",
    phone: "+90 532 123 45 67",
    registeredAt: "10 Ocak 2024",
    totalSpent: "₺846.500",
    orderCount: 12,
    address: "Bağdat Cad. No:123 Kadıköy/İstanbul",
    notes: "VIP Müşteri. Genelde Saint Laurent ürünlerini tercih ediyor.",
    orders: [
        { id: "#ORD-2024-001", date: "16 Şub 2024", total: "₺146.700", status: "Kargoda" },
        { id: "#ORD-2023-156", date: "20 Ara 2023", total: "₺42.500", status: "Teslim Edildi" },
        { id: "#ORD-2023-089", date: "15 Kas 2023", total: "₺89.000", status: "Teslim Edildi" },
    ]
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/musteriler" className="text-sm text-gray-500 hover:text-[#FF007F] mb-2 inline-flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                        Müşterilere Dön
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF007F] rounded-full flex items-center justify-center text-white text-xl font-bold">AY</div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#111827]">{CUSTOMER.name}</h1>
                            <p className="text-sm text-gray-500">{CUSTOMER.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#FF007F] hover:bg-[#D6006B] transition-colors flex items-center gap-2">
                        <span className="material-icons text-sm">save</span>
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <h2 className="font-bold text-[#111827]">Müşteri Bilgileri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                <input defaultValue="Ayşe" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                <input defaultValue="Yılmaz" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <input defaultValue={CUSTOMER.email} type="email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input defaultValue={CUSTOMER.phone} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                            <textarea defaultValue={CUSTOMER.address} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                            <textarea defaultValue={CUSTOMER.notes} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F]" placeholder="Müşteri hakkında notlar..." />
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="p-6 border-b border-[#E5E7EB]">
                            <h2 className="font-bold text-[#111827]">Sipariş Geçmişi</h2>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-3">Sipariş</th>
                                    <th className="px-6 py-3">Tarih</th>
                                    <th className="px-6 py-3">Tutar</th>
                                    <th className="px-6 py-3">Durum</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {CUSTOMER.orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-[#FF007F]">{order.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 font-medium">{order.total}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">{order.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/siparisler/${order.id.replace('#', '')}`} className="text-gray-400 hover:text-[#FF007F]"><span className="material-icons text-lg">visibility</span></Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <h2 className="font-bold text-[#111827]">Özet</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Toplam Harcama</span>
                                <span className="font-bold text-lg">{CUSTOMER.totalSpent}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Sipariş Sayısı</span>
                                <span className="font-bold">{CUSTOMER.orderCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Üyelik Tarihi</span>
                                <span className="font-medium text-sm">{CUSTOMER.registeredAt}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="font-bold text-[#111827]">Etiketler</h2>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-[#FF007F]/10 text-[#FF007F] rounded-full text-xs font-bold">VIP</span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Büyük Müşteri</span>
                        </div>
                        <button className="text-xs text-gray-400 hover:text-[#FF007F] flex items-center gap-1">
                            <span className="material-icons text-sm">add</span> Etiket Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
