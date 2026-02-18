"use client";

import Link from "next/link";
import { useState } from "react";

// Mock Data
const ORDER = {
    id: "#ORD-2024-001",
    date: "16 Şubat 2024, 14:30",
    status: "Hazırlanıyor",
    customer: { name: "Ayşe Yılmaz", email: "ayse@mail.com", phone: "+90 532 123 45 67", address: "Bağdat Cad. No:123 Kadıköy/İstanbul" },
    payment: { method: "Kredi Kartı", card: "**** 4242", total: "₺146.700" },
    items: [
        { id: 1, name: "Sac de Jour Nano", variant: "Tan / Nano", price: "₺84.500", qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV" },
        { id: 2, name: "GG Marmont Shoulder", variant: "Siyah / Small", price: "₺62.200", qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2" },
    ],
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [status, setStatus] = useState(ORDER.status);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/siparisler" className="text-sm text-gray-500 hover:text-[#FF007F] mb-2 inline-flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                        Siparişlere Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-[#111827]">Sipariş Detayı <span className="text-gray-400 font-normal">#{ORDER.id}</span></h1>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <span className="material-icons text-gray-500">print</span> Yazdır
                    </button>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-2 bg-[#FF007F] text-white border-none rounded-lg text-sm font-medium hover:bg-[#D6006B] cursor-pointer focus:ring-0"
                    >
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                        <option value="Kargoda">Kargoda</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                        <option value="İptal">İptal</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="p-6 border-b border-[#E5E7EB]">
                            <h2 className="font-bold text-[#111827]">Sipariş İçeriği</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {ORDER.items.map((item) => (
                                <div key={item.id} className="p-6 flex items-center gap-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.img} alt={item.name} className="w-16 h-20 object-cover rounded-lg border border-gray-100" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-[#111827]">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.variant}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{item.price}</p>
                                        <p className="text-sm text-gray-500">x{item.qty}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6 border-t border-[#E5E7EB] space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ara Toplam</span>
                                <span>{ORDER.payment.total}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Kargo</span>
                                <span className="text-green-600">Ücretsiz</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-[#111827] pt-2 border-t border-gray-200">
                                <span>Toplam</span>
                                <span>{ORDER.payment.total}</span>
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
                            <Link href="#" className="text-xs text-[#FF007F] font-medium hover:underline">Profili Gör</Link>
                        </div>
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-[#FF007F]/10 rounded-full flex items-center justify-center text-[#FF007F] font-bold">AY</div>
                            <div>
                                <p className="font-medium text-sm">{ORDER.customer.name}</p>
                                <p className="text-xs text-gray-500">{ORDER.customer.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">İletişim</label>
                                <p className="text-sm">{ORDER.customer.phone}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Teslimat Adresi</label>
                                <p className="text-sm">{ORDER.customer.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="font-bold text-[#111827]">Ödeme Bilgileri</h2>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="material-icons text-gray-400">credit_card</span>
                            <div>
                                <p className="text-sm font-medium">{ORDER.payment.method}</p>
                                <p className="text-xs text-gray-500">{ORDER.payment.card}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Durum</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ödendi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
