"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthSidebar from "../auth/AuthSidebar";
import NotificationBell from "./NotificationBell";
import Image from "next/image";
import { searchProducts } from "@/app/actions/search";

export default function Navbar() {
    const count = useCartStore((s) => s.items.length);
    const { data: session, status } = useSession();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchTriggerRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Outside click for search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current && 
                !searchRef.current.contains(event.target as Node) &&
                searchTriggerRef.current &&
                !searchTriggerRef.current.contains(event.target as Node)
            ) {
                setIsSearchOpen(false);
            }
        };
        if (isSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen]);

    // Search debounce
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (searchQuery.trim().length >= 2) {
            setIsSearching(true);
            timeoutId = setTimeout(async () => {
                try {
                    const results = await searchProducts(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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
                <div className="flex items-center gap-12 relative z-10">
                    <Link href="/" className="text-2xl font-extrabold tracking-tighter flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">diamond</span>
                        L&apos;ELITE
                    </Link>
                    <nav className={`hidden lg:flex items-center gap-8 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

                {/* Full Width Search Overlay */}
                <div 
                    className={`absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-[60] flex items-center justify-center px-4 md:px-6 transition-all duration-300 ease-in-out ${
                        isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div ref={searchRef} className="relative w-full max-w-3xl flex items-center gap-3 md:gap-4">
                        <form
                            action="/urunler" 
                            className="flex-1 flex items-center bg-white dark:bg-zinc-900 border border-primary/10 shadow-lg rounded-full overflow-hidden h-12"
                            onSubmit={(e) => {
                                if (!searchQuery.trim()) e.preventDefault();
                            }}
                        >
                            <span className="material-symbols-outlined pl-4 pr-2 text-primary/50">search</span>
                            <input
                                ref={searchInputRef}
                                name="q"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 border-none bg-transparent focus:ring-0 text-base py-0 h-full !outline-none shadow-none"
                                placeholder="Marka, ürün ara..."
                                type="text"
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} className="pr-4 hover:opacity-60 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm bg-gray-100 rounded-full p-0.5">close</span>
                                </button>
                            )}
                        </form>
                        
                        <button 
                            type="button" 
                            onClick={() => setIsSearchOpen(false)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex-shrink-0"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        {/* Search Results Dropdown */}
                        {searchQuery.trim().length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 rounded-2xl overflow-hidden z-50"
                                 style={{ animation: "profileDropdownIn 0.2s ease-out" }}>
                                {isSearching ? (
                                    <div className="p-4 flex items-center justify-center text-sm text-primary/60">
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <span className="ml-3">Aranıyor...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                        <div className="p-2 flex flex-col gap-1">
                                            {searchResults.map((product) => (
                                                <Link 
                                                    key={product.id} 
                                                    href={`/urunler/${product.slug}`}
                                                    onClick={() => {
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="flex items-start gap-3 p-2 hover:bg-primary/[0.03] rounded-lg transition-colors group/item"
                                                >
                                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                                                        {product.image ? (
                                                            <Image 
                                                                src={product.image} 
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400">
                                                                image
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h4 className="text-sm font-medium text-primary line-clamp-2 leading-tight group-hover/item:text-primary/70 transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {product.discountedPrice !== undefined ? (
                                                                <>
                                                                    <span className="text-xs font-semibold text-rose-500">
                                                                        {Number(product.discountedPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                                    </span>
                                                                    <span className="text-[10px] text-primary/40 line-through">
                                                                        {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs font-medium text-primary">
                                                                    {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        {searchResults.length >= 5 && (
                                            <Link 
                                                href={`/urunler?q=${encodeURIComponent(searchQuery)}`}
                                                onClick={() => setIsSearchOpen(false)}
                                                className="block w-full text-center text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors py-3 border-t border-primary/5"
                                            >
                                                Tüm sonuçları gör
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-sm text-primary/60">
                                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50 block">search_off</span>
                                        "{searchQuery}" için sonuç bulunamadı.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6 relative z-10">
                    {/* Search Trigger Icon */}
                    <button
                        ref={searchTriggerRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSearchOpen(true);
                            setTimeout(() => searchInputRef.current?.focus(), 50);
                        }}
                        className="hover:opacity-60 transition-opacity flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">search</span>
                    </button>
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
                                className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden z-50"
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
