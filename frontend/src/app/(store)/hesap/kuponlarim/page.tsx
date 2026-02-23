"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVisibleCoupons } from "./actions";

interface CouponData {
    id: string;
    name: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    buyX: number | null;
    getY: number | null;
    validUntil: string | null;
    maxUses: number | null;
    usedCount: number;
}

function getCouponDisplay(c: CouponData) {
    if (c.discountType === "PERCENTAGE") return { main: `%${c.discountValue}`, sub: "İndirim" };
    if (c.discountType === "FIXED") return { main: `${c.discountValue}`, sub: "TL İndirim" };
    if (c.discountType === "BUY_X_GET_Y") return { main: `${c.buyX} Al`, sub: `${c.getY} Öde` };
    if (c.discountType === "FREE_SHIPPING") return { main: "Ücretsiz", sub: "Kargo" };
    return { main: "", sub: "" };
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getDaysRemaining(iso: string | null) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [loading, setLoading] = useState(true);
    const [couponInput, setCouponInput] = useState("");

    useEffect(() => {
        (async () => {
            const res = await getMyVisibleCoupons();
            if (res.success) setCoupons(res.data as CouponData[]);
            setLoading(false);
        })();
    }, []);

    return (
        <div className="flex-1">
            <div className="mb-8">
                <nav className="flex text-xs text-gray-400 mb-2 gap-2 font-medium">
                    <Link href="/" className="hover:text-primary transition-colors">Hesabım</Link>
                    <span>/</span>
                    <span className="text-primary">İndirim Kuponlarım</span>
                </nav>
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">İndirim Kuponlarım</h1>
                <p className="text-gray-500 mt-2 text-sm">Size özel tanımlanmış ayrıcalıklı indirimleri buradan takip edebilirsiniz.</p>
            </div>

            {/* Add New Coupon Section */}
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-primary">Yeni Kupon Ekle</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">sell</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                            placeholder="Kupon kodunuzu giriniz"
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        />
                    </div>
                    <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/10">
                        Kodu Uygula
                    </button>
                </div>
            </section>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                </div>
            )}

            {/* Empty */}
            {!loading && coupons.length === 0 && (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">local_offer</span>
                    <p className="text-gray-500 text-sm">Henüz size tanımlanmış bir kupon bulunmuyor.</p>
                </div>
            )}

            {/* Coupons Grid */}
            {!loading && coupons.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coupons.map((c) => {
                        const display = getCouponDisplay(c);
                        const daysLeft = getDaysRemaining(c.validUntil);
                        const isUrgent = daysLeft !== null && daysLeft <= 3;

                        return (
                            <div key={c.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-primary text-white p-6 flex flex-col justify-center items-center w-32 shrink-0">
                                    <span className={`font-black leading-none ${display.main.length > 5 ? "text-lg" : "text-3xl"}`}>
                                        {display.main}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{display.sub}</span>
                                </div>
                                <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                                    <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border" />
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-tight">{c.name || c.code}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isUrgent
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-green-100 text-green-700"
                                                }`}>
                                                {isUrgent ? "Az Kaldı" : "Aktif"}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed">{c.description || ""}</p>
                                    </div>
                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kod:</p>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-primary font-bold text-sm tracking-widest">{c.code}</code>
                                        </div>
                                        <div className="text-right">
                                            {c.validUntil ? (
                                                <>
                                                    <p className="text-[10px] text-gray-400 font-medium">Son Gün:</p>
                                                    <p className={`text-[11px] font-bold ${isUrgent ? "text-red-500 italic" : "text-primary"}`}>
                                                        {daysLeft !== null && daysLeft <= 0 ? "Bugün" : formatDate(c.validUntil)}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-[10px] text-gray-400 font-medium">Süresiz</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Terms */}
            <div className="mt-12 pt-6 border-t border-gray-100 text-gray-400 text-[11px] leading-relaxed">
                <p>* İndirim kuponları başka kampanyalarla birleştirilemez. Her kupon tek bir siparişte kullanılabilir. Lina Butik kampanya koşullarını değiştirme hakkını saklı tutar.</p>
            </div>
        </div>
    );
}
