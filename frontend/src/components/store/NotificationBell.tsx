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

        // Check every 60 seconds (less aggressive)
        const interval = setInterval(fetchNotifications, 60000);
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
            const res = await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id, markAsRead: true })
            });
            if (res.ok) fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllAsRead: true })
            });
            if (res.ok) fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch("/api/notifications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            });
            if (res.ok) fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const clearAllNotifications = async () => {
        if (!confirm("Tüm bildirimleri silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/notifications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clearAll: true })
            });
            if (res.ok) fetchNotifications();
        } catch (error) {
            console.error(error);
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
                        className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-full mt-2 md:mt-4 w-auto md:w-80 max-h-[70vh] md:max-h-96 overflow-y-auto bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 z-50 overflow-hidden"
                        style={{ animation: "profileDropdownIn 0.2s ease-out" }}
                    >
                        <div className="p-4 pb-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm tracking-wider uppercase">Bildirimler</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {unreadCount} Okunmamış
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <div className="flex justify-end">
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold text-primary hover:text-black transition-all uppercase tracking-tighter border-b border-primary hover:border-black leading-tight"
                                    >
                                        Tümünü okundu işaretle
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center gap-3">
                                    <span className="material-symbols-outlined text-4xl text-gray-200">notifications_off</span>
                                    <p className="text-xs text-gray-400 font-medium">Bildiriminiz bulunmuyor.</p>
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const getTypeColor = () => {
                                        if (n.type?.includes('ORDER_DELIVERED') || n.title?.toLowerCase().includes('teslim')) return 'text-green-600 bg-green-50 px-2 py-0.5 rounded';
                                        if (n.type?.includes('ORDER_PREPARING') || n.title?.toLowerCase().includes('hazırlan')) return 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded';
                                        if (n.type?.includes('ORDER_SHIPPED') || n.title?.toLowerCase().includes('kargo')) return 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded';
                                        return '';
                                    };

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                if (!n.isRead) markAsRead(n.id);
                                                if (n.link) {
                                                    router.push(n.link);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all relative group/notif ${!n.isRead ? "bg-zinc-100/50 hover:bg-zinc-100" : "hover:bg-gray-50 opacity-80"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1.5 gap-2 pr-8">
                                                <h4 className={`text-xs font-bold leading-tight ${!n.isRead ? "text-primary" : "text-gray-500"} ${getTypeColor()}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5">
                                                    {new Date(n.createdAt).toLocaleDateString("tr-TR")}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${!n.isRead ? "text-primary font-medium" : "text-gray-500"}`}>
                                                {n.message}
                                            </p>
                                            
                                            <button 
                                                onClick={(e) => deleteNotification(n.id, e)}
                                                className="absolute top-4 right-2 size-7 flex items-center justify-center rounded-full bg-gray-100/50 md:opacity-0 group-hover/notif:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all z-10"
                                                title="Bildirimi Sil"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 flex justify-center">
                                <button 
                                    onClick={clearAllNotifications}
                                    className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all uppercase tracking-widest flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                    Tüm Bildirimleri Temizle
                                </button>
                            </div>
                        )}
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
