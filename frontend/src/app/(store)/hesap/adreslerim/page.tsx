"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AddressesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const handleCardClick = (id: string, isDefault: boolean) => {
        if (isDefault) return;
        setSelectedAddressId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDefault = () => {
        // Here you would typically call a server action to update the default address
        console.log(`Address ${selectedAddressId} set as default`);
        setIsModalOpen(false);
        setSelectedAddressId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAddressId(null);
    };

    return (
        <div className="flex-1 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <nav className="flex gap-2 text-xs font-semibold text-primary/40 uppercase tracking-widest mb-3">
                        <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                        <span>/</span>
                        <Link href="/hesap" className="text-primary/60 hover:text-primary">Hesabım</Link>
                        <span>/</span>
                        <span className="text-primary">Adreslerim</span>
                    </nav>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Adreslerim</h1>
                    <p className="text-sm md:text-base text-primary/60 mt-2 max-w-xl">Teslimat adreslerinizi buradan güncelleyebilir veya yeni bir tane ekleyebilirsiniz.</p>
                </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {/* Add New Address Card */}
                <Link href="/hesap/adreslerim/yeni" className="group flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-primary/10 rounded-xl hover:border-primary/40 hover:bg-white transition-all min-h-[220px]">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-3xl">add</span>
                    </div>
                    <span className="font-bold text-primary uppercase tracking-wider text-sm">Yeni Adres Ekle</span>
                </Link>

                {/* Address Card 1 (Default) */}
                <div
                    onClick={() => handleCardClick("1", true)}
                    className="relative bg-white dark:bg-background-dark p-8 rounded-xl border-2 border-primary shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between min-h-[220px] cursor-default"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-lg tracking-tight">Ev Adresim</h3>
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">Varsayılan</span>
                            </div>
                            <span className="material-symbols-outlined text-primary/20">home</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Ahmet Yılmaz</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Zeytinlik Mah. Halkalı Cad. No:45 Daire:12</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Bakırköy, İstanbul 34140</p>
                            <p className="text-primary/80 font-semibold text-xs mt-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">phone</span>
                                +90 532 123 45 67
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-8 pt-4 border-t border-primary/5">
                        <Link
                            href="/hesap/adreslerim/1"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Düzenle
                        </Link>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                        </button>
                    </div>
                </div>

                {/* Address Card 2 */}
                <div
                    onClick={() => handleCardClick("2", false)}
                    className="group bg-white dark:bg-background-dark p-8 rounded-xl border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between min-h-[220px] cursor-pointer hover:border-primary/30 relative overflow-hidden"
                >
                    {/* Hover Overlay Text */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm border border-primary/10">
                            Varsayılan Yap
                        </span>
                    </div>

                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-extrabold text-lg tracking-tight">İş Yeri</h3>
                            <span className="material-symbols-outlined text-primary/20">business</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Ahmet Yılmaz - L'Elite Office</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Büyükdere Cad. No:193 K:14</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Levent, Beşiktaş, İstanbul 34394</p>
                            <p className="text-primary/80 font-semibold text-xs mt-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">phone</span>
                                +90 212 987 65 43
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-8 pt-4 border-t border-primary/5 relative z-10">
                        <Link
                            href="/hesap/adreslerim/2"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Düzenle
                        </Link>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                        </button>
                    </div>
                </div>

                {/* Address Card 3 */}
                <div
                    onClick={() => handleCardClick("3", false)}
                    className="group bg-white dark:bg-background-dark p-8 rounded-xl border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between min-h-[220px] cursor-pointer hover:border-primary/30 relative overflow-hidden"
                >
                    {/* Hover Overlay Text */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm border border-primary/10">
                            Varsayılan Yap
                        </span>
                    </div>

                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-extrabold text-lg tracking-tight">Yazlık</h3>
                            <span className="material-symbols-outlined text-primary/20">beach_access</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Ahmet Yılmaz</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Alaçatı Mah. 13002 Sok. No:5</p>
                            <p className="text-primary/60 text-sm leading-relaxed">Çeşme, İzmir 35930</p>
                            <p className="text-primary/80 font-semibold text-xs mt-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">phone</span>
                                +90 532 123 45 67
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-8 pt-4 border-t border-primary/5 relative z-10">
                        <Link
                            href="/hesap/adreslerim/3"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Düzenle
                        </Link>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                        </button>
                    </div>
                </div>
            </div>

            {/* Information Box */}
            <div className="mt-12 p-6 bg-primary/5 rounded-xl flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Teslimat Hakkında Not</h4>
                    <p className="text-xs text-primary/60 leading-relaxed">
                        Siparişlerinizi en hızlı şekilde ulaştırabilmemiz için lütfen adres bilgilerinizin güncel ve eksiksiz olduğundan emin olunuz. Varsayılan adresiniz ödeme adımında otomatik olarak seçilecektir.
                    </p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold">Varsayılan Adres Değiştirilsin mi?</h3>
                            <p className="text-sm text-zinc-500">
                                Bu adresi varsayılan teslimat adresiniz olarak ayarlamak istediğinize emin misiniz?
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-semibold text-sm text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleConfirmDefault}
                                    className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
                                >
                                    Tamam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
