"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getUserProfile, changePassword, deactivateAccount } from "@/actions/user";
import { signOut } from "next-auth/react";

interface UserData {
    name: string | null;
    surname: string | null;
    email: string;
    image: string | null;
    tier: "STANDARD" | "ELITE" | "PLATINUM";
    emailVerified: Date | null;
    isActive: boolean;
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDeactivating, setIsDeactivating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getUserProfile();
                if (res.user) {
                    // @ts-ignore
                    setUser(res.user);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, []);

    const handlePasswordChange = async (formData: FormData) => {
        startTransition(async () => {
            const res = await changePassword(formData);
            if (res.error) {
                alert(res.error);
            } else {
                alert(res.message);
                const form = document.getElementById("password-form") as HTMLFormElement;
                if (form) form.reset();
            }
        });
    };

    const handleDeactivate = async () => {
        if (!confirm("Hesabınızı dondurmak istediğinize emin misiniz? Bu işlemden sonra giriş yapamazsınız.")) {
            return;
        }

        setIsDeactivating(true);
        try {
            const res = await deactivateAccount();
            if (res.error) {
                alert(res.error);
            } else {
                alert(res.message);
                signOut({ callbackUrl: "/" });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeactivating(false);
        }
    };

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
        <div className="w-full max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Hesap Ayarları</h2>
                    <p className="text-zinc-500">Güvenlik, bildirimler ve hesap tercihlerinizi buradan yönetebilirsiniz.</p>
                </div>
                {user && (
                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full md:w-auto">
                        <div className="w-12 h-12 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt="User"
                                className="w-full h-full object-cover"
                                src={user.image || "https://ui-avatars.com/api/?name=" + (user.name || "User") + "&background=random"}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{user.name} {user.surname}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${getTierBadgeStyles(user.tier)}`}>
                                    {user.tier} Üye
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Security - Password Change */}
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <h3 className="text-lg font-bold">Güvenlik</h3>
                        </div>

                        <form id="password-form" action={handlePasswordChange} className="space-y-6">
                            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">Şifre Değiştir</h4>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Mevcut Şifre</label>
                                <input name="currentPassword" required className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="password" placeholder="••••••••" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Yeni Şifre</label>
                                    <input name="newPassword" required className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="password" placeholder="••••••••" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Yeni Şifre (Tekrar)</label>
                                    <input name="confirmPassword" required className="w-full rounded-lg border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20" type="password" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button disabled={isPending} className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold tracking-wide hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70">
                                    {isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Notification Settings */}
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <span className="material-symbols-outlined text-primary">notifications_active</span>
                            <h3 className="text-lg font-bold">Bildirim Tercihleri</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold">E-posta Bülteni</p>
                                    <p className="text-xs text-zinc-500">Kampanyalar ve yeni ürünlerden haberdar olun.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold">Sipariş Bilgilendirmeleri</p>
                                    <p className="text-xs text-zinc-500">Sipariş durumunuz değiştiğinde e-posta ve SMS alın.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold">Kupon ve İndirimler</p>
                                    <p className="text-xs text-zinc-500">Size özel tanımlanan indirim kuponlarını kaçırmayın.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-red-600">
                            <span className="material-symbols-outlined">report_problem</span>
                            <h3 className="text-lg font-bold">Tehlikeli Bölge</h3>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <p className="text-sm font-bold text-red-700 dark:text-red-400">Hesabı Dondur</p>
                                <p className="text-xs text-red-600/70 dark:text-red-400/60">Hesabınızı dondurarak siparişlerinizi ve bilgilerinizi saklayabilir, istediğiniz zaman geri dönebilirsiniz.</p>
                            </div>
                            <button
                                onClick={handleDeactivate}
                                disabled={isDeactivating}
                                className="whitespace-nowrap bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                            >
                                {isDeactivating ? "İşleniyor..." : "Hesabı Dondur"}
                            </button>
                        </div>
                    </section>
                </div>

                {/* Info Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-primary text-white rounded-2xl p-8 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`material-symbols-outlined text-3xl ${user?.emailVerified ? "text-emerald-400" : "opacity-50"}`}>verified_user</span>
                        </div>
                        <h4 className="text-xl font-bold mb-4">Hesap Durumu</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="opacity-70">Hesap Durumu</span>
                                <span className={`font-bold ${user?.isActive ? "text-emerald-400" : "text-red-400"}`}>{user?.isActive ? "Aktif" : "Dondurulmuş"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="opacity-70">E-posta Doğrulama</span>
                                <span className={`font-bold ${user?.emailVerified ? "text-emerald-400" : "opacity-50"}`}>{user?.emailVerified ? "Doğrulandı" : "Bekliyor"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="opacity-70">2FA Güvenliği</span>
                                <span className="text-white/50 italic">Pasif</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="text-lg font-bold mb-6">Yardım & Destek</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="flex items-center gap-3 text-sm text-zinc-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-zinc-400">help</span>
                                    Sıkça Sorulan Sorular
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-sm text-zinc-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-zinc-400">mail</span>
                                    Bize Ulaşın
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-sm text-zinc-600 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-zinc-400">gavel</span>
                                    KVKK ve Gizlilik
                                </a>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl transition-colors text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Oturumu Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
