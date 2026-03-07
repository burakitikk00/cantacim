"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell({ isAuthenticated }: { isAuthenticated: boolean }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [modalNotification, setModalNotification] = useState<any>(null);
    const [hasNewUnread, setHasNewUnread] = useState(false);
    const prevUnreadRef = useRef(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                const fetchedNotifs = data.notifications || [];
                setNotifications(fetchedNotifs);

                // Check for new unread notifications compared to previous check
                const currentUnreadCount = fetchedNotifs.filter((n: any) => !n.isRead).length;
                if (currentUnreadCount > prevUnreadRef.current) {
                    setHasNewUnread(true);
                } else if (currentUnreadCount === 0) {
                    setHasNewUnread(false);
                }
                prevUnreadRef.current = currentUnreadCount;

                // Show modal for the first unshown ORDER_DELIVERED notification
                const unshownDelivered = fetchedNotifs.find((n: any) => n.type === "ORDER_DELIVERED" && !n.isModalShown);
                if (unshownDelivered) {
                    setModalNotification(unshownDelivered);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Check every 3 seconds
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id, markAsRead: true })
            });
            fetchNotifications();
        } catch (error) {
            console.log(error);
        }
    };

    const handleModalClose = async (markShown: boolean, notificationId: string) => {
        setModalNotification(null);
        if (markShown) {
            try {
                await fetch("/api/notifications", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notificationId, markModalShown: true })
                });
                fetchNotifications();
            } catch (error) {
                console.log(error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isAuthenticated) return null;

    return (
        <>
            <div className="relative" ref={wrapperRef}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) setHasNewUnread(false);
                    }}
                    className="hover:opacity-60 transition-opacity relative"
                >
                    <span className={`material-symbols-outlined ${hasNewUnread ? "animate-notification-shake text-primary md:scale-110 transition-transform" : ""}`}>notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div
                        className="absolute right-0 top-full mt-3 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-primary/5"
                        style={{ animation: "profileDropdownIn 0.2s ease-out" }}
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                            <h3 className="font-bold text-sm tracking-wider uppercase">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs text-primary/60">{unreadCount} Okunmamış</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500">Bildiriminiz bulunmuyor.</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => {
                                            if (!n.isRead) markAsRead(n.id);
                                            if (n.link) {
                                                router.push(n.link);
                                                setIsOpen(false);
                                            }
                                        }}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!n.isRead ? "bg-primary/[0.04] hover:bg-primary/[0.06]" : "hover:bg-gray-50"}`}
                                    >
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h4 className={`text-xs font-bold ${!n.isRead ? "text-primary" : "text-gray-700"}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {new Date(n.createdAt).toLocaleDateString("tr-TR")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Reminder Modal */}
            {modalNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-slide-up">
                        <button
                            onClick={() => handleModalClose(true, modalNotification.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary">rate_review</span>
                        </div>

                        <h3 className="text-xl font-bold tracking-tight mb-3 text-gray-900">Siparişiniz Teslim Edildi!</h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            #{modalNotification.orderNumber || ''} numaralı siparişiniz teslim edildi. Diğer müşterilerimize yardımcı olmak için satın aldığınız ürünleri değerlendirebilir misiniz?
                        </p>

                        {modalNotification.orderProducts && modalNotification.orderProducts.length > 1 ? (
                            <>
                                <div className="text-left mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Ürün Seçin</div>
                                <div className="flex flex-col gap-2 mb-6 max-h-40 overflow-y-auto pr-1 items-start">
                                    {modalNotification.orderProducts.map((p: any) => (
                                        <div key={p.id} className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-xs font-medium text-gray-800 line-clamp-1 pr-4 text-left">{p.name}</span>
                                            <button
                                                onClick={() => {
                                                    handleModalClose(true, modalNotification.id);
                                                    router.push(`/urunler/${p.slug}#reviews`);
                                                }}
                                                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-black transition-colors shrink-0 bg-primary/5 px-3 py-1.5 rounded-lg"
                                            >
                                                Değerlendir
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleModalClose(true, modalNotification.id)}
                                    className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 py-3.5 hover:text-gray-600 transition-colors border border-gray-100 rounded-xl"
                                >
                                    Daha Sonra
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        handleModalClose(true, modalNotification.id);
                                        if (modalNotification.orderProducts?.length === 1) {
                                            router.push(`/urunler/${modalNotification.orderProducts[0].slug}#reviews`);
                                        } else if (modalNotification.link) {
                                            router.push(modalNotification.link);
                                        }
                                    }}
                                    className="w-full bg-primary text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                                >
                                    Hemen Değerlendir
                                </button>
                                <button
                                    onClick={() => handleModalClose(true, modalNotification.id)}
                                    className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 py-3.5 hover:text-gray-600 transition-colors"
                                >
                                    {modalNotification.orderProducts?.length === 1 ? "Daha Sonra" : "Kapat"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes notification-shake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(-15deg) scale(1.1); }
                    20%, 40%, 60%, 80% { transform: rotate(15deg) scale(1.1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-notification-shake {
                    animation: notification-shake 3s ease-in-out infinite;
                    transform-origin: top center;
                }
            `}</style>
        </>
    );
}
