"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrderConfirmationPreviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // In a real app, you would fetch this data from a global store or context
    // For now, we'll use mock data matching the previous steps
    const mockAddress = {
        title: "Ev Adresim",
        address: "Harbiye Mah. Abdi İpekçi Cad. No:12/4",
        district: "Nişantaşı, Şişli",
        city: "34367 İstanbul, Türkiye"
    };

    const shippingMethod = searchParams.get("shipping") || "express";
    const shippingCost = shippingMethod === "express" ? 149 : 0;
    const subTotal = 16650;
    const total = subTotal + shippingCost;

    const handleConfirmOrder = () => {
        // Logic to finalize order
        router.push("/siparis-onay");
    };

    return (
        <main className="max-w-7xl mx-auto px-6 pb-12 pt-32 lg:px-20">
            {/* Breadcrumbs & Title */}
            <div className="mb-12">
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-4">
                    <Link href="/sepet" className="hover:text-primary transition-colors">Sepet</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <Link href="/odeme" className="hover:text-primary transition-colors">Ödeme Bilgileri</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary font-bold">Onay</span>
                </nav>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary">Sipariş Onayı</h2>
                <p className="text-zinc-500 mt-2">Lütfen sipariş detaylarınızı son kez kontrol edip onaylayınız.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Details */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Summary Card */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-8">
                        {/* Address Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">location_on</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Teslimat Adresi</h4>
                                <p className="font-medium text-zinc-900">{mockAddress.title}</p>
                                <p className="text-sm text-zinc-500 leading-relaxed mt-1">
                                    {mockAddress.address}<br />
                                    {mockAddress.district}, {mockAddress.city}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">local_shipping</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Kargo Yöntemi</h4>
                                <p className="font-medium text-zinc-900">
                                    {shippingMethod === 'express' ? 'Elite Express Delivery' : 'Standart Kurye'}
                                </p>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {shippingMethod === 'express' ? 'Yarın teslimat (24 saat içinde)' : '2-3 iş günü içinde teslimat'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">credit_card</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Ödeme Yöntemi</h4>
                                <div className="flex items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="h-6" alt="Mastercard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj5wl8WTCn83qpxhN926l1-tUX4zqx03Iecio0wLtBxYkfJXNnsjA8EVAMUaLmAP4rbr5yy472shkP06pwj1S2-FB-aZRxtczsqN0XT_ir_ywBh_d7ePt8h-7rGOK2UzK_IT2-ZAnfvp8Ks360DQIOdWdT_pA5-k_NuOKBL4JVcSyoqmR7cyKE23Epf_2BjouA0Yqdqthc-o1SyhmEB2h1D6FN0gF0Oyyv7VZkrOPlr7rZRfK0h3hlXCSNrJGJfBvDEzno-wn-rvCc" />
                                    <div className="text-sm text-zinc-600">
                                        <span className="font-medium">Mastercard</span>
                                        <span className="mx-2">•</span>
                                        <span className="font-mono">**** 4242</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <Link
                            href="/odeme"
                            className="text-zinc-500 font-bold text-sm hover:text-zinc-800 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Geri Dön ve Düzenle
                        </Link>
                    </div>

                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 pb-6 border-b border-zinc-100">Özet</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-zinc-500">
                                <span>Ara Toplam</span>
                                <span>₺{subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Kargo Ücreti</span>
                                <span className={shippingCost === 0 ? "text-green-600 font-medium" : "text-primary font-medium"}>
                                    {shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-zinc-100">
                                <span className="text-lg font-bold">Toplam</span>
                                <div className="text-right">
                                    <p className="text-2xl font-extrabold tracking-tighter text-primary">
                                        ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Onayla ve Bitir
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                "Onayla ve Bitir" butonuna basarak <Link href="#" className="underline">Mesafeli Satış Sözleşmesi</Link>'ni ve <Link href="#" className="underline">Ön Bilgilendirme Formu</Link>'nu okuduğunuzu ve kabul ettiğinizi onaylamış olursunuz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
