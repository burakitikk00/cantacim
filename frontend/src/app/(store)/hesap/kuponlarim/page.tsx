"use client";

import React from "react";
import Link from "next/link";

export default function CouponsPage() {
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
                        <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all" placeholder="Kupon kodunuzu giriniz" type="text" />
                    </div>
                    <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/10">Kodu Uygula</button>
                </div>
            </section>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coupon 1 */}
                <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-primary text-white p-6 flex flex-col justify-center items-center w-32 shrink-0">
                        <span className="text-3xl font-black">%20</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">İndirim</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                        {/* Decorative dots for ticket look */}
                        <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border dark:bg-zinc-900"></div>

                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-primary text-sm uppercase tracking-tight">Yeni Sezon Avantajı</h4>
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Aktif</span>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed">Tüm yeni sezon çanta alışverişlerinizde geçerli özel indirim.</p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kod:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-primary font-bold text-sm tracking-widest">ELITE2024</code>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-medium">Son Gün:</p>
                                <p className="text-[11px] font-bold text-primary">12.06.2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupon 2 */}
                <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-primary text-white p-6 flex flex-col justify-center items-center w-32 shrink-0">
                        <span className="text-xl font-black leading-none">500</span>
                        <span className="text-sm font-bold">TL</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">İndirim</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                        {/* Decorative dots for ticket look */}
                        <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border dark:bg-zinc-900"></div>

                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-primary text-sm uppercase tracking-tight">Sadakat Ödülü</h4>
                                <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Az Kaldı</span>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed">5.000 TL ve üzeri takı alışverişlerinizde anında indirim.</p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kod:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-primary font-bold text-sm tracking-widest">LOYAL500</code>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-medium">Son Gün:</p>
                                <p className="text-[11px] font-bold text-red-500 italic">Bugün</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupon 3 */}
                <div className="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex shadow-sm opacity-75 grayscale">
                    <div className="bg-gray-400 text-white p-6 flex flex-col justify-center items-center w-32 shrink-0">
                        <span className="text-3xl font-black">%10</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">İndirim</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between relative">
                        {/* Decorative dots for ticket look */}
                        <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border dark:bg-zinc-900"></div>

                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-500 text-sm uppercase tracking-tight">Hoş Geldin Hediyesi</h4>
                                <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Kullanıldı</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">İlk alışverişinize özel tanımlanan %10 indirim fırsatı.</p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-300 font-bold uppercase mb-1">Kod:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold text-sm tracking-widest line-through">WELCOME10</code>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-300 font-medium">Tarih:</p>
                                <p className="text-[11px] font-bold text-gray-400">15.01.2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupon 4 */}
                <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-primary text-white p-6 flex flex-col justify-center items-center w-32 shrink-0">
                        <span className="text-2xl font-black leading-none">Ücretsiz</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Kargo</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                        {/* Decorative dots for ticket look */}
                        <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border dark:bg-zinc-900"></div>

                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-primary text-sm uppercase tracking-tight">Elite Kargo</h4>
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Aktif</span>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed">Limit olmaksızın tüm siparişlerinizde ücretsiz kargo.</p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kod:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-primary font-bold text-sm tracking-widest">FREESHIP</code>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-medium">Son Gün:</p>
                                <p className="text-[11px] font-bold text-primary">31.12.2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions Footer */}
            <div className="mt-12 pt-6 border-t border-gray-100 text-gray-400 text-[11px] leading-relaxed">
                <p>* İndirim kuponları başka kampanyalarla birleştirilemez. Her kupon tek bir siparişte kullanılabilir. L'Elite Luxury Store kampanya koşullarını değiştirme hakkını saklı tutar.</p>
            </div>
        </div>
    );
}
