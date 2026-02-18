"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getUserProfile, updateUserProfile, verifyEmail } from "@/actions/user";

interface UserData {
    name: string | null;
    surname: string | null;
    email: string;
    phone: string | null;
    birthday: string | null;
    tier: "STANDARD" | "ELITE" | "PLATINUM";
    totalSpent: number;
    image: string | null;
    emailVerified: Date | null;
}

interface TierData {
    currentTier: "STANDARD" | "ELITE" | "PLATINUM";
    nextTier: string | null;
    amountForNextTier: number;
    progress: number;
    totalSpent: number;
}

export default function AccountInfoPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [tierLogic, setTierLogic] = useState<TierData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getUserProfile();
                if (res.error) {
                    console.error(res.error);
                } else if (res.user && res.nextTierLogic) {
                    // @ts-ignore
                    setUser(res.user);
                    // @ts-ignore
                    setTierLogic(res.nextTierLogic);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const res = await updateUserProfile(formData);
            if (res.error) {
                alert(res.error);
            } else {
                alert(res.message);
                const updated = await getUserProfile();
                if (updated.user) {
                    // @ts-ignore
                    setUser(updated.user);
                }
            }
        });
    };

    const handleVerifyEmail = async () => {
        setIsVerifying(true);
        try {
            const res = await verifyEmail();
            if (res.error) {
                alert(res.error);
            } else {
                alert(res.message);
                const updated = await getUserProfile();
                if (updated.user) {
                    // @ts-ignore
                    setUser(updated.user);
                }
            }
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-500">Yükleniyor...</div>;
    }

    if (!user || !tierLogic) {
        return <div className="p-8 text-center text-red-500">Kullanıcı bilgileri yüklenemedi.</div>;
    }

    const getTierBadgeStyles = (tier: string) => {
        switch (tier) {
            case "PLATINUM":
                return "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-800";
            case "ELITE":
                return "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 text-amber-900";
            default:
                return "bg-zinc-100 text-zinc-600";
        }
    };

    return (
        <div className="w-full">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Profil Ayarları</h2>
                    <p className="text-zinc-500">Kişisel bilgilerinizi ve hesap tercihlerinizi buradan güncelleyebilirsiniz.</p>
                </div>

            </header>

            {/* Settings Form */}
            <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Info Section */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <span className="material-symbols-outlined text-zinc-400">badge</span>
                            <h3 className="text-lg font-bold">Kişisel Bilgiler</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Ad</label>
                                <input name="name" className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="text" defaultValue={user.name || ""} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Soyad</label>
                                <input name="surname" className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="text" defaultValue={user.surname || ""} />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2 relative">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">E-posta Adresi</label>
                                    <span className="text-[10px] text-zinc-400">E-postayı değiştirirseniz tekrar doğrulama yapmanız gerekmektedir.</span>
                                </div>
                                <div className="relative group">
                                    <input
                                        name="email"
                                        className={`w-full rounded-lg border focus:ring-0 py-3 px-4 text-sm transition-all pr-32
                                            ${user.emailVerified
                                                ? "border-emerald-200 bg-emerald-50/20 focus:border-emerald-500"
                                                : "border-red-200 bg-red-50/20 focus:border-red-500"
                                            }`}
                                        type="email"
                                        defaultValue={user.email}
                                    />
                                    <div className="absolute right-2 top-1.5 flex items-center gap-2">
                                        {user.emailVerified ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Doğrulandı
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleVerifyEmail}
                                                disabled={isVerifying}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                {isVerifying ? "..." : "E-posta Adresini Doğrula"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Telefon Numarası</label>
                                <input name="phone" className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="tel" defaultValue={user.phone || ""} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Doğum Tarihi</label>
                                <input
                                    name="birthday"
                                    className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20"
                                    type="date"
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    defaultValue={user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ""}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Content (Summary/Status) */}
                <div className="space-y-6">
                    <div className="bg-primary text-white rounded-2xl p-8 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <span className="material-symbols-outlined text-3xl opacity-50">diamond</span>
                            <span className="text-[10px] font-bold tracking-widest border border-white/30 rounded-full px-3 py-1 uppercase">Aktif</span>
                        </div>
                        <h4 className="text-xl font-bold mb-2">{user.tier} Status</h4>

                        {tierLogic.nextTier ? (
                            <p className="text-white/70 text-sm leading-relaxed mb-6">
                                {tierLogic.nextTier} ayrıcalıklarından yararlanmak için <span className="font-bold text-white">{tierLogic.amountForNextTier.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span> daha harcama yapmanız gerekiyor.
                            </p>
                        ) : (
                            <p className="text-white/70 text-sm leading-relaxed mb-6">
                                En üst seviye ayrıcalıkların keyfini çıkarın!
                            </p>
                        )}

                        <div className="w-full bg-white/20 h-1.5 rounded-full mb-2">
                            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${tierLogic.progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-80">
                            <span>{user.tier}</span>
                            <span>{tierLogic.nextTier || "MAX"}</span>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="lg:col-span-3 mt-4 flex items-center justify-end gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                    <button type="button" className="px-8 py-3 rounded-lg text-sm font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors font-bold">
                        İptal
                    </button>
                    <button disabled={isPending} className="bg-primary text-white px-12 py-3 rounded-lg text-sm font-bold tracking-wide hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70">
                        {isPending ? "Güncelleniyor..." : "Bilgileri Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}
