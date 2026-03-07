"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMyVisibleCoupons, applyCouponCode } from "./actions";

interface CouponData {
    id: string;
    name: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    buyX: number | null;
    getY: number | null;
    validUntil: string | null;
    maxUses: number | null;
    usedCount: number;
    isUsed: boolean;
}

interface Toast {
    id: number;
    type: "success" | "error";
    message: string;
}

function getCouponDisplay(c: CouponData) {
    if (c.discountType === "PERCENTAGE") return { main: `%${c.discountValue}`, sub: "İndirim" };
    if (c.discountType === "FIXED") return { main: `${c.discountValue}`, sub: "TL İndirim" };
    if (c.discountType === "BUY_X_GET_Y") return { main: `${c.buyX} Al`, sub: `${c.getY} Öde` };
    if (c.discountType === "FREE_SHIPPING") return { main: "Ücretsiz", sub: "Kargo" };
    return { main: "", sub: "" };
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getDaysRemaining(iso: string | null) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Toast notification component
function ToastNotification({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-sm text-sm font-medium transition-all duration-500 animate-slideIn ${toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : "bg-red-50/95 border-red-200 text-red-800"
                }`}
        >
            <span className="material-symbols-outlined text-lg">
                {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            >
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    );
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<CouponData[]>([]);
    const [loading, setLoading] = useState(true);
    const [couponInput, setCouponInput] = useState("");
    const [applying, setApplying] = useState(false);
    const [inputError, setInputError] = useState("");
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: "success" | "error", message: string) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        (async () => {
            const res = await getMyVisibleCoupons();
            if (res.success) setCoupons(res.data as CouponData[]);
            setLoading(false);
        })();
    }, []);

    const handleApplyCoupon = async () => {
        const code = couponInput.trim();
        if (!code) {
            setInputError("Lütfen bir kupon kodu giriniz.");
            return;
        }

        setApplying(true);
        setInputError("");

        try {
            const res = await applyCouponCode(code);
            if (res.success && res.data) {
                // Check if already in list
                const exists = coupons.some((c) => c.id === res.data!.id);
                if (!exists) {
                    setCoupons((prev) => [res.data as CouponData, ...prev]);
                }
                setCouponInput("");
                setInputError("");
                addToast("success", "Kupon başarıyla eklendi!");
            } else {
                setInputError(res.error || "Kupon kodu geçersiz.");
                addToast("error", res.error || "Kupon kodu bulunamadı.");
            }
        } catch {
            setInputError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
            addToast("error", "Bir hata oluştu.");
        } finally {
            setApplying(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !applying) {
            handleApplyCoupon();
        }
    };

    // Separate coupons into active and used
    const activeCoupons = coupons.filter((c) => !c.isUsed);
    const usedCoupons = coupons.filter((c) => c.isUsed);

    return (
        <div className="flex-1 relative">
            {/* Toast Container - Top Right */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3" style={{ pointerEvents: "none" }}>
                {toasts.map((toast) => (
                    <div key={toast.id} style={{ pointerEvents: "auto" }}>
                        <ToastNotification toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>

            {/* Inline style for animation */}
            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <div className="mb-8">
                <nav className="flex text-xs text-gray-400 mb-2 gap-2 font-medium">
                    <Link href="/" className="hover:text-primary transition-colors">Hesabım</Link>
                    <span>/</span>
                    <span className="text-primary">İndirim Kuponlarım</span>
                </nav>
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">İndirim Kuponlarım</h1>
                <p className="text-gray-500 mt-2 text-sm">Size özel tanımlanmış ayrıcalıklı indirimleri buradan takip edebilirsiniz.</p>
            </div>

            {/* Add New Coupon Section */}
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Kupon Kodu Ekle
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">sell</span>
                        <input
                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all ${inputError ? "border-red-300 bg-red-50/30" : "border-gray-200"
                                }`}
                            placeholder="Kupon kodunuzu giriniz"
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                if (inputError) setInputError("");
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={applying}
                        />
                    </div>
                    <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponInput.trim()}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px] ${applying || !couponInput.trim()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-primary text-white hover:bg-black"
                            }`}
                    >
                        {applying ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Kontrol ediliyor...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">redeem</span>
                                Kodu Uygula
                            </>
                        )}
                    </button>
                </div>
                {/* Input error message */}
                {inputError && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 text-xs font-medium animate-fadeIn">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{inputError}</span>
                    </div>
                )}
            </section>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                </div>
            )}

            {/* Empty */}
            {!loading && coupons.length === 0 && (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">local_offer</span>
                    <p className="text-gray-500 text-sm">Henüz size tanımlanmış bir kupon bulunmuyor.</p>
                    <p className="text-gray-400 text-xs mt-2">Yukarıdaki alandan kupon kodu ekleyebilirsiniz.</p>
                </div>
            )}

            {/* Active Coupons */}
            {!loading && activeCoupons.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-xl">local_offer</span>
                        <h2 className="text-lg font-bold text-gray-800">Aktif Kuponlar</h2>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeCoupons.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeCoupons.map((c) => (
                            <CouponCard key={c.id} coupon={c} />
                        ))}
                    </div>
                </>
            )}

            {/* Used Coupons */}
            {!loading && usedCoupons.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-4 mt-10">
                        <span className="material-symbols-outlined text-gray-400 text-xl">history</span>
                        <h2 className="text-lg font-bold text-gray-400">Kullanılmış Kuponlar</h2>
                        <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {usedCoupons.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-55">
                        {usedCoupons.map((c) => (
                            <CouponCard key={c.id} coupon={c} />
                        ))}
                    </div>
                </>
            )}

            {/* Terms */}
            <div className="mt-12 pt-6 border-t border-gray-100 text-gray-400 text-[11px] leading-relaxed">
                <p>* İndirim kuponları başka kampanyalarla birleştirilemez. Her kupon tek bir siparişte kullanılabilir. Lina Butik kampanya koşullarını değiştirme hakkını saklı tutar.</p>
            </div>
        </div>
    );
}

function CouponCard({ coupon: c }: { coupon: CouponData }) {
    const display = getCouponDisplay(c);
    const daysLeft = getDaysRemaining(c.validUntil);
    const isUrgent = daysLeft !== null && daysLeft <= 3;
    const isUsed = c.isUsed;

    return (
        <div
            className={`group relative bg-white border rounded-lg overflow-hidden flex shadow-sm transition-shadow ${isUsed ? "border-gray-200 grayscale-[30%]" : "border-gray-200 hover:shadow-md"
                }`}
        >
            {/* Left colored section */}
            <div
                className={`p-6 flex flex-col justify-center items-center w-32 shrink-0 relative ${isUsed ? "bg-gray-400 text-white" : "bg-primary text-white"
                    }`}
            >
                <span className={`font-black leading-none ${display.main.length > 5 ? "text-lg" : "text-3xl"}`}>
                    {display.main}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{display.sub}</span>
                {/* Used overlay badge */}
                {isUsed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white/90 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm -rotate-12">
                            Kullanıldı
                        </div>
                    </div>
                )}
            </div>

            {/* Content section */}
            <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#f7f7f7] rounded-full border border-gray-200 z-10 box-border" />
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-sm uppercase tracking-tight ${isUsed ? "text-gray-400" : "text-primary"}`}>
                            {c.name || c.code}
                        </h4>
                        {isUsed ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-400">
                                Kullanıldı
                            </span>
                        ) : (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isUrgent
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {isUrgent ? "Az Kaldı" : "Aktif"}
                            </span>
                        )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isUsed ? "text-gray-300" : "text-gray-500"}`}>
                        {c.description || ""}
                    </p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kod:</p>
                        <code
                            className={`px-2 py-1 rounded font-bold text-sm tracking-widest ${isUsed
                                ? "bg-gray-50 text-gray-400 line-through"
                                : "bg-gray-100 text-primary"
                                }`}
                        >
                            {c.code}
                        </code>
                    </div>
                    <div className="text-right">
                        {c.validUntil ? (
                            <>
                                <p className="text-[10px] text-gray-400 font-medium">Son Gün:</p>
                                <p
                                    className={`text-[11px] font-bold ${isUsed
                                        ? "text-gray-400"
                                        : isUrgent
                                            ? "text-red-500 italic"
                                            : "text-primary"
                                        }`}
                                >
                                    {daysLeft !== null && daysLeft <= 0 ? "Bugün" : formatDate(c.validUntil)}
                                </p>
                            </>
                        ) : (
                            <p className="text-[10px] text-gray-400 font-medium">Süresiz</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
