"use client";

import { Suspense, useState } from "react";
import Link from "next/link";

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <main className="min-h-screen flex">
            {/* Left: Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Luxury Fashion" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8QtKVzT_HEqLRDxl73THujO_12fJIiRzxBsmD8c4v6ndLBbxcUU3UkXUjCSbNVUvXQsAI6gPshv5nV3avvfv_Igtrv9ZngT8uPcmzSVvYWzq1-DEIs8VeKTwiGZjLvifhdSTQHaJqmxEa_jqYiarOJu3DRCX8075umOnetJp8HqNDf-xFPkHf9Ysz_mdAyu3n6Ihhq5y2tVE2VUN-emUdapPRV9hyuEcZHQFcZTyMZs6-7K32S88MQ00BfvFUB81w2gQFglBe9OA6" />
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <div className="text-center text-white">
                        <span className="material-symbols-outlined text-5xl mb-4 block">diamond</span>
                        <h2 className="text-4xl font-extrabold tracking-tighter">L&apos;ELITE</h2>
                        <p className="text-white/70 mt-2 text-sm tracking-widest uppercase">Luxury Store</p>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tighter mb-8 lg:hidden">
                            <span className="material-symbols-outlined text-3xl">diamond</span>
                            L&apos;ELITE
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">{isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}</h1>
                        <p className="text-primary/50 mt-2 text-sm">{isLogin ? "Hesabınıza giriş yapın" : "Ayrıcalıklı alışveriş deneyimine katılın"}</p>
                    </div>

                    <form className="space-y-5">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Ad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Adınız" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Soyad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Soyadınız" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">E-posta</label>
                            <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="ornek@email.com" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Şifre</label>
                            <input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="••••••••" />
                        </div>
                        {isLogin && (
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 border-gray-300 rounded focus:ring-primary text-primary" />
                                    <span className="text-sm text-primary/60">Beni hatırla</span>
                                </label>
                                <a href="#" className="text-sm font-medium text-primary hover:text-primary/60 transition-colors">Şifremi unuttum</a>
                            </div>
                        )}
                        <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
                            {isLogin ? "GİRİŞ YAP" : "KAYIT OL"}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-primary/40 uppercase tracking-widest">veya</span></div>
                    </div>

                    <button className="w-full border border-gray-200 py-4 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google ile devam et
                    </button>

                    <p className="text-center text-sm text-primary/50">
                        {isLogin ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}{" "}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:text-primary/60 transition-colors">
                            {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span></div>}>
            <AuthForm />
        </Suspense>
    );
}
