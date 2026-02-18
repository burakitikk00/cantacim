"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PaymentPage() {
    const [selectedShipping, setSelectedShipping] = useState("express");
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

    return (
        <main className="max-w-7xl mx-auto px-6 pb-12 pt-32 lg:px-20">
            {/* Breadcrumbs & Title */}
            <div className="mb-12">
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-4">
                    <Link href="/sepet" className="hover:text-primary transition-colors">Sepet</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary font-bold">Ödeme Bilgileri</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Onay</span>
                </nav>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary">Güvenli Ödeme</h2>
                <p className="text-zinc-500 mt-2">Lütfen siparişinizi tamamlamak için bilgilerinizi eksiksiz doldurunuz.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Checkout Steps */}
                <div className="lg:col-span-8 space-y-16">
                    {/* 1. Delivery Address Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">1</span>
                                <h3 className="text-2xl font-bold tracking-tight">Teslimat Adresi</h3>
                            </div>
                            <button className="text-sm font-bold underline underline-offset-4 hover:opacity-60 transition-opacity flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Yeni Adres Ekle
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Selected Address Card */}
                            <div className="relative border-2 border-primary p-6 rounded-xl bg-white shadow-sm cursor-pointer group">
                                <div className="absolute top-4 right-4 text-primary">
                                    <span className="material-symbols-outlined fill-1">check_circle</span>
                                </div>
                                <h4 className="font-bold text-lg mb-2">Ev Adresim</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                                    Harbiye Mah. Abdi İpekçi Cad. No:12/4<br />
                                    Nişantaşı, Şişli<br />
                                    34367 İstanbul, Türkiye
                                </p>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">+90 532 *** 45 67</p>
                            </div>
                            {/* Secondary Address Card */}
                            <div className="border border-zinc-200 p-6 rounded-xl bg-white hover:border-zinc-400 transition-colors cursor-pointer group">
                                <h4 className="font-bold text-lg mb-2">İş Adresi</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                                    Büyükdere Cad. No:199 Levent Loft<br />
                                    Levent, Beşiktaş<br />
                                    34394 İstanbul, Türkiye
                                </p>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">+90 212 *** 88 00</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Shipping Method Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">2</span>
                            <h3 className="text-2xl font-bold tracking-tight">Kargo Yöntemi</h3>
                        </div>
                        <div className="space-y-4">
                            <label className={`flex items-center justify-between p-5 border-2 ${selectedShipping === 'express' ? 'border-primary' : 'border-zinc-200'} bg-white rounded-xl cursor-pointer hover:border-primary transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-zinc-100 rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">Elite Express Delivery</p>
                                        <p className="text-sm text-zinc-500">Yarın teslimat (24 saat içinde)</p>
                                    </div>
                                </div>
                                <p className="font-extrabold text-primary">₺149,00</p>
                                <input
                                    className="hidden"
                                    name="shipping"
                                    type="radio"
                                    checked={selectedShipping === 'express'}
                                    onChange={() => setSelectedShipping('express')}
                                />
                            </label>
                            <label className={`flex items-center justify-between p-5 border-2 ${selectedShipping === 'standard' ? 'border-primary' : 'border-zinc-200'} bg-white rounded-xl cursor-pointer hover:border-primary transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-zinc-100 rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-zinc-400">inventory_2</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-700">Standart Kurye</p>
                                        <p className="text-sm text-zinc-400">2-3 iş günü içinde teslimat</p>
                                    </div>
                                </div>
                                <p className="font-extrabold text-primary">Ücretsiz</p>
                                <input
                                    className="hidden"
                                    name="shipping"
                                    type="radio"
                                    checked={selectedShipping === 'standard'}
                                    onChange={() => setSelectedShipping('standard')}
                                />
                            </label>
                        </div>
                    </section>

                    {/* 3. Payment Method Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">3</span>
                            <h3 className="text-2xl font-bold tracking-tight">Ödeme Bilgileri</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Card Simulation */}
                            <div className="w-full aspect-[1.58/1] bg-gradient-to-br from-zinc-800 to-black rounded-2xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute -right-10 -top-10 size-40 bg-white/20 rounded-full blur-3xl"></div>
                                    <div className="absolute -left-10 -bottom-10 size-40 bg-zinc-400/20 rounded-full blur-3xl"></div>
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="size-10 bg-zinc-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                        <span className="material-symbols-outlined text-white">contactless</span>
                                    </div>
                                    <div className="h-8">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="h-full object-contain filter brightness-200" alt="Mastercard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnmvZrl70UGwhBgooZ8aSS8oRuMIzm6bxfZFCe-eUqrn7eAsEDDbu8Gjd7G70CGVW7ZKmWS9nDcqZQ4GXY1wyY5fdeNk-LEiRtLcgilEg9MHFcXeJpjE1mpm4GPGNxu7zJ1QSBxZiC4f3uu4D2Okl_du-rDU8rWVegzlGkGxSIvGzEx_ipPGaiLSJkBg0JtmlwFkotvhMggKvf-o7aVRdhg0bWDrF66-aBa-Pq-m4KZMSFlD0zluM1hwvjB-TE3THhJ3wMy3Y4CwpF" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs uppercase tracking-[0.2em] opacity-50 mb-1">Kart Sahibi</p>
                                    <p className="text-lg font-medium tracking-widest uppercase">M**** K****</p>
                                </div>
                                <div className="flex justify-between items-end relative z-10">
                                    <p className="text-2xl font-mono tracking-[0.15em]">**** **** **** 4242</p>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest opacity-50">Sona Erme</p>
                                        <p className="font-mono">12/28</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Kart Üzerindeki İsim</label>
                                    <input className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Ad Soyad" type="text" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Kart Numarası</label>
                                    <div className="relative">
                                        <input className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="0000 0000 0000 0000" type="text" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <span className="material-symbols-outlined text-zinc-400">credit_card</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">SKT</label>
                                        <input className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="AA / YY" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">CVV</label>
                                        <input className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="123" type="text" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        className="w-5 h-5 border-zinc-300 text-primary focus:ring-primary rounded transition-all"
                                        type="checkbox"
                                        checked={billingSameAsShipping}
                                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                    />
                                </div>
                                <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Fatura adresi teslimat adresiyle aynı olsun.</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input className="w-5 h-5 border-zinc-300 text-primary focus:ring-primary rounded transition-all" type="checkbox" />
                                </div>
                                <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">3D Secure ile güvenli ödeme yapmak istiyorum.</span>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 pb-6 border-b border-zinc-100">Sipariş Özeti</h3>
                        {/* Item List Preview */}
                        <div className="space-y-6 mb-8">
                            <div className="flex gap-4">
                                <div className="size-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="w-full h-full object-cover" alt="Luxury red sneaker shoe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByL3ceVbFvW7uYEwwRmwi-UiYl5qIKes6baZ4_2034l2jgC7gYb4Tc6zfiK1hupwrJiThc5gBOiIxw-vEYy114xIMiaawj-Lcck8QdRYFAL-cMk59STDDrT9DSNp94g_2gji7c4dE2oKD-VFnJM-U_BJnI_E3yXzuaip6YLtcWgPh4D71X3RNuI-6EkSBgDZJg3-L0Avp1cYBagsM_lQ8QmzIycPPOGLQcbyPPK6wvhigszi2TXavwH8awNbf0XTlu5_kcZWRXDmw6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary line-clamp-1">Velvet Nero Sneakers</p>
                                    <p className="text-xs text-zinc-500 mt-1">Beden: 42 | Siyah</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs font-medium">1 Adet</span>
                                        <span className="text-sm font-extrabold">₺4.250,00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="size-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="w-full h-full object-cover" alt="Luxury black leather handbag" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5Xsr7uS7Yt1MbwDIGRYl2hl2jQtxCD8rMT4Rhi8BR-6yxvGS8yLxvBZzd97g30UzaxJuObROa-sXfH76zPfd6q33XOHuwv1iu8wcWjFJh3OocN3GVppoAEuslGVYvnqCXcYlh8wp5JE9dv5e2v31tZqs21vs95S7vEcuRPg0xUqIsGodgcFmfQCSGT2W5BZ8bd15U8_iNG0qK1ElPcE_JHhOq6MF3t5M6auTRt6Y_GW7OlH7M7OLV594AmMTPu-KSOlRYZE2c4_I-" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary line-clamp-1">L'Elite Signature Bag</p>
                                    <p className="text-xs text-zinc-500 mt-1">Tek Beden | Deri</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs font-medium">1 Adet</span>
                                        <span className="text-sm font-extrabold">₺12.400,00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Totals */}
                        <div className="space-y-4 pt-6 border-t border-zinc-100 mb-8">
                            <div className="flex justify-between text-zinc-500">
                                <span>Ara Toplam</span>
                                <span>₺16.650,00</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Kargo Ücreti</span>
                                <span className="text-primary font-medium">
                                    {selectedShipping === 'express' ? '₺149,00' : 'Ücretsiz'}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>KDV (%20)</span>
                                <span>₺3.330,00</span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-zinc-100">
                                <span className="text-lg font-bold">Toplam</span>
                                <div className="text-right">
                                    <p className="text-2xl font-extrabold tracking-tighter text-primary">
                                        {selectedShipping === 'express' ? '₺20.129,00' : '₺19.980,00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Complete Order Button */}
                        <button className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                            Siparişi Tamamla
                        </button>
                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="Visa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAM79h086N4JwHQzeHJf9MoevzYcUW0qNRH0fgf_giOpateQVwAVTRhmxvaqmjIcfGgBwbyVc_XlTDo0X4eqY0wSTuIyTiCH9Oc-U5sOr9ozCUJaJKmQ-gePh5nGla2XGhDiLoYYz9Ui3N0I5QllEv9axTCzAUXgJhFEJmiHQgYw8Dz78We33ugoQa_M5HpKre2w0-TFcG3L9SGQ4jL41JWz4BEFSiah5EORPPZbzoQ2OWrPLq5fWJ0y-amEWam3-5slthJeAhsksP" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="PayPal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHmBBCUwcQD-SHv9SxzZ1Lo0uoOKqGLjVftqbxOJmCjeYALStTlTSzxCoFk_Sd-Eg7tuSrO-5iQ0fsPgjjWGhNUYi-PgCuE_AUatxrtezN5croUEiYz55l3yM6sapyjRwUZ6P1Zl8Sepu5p3szI8nSqHpkb-5BIk_o-EN6ZkxOZBdC213B2jPVZDqe1aDERr0LNquc4W0y8SNR5kVmxIOsxIJrD7e21mPjMGi2E4ynhQsbJ8TUrJGECPcKUnIpfuU_c_djQVmT3MJ0" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="Mastercard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj5wl8WTCn83qpxhN926l1-tUX4zqx03Iecio0wLtBxYkfJXNnsjA8EVAMUaLmAP4rbr5yy472shkP06pwj1S2-FB-aZRxtczsqN0XT_ir_ywBh_d7ePt8h-7rGOK2UzK_IT2-ZAnfvp8Ks360DQIOdWdT_pA5-k_NuOKBL4JVcSyoqmR7cyKE23Epf_2BjouA0Yqdqthc-o1SyhmEB2h1D6FN0gF0Oyyv7VZkrOPlr7rZRfK0h3hlXCSNrJGJfBvDEzno-wn-rvCc" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                256-Bit SSL Sertifikalı Güvenli Ödeme
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
