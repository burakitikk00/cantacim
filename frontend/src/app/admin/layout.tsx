"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { icon: "dashboard", label: "Dashboard", href: "/admin" },
    { icon: "inventory_2", label: "Ürünler", href: "/admin/urunler" },
    { icon: "receipt_long", label: "Siparişler", href: "/admin/siparisler" },
    { icon: "group", label: "Müşteriler", href: "/admin/musteriler" },
    { icon: "local_offer", label: "İndirimler", href: "/admin/indirimler" },
];

const STORE_MANAGEMENT_ITEMS = [
    { icon: "category", label: "Kategori Ayarları", href: "/admin/dukkan-yonetimi/kategori-ayarlari" },
    { icon: "loyalty", label: "Marka Ayarları", href: "/admin/dukkan-yonetimi/marka-ayarlari" },
    { icon: "tune", label: "Varyasyon Ayarları", href: "/admin/dukkan-yonetimi/varyasyon-ayarlari" },
    { icon: "local_shipping", label: "Kargo Ayarları", href: "/admin/dukkan-yonetimi/kargo-ayarlari" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [storeMenuOpen, setStoreMenuOpen] = useState(
        pathname.startsWith("/admin/dukkan-yonetimi")
    );

    const isStoreSubActive = STORE_MANAGEMENT_ITEMS.some((item) => pathname === item.href);

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

                <div className="p-4 border-t border-[#E5E7EB]">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50 hover:text-[#374151] transition-colors">
                        <span className="material-icons text-xl">visibility</span>
                        Mağazayı Görüntüle
                    </Link>
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
                        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
                            <div className="w-9 h-9 bg-[#FF007F] text-white rounded-full flex items-center justify-center text-sm font-bold">A</div>
                            <div>
                                <p className="text-sm font-medium">Admin</p>
                                <p className="text-xs text-[#9CA3AF]">Yönetici</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
