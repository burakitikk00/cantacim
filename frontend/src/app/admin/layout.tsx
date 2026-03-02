"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV = [
    { icon: "dashboard", label: "Dashboard", href: "/admin" },
    { icon: "inventory_2", label: "Ürünler", href: "/admin/urunler" },
    { icon: "receipt_long", label: "Siparişler", href: "/admin/siparisler" },
    { icon: "group", label: "Müşteriler", href: "/admin/musteriler" },
    { icon: "local_offer", label: "İndirimler", href: "/admin/indirimler" },
    { icon: "rate_review", label: "Yorumlar", href: "/admin/yorumlar" },
];

const STORE_MANAGEMENT_ITEMS = [
    { icon: "category", label: "Kategori Ayarları", href: "/admin/dukkan-yonetimi/kategori-ayarlari" },
    { icon: "loyalty", label: "Marka Ayarları", href: "/admin/dukkan-yonetimi/marka-ayarlari" },
    { icon: "tune", label: "Varyasyon Ayarları", href: "/admin/dukkan-yonetimi/varyasyon-ayarlari" },
    { icon: "local_shipping", label: "Kargo Ayarları", href: "/admin/dukkan-yonetimi/kargo-ayarlari" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [storeMenuOpen, setStoreMenuOpen] = useState(
        pathname.startsWith("/admin/dukkan-yonetimi")
    );
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const adminMenuRef = useRef<HTMLDivElement>(null);

    const isStoreSubActive = STORE_MANAGEMENT_ITEMS.some((item) => pathname === item.href);

    // Admin menü dış tıklama
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
                setAdminMenuOpen(false);
            }
        };
        if (adminMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [adminMenuOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Hata olsa bile çıkışı engelleme
        }
        signOut({ callbackUrl: "/auth/giris" });
    };

    const adminName = session?.user?.name || "Admin";
    const adminInitial = adminName.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen overflow-hidden bg-[#F9FAFB] text-[#374151] font-[Inter,sans-serif] antialiased">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-[#E5E7EB]">
                    <Link href="/admin" className="flex items-center gap-2 group">
                        <span className="text-2xl font-bold text-[#FF007F] group-hover:text-[#D6006B] transition-colors">Lina Butik</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {NAV.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                                    ? "bg-[#FF007F]/10 text-[#FF007F]"
                                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#374151]"
                                    }`}
                            >
                                <span className="material-icons text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Dükkan Yönetimi - Collapsible Group */}
                    <div className="pt-2">
                        <button
                            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isStoreSubActive
                                ? "bg-[#FF007F]/10 text-[#FF007F]"
                                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#374151]"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-xl">storefront</span>
                                Dükkan Yönetimi
                            </div>
                            <span className={`material-icons text-lg transition-transform duration-200 ${storeMenuOpen ? "rotate-180" : ""}`}>
                                expand_more
                            </span>
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out ${storeMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="ml-4 pl-4 border-l-2 border-[#F3F4F6] mt-1 space-y-0.5">
                                {STORE_MANAGEMENT_ITEMS.map((item) => {
                                    const active = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                                ? "text-[#FF007F] bg-[#FF007F]/5"
                                                : "text-[#9CA3AF] hover:bg-gray-50 hover:text-[#374151]"
                                                }`}
                                        >
                                            <span className="material-icons text-lg">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-[#E5E7EB] space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50 hover:text-[#374151] transition-colors">
                        <span className="material-icons text-xl">visibility</span>
                        Mağazayı Görüntüle
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full disabled:opacity-50"
                    >
                        <span className="material-icons text-xl">logout</span>
                        {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8">
                    <div className="flex items-center bg-[#F9FAFB] px-4 py-2 rounded-lg border border-transparent focus-within:border-[#E5E7EB] transition-all">
                        <span className="material-icons text-[#9CA3AF] text-xl mr-2">search</span>
                        <input className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-[#9CA3AF]" placeholder="Ürün, sipariş veya müşteri ara..." />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <span className="material-icons text-[#6B7280]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF007F] rounded-full" />
                        </button>
                        <div className="relative" ref={adminMenuRef}>
                            <button
                                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB] hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <div className="w-9 h-9 bg-[#FF007F] text-white rounded-full flex items-center justify-center text-sm font-bold">{adminInitial}</div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{adminName}</p>
                                    <p className="text-xs text-[#9CA3AF]">Yönetici</p>
                                </div>
                                <span className={`material-icons text-[#9CA3AF] text-lg transition-transform duration-200 ${adminMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {adminMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'adminDropIn 0.15s ease-out' }}>
                                    <div className="py-1">
                                        <Link
                                            href="/admin/ayarlar"
                                            onClick={() => setAdminMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="material-icons text-lg text-[#9CA3AF]">settings</span>
                                            Ayarlar
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full disabled:opacity-50"
                                        >
                                            <span className="material-icons text-lg">logout</span>
                                            {isLoggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes adminDropIn {
                            from { opacity: 0; transform: translateY(-4px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
