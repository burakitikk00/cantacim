"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthSidebar from "../auth/AuthSidebar";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
    const count = useCartStore((s) => s.items.length);
    const { data: session, status } = useSession();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Token süresi dolmuşsa veya user yoksa "unauthenticated" gibi davran
    const isAuthenticated = status === "authenticated" && !!session?.user;

    const fetchFavoriteCount = useCallback(() => {
        if (isAuthenticated) {
            fetch("/api/favorites")
                .then(res => {
                    if (!res.ok) return { count: 0 };
                    return res.json();
                })
                .then(data => setFavoriteCount(data.count || 0))
                .catch(() => setFavoriteCount(0));
        } else {
            setFavoriteCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchFavoriteCount();
    }, [fetchFavoriteCount]);

    // Listen for favorite changes from FavoriteButton (debounced)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const handler = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fetchFavoriteCount(), 300);
        };
        window.addEventListener("favoriteChanged", handler);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("favoriteChanged", handler);
        };
    }, [fetchFavoriteCount]);

    // Dış tıklamada profil menüsünü kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        if (isProfileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileOpen]);

    const handleAuthAction = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setIsAuthOpen(true);
        }
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setIsAuthOpen(true);
        } else {
            e.preventDefault();
            setIsProfileOpen(!isProfileOpen);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Hata olsa bile çıkışı engelleme
        }
        signOut({ callbackUrl: "/" });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/5 glass-header">
            <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="text-2xl font-extrabold tracking-tighter flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">diamond</span>
                        L&apos;ELITE
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/urunler" className="text-sm font-medium hover:text-primary/60 transition-colors">
                            Koleksiyon
                        </Link>
                        <Link href="/urunler?cat=cantalar" className="text-sm font-medium hover:text-primary/60 transition-colors">
                            Çantalar
                        </Link>
                        <Link href="/urunler?cat=gozlukler" className="text-sm font-medium hover:text-primary/60 transition-colors">
                            Gözlükler
                        </Link>
                        <Link href="/hikayemiz" className="text-sm font-medium hover:text-primary/60 transition-colors">
                            Hikayemiz
                        </Link>
                        <Link href="/iletisim" className="text-sm font-medium hover:text-primary/60 transition-colors">
                            İletişim
                        </Link>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6">
                    {/* Expanding Search */}
                    <div className="relative flex items-center group">
                        <input
                            className="w-10 group-hover:w-64 transition-all duration-300 ease-in-out border-none bg-transparent focus:ring-0 text-sm pl-10 pr-4 py-2 cursor-pointer group-hover:cursor-text"
                            placeholder="Marka, ürün ara..."
                            type="text"
                        />
                        <span className="material-symbols-outlined absolute left-2 pointer-events-none text-xl">search</span>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={handleProfileClick}
                            className="hover:opacity-60 transition-opacity"
                        >
                            <span className="material-symbols-outlined">person</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && isAuthenticated && (
                            <div
                                className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-primary/5 overflow-hidden"
                                style={{ animation: "profileDropdownIn 0.2s ease-out" }}
                            >
                                <div className="py-2">
                                    <Link
                                        href="/hesap/ayarlar"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary/80 hover:bg-primary/[0.03] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        Hesap Ayarları
                                    </Link>
                                    <Link
                                        href="/hesap/siparisler"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary/80 hover:bg-primary/[0.03] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">package_2</span>
                                        Siparişlerim
                                    </Link>
                                    <Link
                                        href="/hesap/bilgilerim"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary/80 hover:bg-primary/[0.03] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">person</span>
                                        Profilim
                                    </Link>
                                </div>
                                <div className="border-t border-primary/5">
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <NotificationBell isAuthenticated={isAuthenticated} />

                    <Link
                        href="/hesap/favorilerim"
                        onClick={handleAuthAction}
                        className="hover:opacity-60 transition-opacity relative"
                    >
                        <span className="material-symbols-outlined">favorite</span>
                        {favoriteCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {favoriteCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/sepet"
                        onClick={handleAuthAction}
                        className="hover:opacity-60 transition-opacity relative"
                    >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
            <AuthSidebar isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            {/* Dropdown animation */}
            <style jsx>{`
                @keyframes profileDropdownIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </header>
    );
}
