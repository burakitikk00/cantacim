"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebarWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on path change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "visible";
        }
        return () => {
            document.body.style.overflow = "visible";
        };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Trigger Button */}
            <div className="lg:hidden flex justify-start mb-6 sticky top-24 z-30">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 bg-white/90 backdrop-blur-sm dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Menüyü Aç"
                >
                    <span className="material-symbols-outlined text-xl leading-none">menu</span>
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar (Drawer) / Desktop Sticky Sidebar */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 lg:w-72 bg-white dark:bg-zinc-900 shadow-xl lg:shadow-none border-r border-zinc-200 dark:border-zinc-800
                    transform transition-transform duration-300 ease-in-out lg:transform-none lg:transition-none
                    lg:relative lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:no-scrollbar lg:translate-x-0 lg:z-40
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Close Button Mobile Only */}
                <div className="flex justify-end p-4 lg:hidden border-b border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="h-[calc(100%-4rem)] lg:h-full overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
        </>
    );
}
