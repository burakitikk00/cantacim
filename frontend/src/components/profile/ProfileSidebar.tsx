"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
    {
        title: "Siparişlerim",
        href: "/hesap/siparisler",
        icon: "package_2",
    },
    {
        title: "Adreslerim",
        href: "/hesap/adreslerim",
        icon: "location_on", // map in design, location_on in material symbols usually
    },
    {
        title: "Hesap Bilgileri",
        href: "/hesap/bilgilerim",
        icon: "person",
    },
    {
        title: "Favorilerim",
        href: "/hesap/favorilerim",
        icon: "favorite",
    },
    {
        title: "Kuponlarım",
        href: "/hesap/kuponlarim",
        icon: "confirmation_number",
    },
];

export function ProfileSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
            <div className="p-8 flex flex-col h-full">
                {/* Brand Logo - Optional if already in main layout, but design shows it in sidebar for desktop */}
                <div className="mb-12 hidden lg:block">
                    <h1 className="text-xl font-bold tracking-widest uppercase">L'Elite Luxury</h1>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-tighter">Premium Shopping</p>
                </div>

                <nav className="flex-1 space-y-1">
                    {NAVIGATION_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-zinc-50 dark:bg-zinc-800 border-l-4 border-primary dark:border-white text-primary dark:text-white font-semibold"
                                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${isActive ? "text-primary dark:text-white" : ""}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.title}</span>
                            </Link>
                        );
                    })}

                    <Link
                        href="/hesap/ayarlar"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-8 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${pathname === '/hesap/ayarlar' ? "bg-zinc-50 dark:bg-zinc-800 border-l-4 border-primary dark:border-white text-primary dark:text-white font-semibold" : ""
                            }`}
                    >
                        <span className="material-symbols-outlined text-[22px]">settings</span>
                        <span className="text-sm">Ayarlar</span>
                    </Link>
                </nav>

                {/* Logout */}
                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                    <Link
                        href="/auth/cikis" // Assuming logout route
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">logout</span>
                        <span className="text-sm font-medium">Çıkış Yap</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
