"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getMyVisibleCoupons, applyCouponCode } from "../hesap/kuponlarim/actions";
import { useCartStore, SelectedCoupon } from "@/store/cart";
import { getStoreSettings } from "@/app/actions/settings";
import { calculateShippingCost, StoreSettingsParams } from "@/utils/shipping";

// Coupon Types (matching DB schema)
interface Coupon {
    id: string;
    name: string;
    code: string;
    description: string | null;
    discountType: string; // PERCENTAGE | FIXED | BUY_X_GET_Y | FREE_SHIPPING
    discountValue: number;
    buyX: number | null;
    getY: number | null;
    validUntil: string | null;
    maxUses: number | null;
    usedCount: number;
    isUsed?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

interface Toast {
    id: number;
    type: "success" | "error";
    message: string;
}

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

export default function CartPage() {
    const { items: cartItems, updateQuantity, removeItem, selectedCoupon: storedCoupon, setSelectedCoupon: setStoredCoupon } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [error, setError] = useState("");
    const [couponApplying, setCouponApplying] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [settings, setSettings] = useState<StoreSettingsParams | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: "success" | "error", message: string) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        setIsMounted(true);
        (async () => {
            const [resCoupons, resSettings] = await Promise.all([
                getMyVisibleCoupons(),
                getStoreSettings()
            ]);
            if (resCoupons.success) {
                // Filter out used coupons — only show available ones in the cart
                const coupons = (resCoupons.data as Coupon[]).filter(c => !c.isUsed);
                setAvailableCoupons(coupons);
                // Restore previously selected coupon from store
                if (storedCoupon) {
                    const found = coupons.find(c => c.code === storedCoupon.code);
                    if (found) setSelectedCoupon(found);
                }
            }
            if (resSettings.success) setSettings(resSettings.data as any as StoreSettingsParams);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQuantityChange = (id: string, delta: number) => {
        const item = cartItems.find((i) => i.variantId === id);
        if (item) {
            updateQuantity(id, item.quantity + delta);
        }
    };

    const handleRemoveItem = (id: string) => {
        removeItem(id);
    };

    // Sync local coupon selection to store
    const syncCouponToStore = (coupon: Coupon | null) => {
        setSelectedCoupon(coupon);
        if (coupon) {
            setStoredCoupon({
                id: coupon.id,
                name: coupon.name,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                buyX: coupon.buyX,
                getY: coupon.getY,
            });
        } else {
            setStoredCoupon(null);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponInput || couponApplying) return;
        const code = couponInput.toUpperCase();

        // First check if it's already in the local list
        const localCoupon = availableCoupons.find(c => c.code === code);
        if (localCoupon) {
            syncCouponToStore(localCoupon);
            setError("");
            setCouponInput("");
            addToast("success", "Kupon başarıyla uygulandı!");
            return;
        }

        // Otherwise, try to apply it via server action (validates + saves to UserCoupon)
        setCouponApplying(true);
        setError("");
        try {
            const res = await applyCouponCode(code);
            if (res.success && res.data) {
                const newCoupon = res.data as Coupon;
                setAvailableCoupons(prev => {
                    const exists = prev.some(c => c.code === newCoupon.code);
                    if (exists) return prev;
                    return [newCoupon, ...prev];
                });
                syncCouponToStore(newCoupon);
                setCouponInput("");
                setError("");
                addToast("success", "Kupon başarıyla uygulandı!");
            } else {
                setError(res.error || "Geçersiz kupon kodu");
                addToast("error", res.error || "Geçersiz kupon kodu");
                syncCouponToStore(null);
            }
        } catch {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setCouponApplying(false);
        }
    };

    const handleSelectCoupon = (coupon: Coupon) => {
        if (selectedCoupon?.code === coupon.code) {
            syncCouponToStore(null); // Toggle off
        } else {
            syncCouponToStore(coupon);
            setCouponInput("");
            setError("");
        }
    };

    // Calculation Logic
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const isFreeShippingCoupon = selectedCoupon?.discountType === 'FREE_SHIPPING';
    const shipping = isFreeShippingCoupon ? 0 : (settings ? calculateShippingCost(settings, cartItems) : 0);

    const calculateDiscount = () => {
        if (!selectedCoupon) return 0;

        let discount = 0;

        switch (selectedCoupon.discountType) {
            case 'PERCENTAGE':
                discount = subtotal * (selectedCoupon.discountValue / 100);
                break;

            case 'FIXED':
                discount = selectedCoupon.discountValue;
                break;

            case 'FREE_SHIPPING':
                discount = 0; // Kargo zaten ücretsiz, gerektiğinde kargo tutarını buradan düşün
                break;

            case 'BUY_X_GET_Y':
                if (selectedCoupon.buyX && selectedCoupon.getY) {
                    // Flatten all items to find individual unit prices
                    const allUnitPrices: number[] = [];
                    cartItems.forEach(item => {
                        for (let i = 0; i < item.quantity; i++) {
                            allUnitPrices.push(item.price);
                        }
                    });

                    // Sort ascending (cheapest first)
                    allUnitPrices.sort((a, b) => a - b);

                    const totalQty = allUnitPrices.length;
                    const freeCountPerSet = selectedCoupon.buyX - selectedCoupon.getY;
                    const sets = Math.floor(totalQty / selectedCoupon.buyX);
                    const totalFreeCount = sets * freeCountPerSet;

                    // Take the first 'totalFreeCount' items (cheapest ones) as free
                    for (let i = 0; i < totalFreeCount; i++) {
                        discount += allUnitPrices[i];
                    }
                }
                break;
        }

        return Math.min(discount, subtotal); // Discount cannot exceed subtotal
    };

    const discountAmount = calculateDiscount();
    const total = subtotal + shipping - discountAmount;

    return (
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-24 relative">
            {/* Toast Container - Top Right */}
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3" style={{ pointerEvents: "none" }}>
                {toasts.map((toast) => (
                    <div key={toast.id} style={{ pointerEvents: "auto" }}>
                        <ToastNotification toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary/40 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-medium">Sepet</span>
            </nav>

            {!isMounted ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-4xl font-bold tracking-tight mb-16">Alışveriş Çantanız</h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 space-y-6">
                            <h2 className="text-2xl font-semibold">Sepetiniz boş...</h2>
                            <Link href="/urunler" className="inline-block bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors">
                                Alışverişe Başla
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-0">
                                    <div className="hidden md:grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-primary/40 border-b border-gray-100 pb-4 mb-4">
                                        <div className="col-span-6">Ürün</div>
                                        <div className="col-span-2 text-center">Adet</div>
                                        <div className="col-span-2 text-center">Fiyat</div>
                                        <div className="col-span-2 text-right">Toplam</div>
                                    </div>
                                    {cartItems.map((item) => (
                                        <div key={item.variantId} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 border-b border-gray-100">
                                            <div className="col-span-6 flex gap-6 items-center">
                                                <div className="w-28 h-36 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img alt={item.productName} className="w-full h-full object-cover" src={item.image} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                            <span className="material-symbols-outlined text-4xl">image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase">Marka</p>
                                                    <Link href={`/urunler/${item.productName.toLowerCase().replace(/ /g, '-')}`} className="hover:text-primary transition-colors">
                                                        <h3 className="text-sm font-semibold">{item.productName}</h3>
                                                    </Link>
                                                    <p className="text-xs text-gray-400">{item.variantLabel}</p>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.variantId)}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 mt-2"
                                                    >
                                                        <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item.variantId, -1)}
                                                    className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.variantId, 1)}
                                                    className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <div className="col-span-2 text-center text-sm font-medium">₺{fmt(item.price)}</div>
                                            <div className="col-span-2 text-right text-sm font-bold">₺{fmt(item.price * item.quantity)}</div>
                                        </div>
                                    ))}
                                </div>


                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-50 rounded-xl p-8 space-y-6 sticky top-28">
                                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-4">Sipariş Özeti</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Ara Toplam</span><span className="font-medium">₺{fmt(subtotal)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Kargo</span>
                                            <span className={`font-medium ${shipping === 0 ? "text-green-600" : ""}`}>
                                                {shipping === 0 ? "Ücretsiz" : `₺${fmt(shipping)}`}
                                            </span>
                                        </div>

                                        {/* Discount Row */}
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <span className="font-medium">İndirim ({selectedCoupon?.code})</span>
                                                <span className="font-bold">-₺{fmt(discountAmount)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                        <span className="font-bold">Toplam</span>
                                        <span className="text-xl font-bold">₺{fmt(total)}</span>
                                    </div>

                                    {/* Coupon Input */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    value={couponInput}
                                                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); if (error) setError(""); }}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                                                    className={`flex-1 border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all ${error ? "border-red-300" : "border-gray-200"}`}
                                                    placeholder="Kupon Kodu"
                                                    disabled={couponApplying}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponApplying || !couponInput.trim()}
                                                    className={`px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${couponApplying || !couponInput.trim()
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-primary text-white hover:bg-black"
                                                        }`}
                                                >
                                                    {couponApplying ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        "Uygula"
                                                    )}
                                                </button>
                                            </div>
                                            {error && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                    {error}
                                                </p>
                                            )}
                                        </div>

                                        {/* Minimal Available Coupons */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kullanılabilir Kuponlar</p>
                                            <div className="space-y-2">
                                                {availableCoupons.map((coupon: Coupon) => (
                                                    <div
                                                        key={coupon.code}
                                                        onClick={() => handleSelectCoupon(coupon)}
                                                        className={`
                                                cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between group
                                                ${selectedCoupon?.code === coupon.code
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-gray-100 hover:border-gray-300'
                                                            }
                                            `}
                                                    >
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-bold tracking-wider ${selectedCoupon?.code === coupon.code ? 'text-primary' : 'text-gray-900'}`}>
                                                                    {coupon.code}
                                                                </span>
                                                                {selectedCoupon?.code === coupon.code && (
                                                                    <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 leading-tight">{coupon.name || coupon.description}</p>
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Link href="/odeme" className="block w-full bg-primary text-white py-4 rounded-lg text-center font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
                                        Ödemeye Geç
                                    </Link>
                                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">Güvenli Ödeme &middot; SSL Korumalı</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

