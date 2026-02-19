"use client";

import Link from "next/link";
import { useState } from "react";

// Mock Data
const INITIAL_CART_ITEMS = [
    { id: "1", brand: "SAINT LAURENT", name: "Sac de Jour Nano Leather Bag", color: "Tan", size: "Nano", price: 84500, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV" },
    { id: "2", brand: "GUCCI", name: "GG Marmont Small Shoulder Bag", color: "Siyah", size: "Small", price: 62200, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2" },
];

// Coupon Types
type DiscountType = 'PERCENTAGE_TOTAL' | 'FIXED_TOTAL' | 'BUY_X_PAY_Y' | 'PRODUCT_PERCENTAGE';

interface Coupon {
    code: string;
    description: string;
    type: DiscountType;
    value?: number;
    minTotal?: number;
    productIds?: string[];
    buyQty?: number;
    payQty?: number;
}

const AVAILABLE_COUPONS: Coupon[] = [
    { code: "YAZ20", description: "Tüm ürünlerde %20 indirim", type: "PERCENTAGE_TOTAL", value: 20 },
    { code: "3AL2ODE", description: "3 Al 2 Öde", type: "BUY_X_PAY_Y", buyQty: 3, payQty: 2 },
    { code: "GUCCI50", description: "Gucci çantalarda %50 indirim", type: "PRODUCT_PERCENTAGE", value: 50, productIds: ["2"] },
    { code: "INDIRIM500", description: "50.000 TL üzeri alışverişlerde 500 TL indirim", type: "FIXED_TOTAL", value: 500, minTotal: 50000 },
];

const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

export default function CartPage() {
    const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [error, setError] = useState("");

    const handleQuantityChange = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleApplyCoupon = () => {
        if (!couponInput) return;
        const coupon = AVAILABLE_COUPONS.find(c => c.code === couponInput.toUpperCase());
        if (coupon) {
            setSelectedCoupon(coupon);
            setError("");
            setCouponInput("");
        } else {
            setError("Geçersiz kupon kodu");
            setSelectedCoupon(null);
        }
    };

    const handleSelectCoupon = (coupon: Coupon) => {
        if (selectedCoupon?.code === coupon.code) {
            setSelectedCoupon(null); // Toggle off
        } else {
            setSelectedCoupon(coupon);
            setCouponInput("");
            setError("");
        }
    };

    // Calculation Logic
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = 0;

    const calculateDiscount = () => {
        if (!selectedCoupon) return 0;

        let discount = 0;

        switch (selectedCoupon.type) {
            case 'PERCENTAGE_TOTAL':
                discount = subtotal * ((selectedCoupon.value || 0) / 100);
                break;

            case 'FIXED_TOTAL':
                if (subtotal >= (selectedCoupon.minTotal || 0)) {
                    discount = selectedCoupon.value || 0;
                }
                break;

            case 'PRODUCT_PERCENTAGE':
                cartItems.forEach(item => {
                    if (selectedCoupon.productIds?.includes(item.id)) {
                        discount += (item.price * item.qty) * ((selectedCoupon.value || 0) / 100);
                    }
                });
                break;

            case 'BUY_X_PAY_Y':
                if (selectedCoupon.buyQty && selectedCoupon.payQty) {
                    // Flatten all items to find individual unit prices
                    const allUnitPrices: number[] = [];
                    cartItems.forEach(item => {
                        for (let i = 0; i < item.qty; i++) {
                            allUnitPrices.push(item.price);
                        }
                    });

                    // Sort ascending (cheapest first)
                    allUnitPrices.sort((a, b) => a - b);

                    const totalQty = allUnitPrices.length;
                    const sets = Math.floor(totalQty / selectedCoupon.buyQty);
                    const freeCountPerSet = selectedCoupon.buyQty - selectedCoupon.payQty;
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
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-24">
            <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary/40 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-medium">Sepet</span>
            </nav>

            <h1 className="text-4xl font-bold tracking-tight mb-16">Alışveriş Çantanız</h1>

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
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 border-b border-gray-100">
                                <div className="col-span-6 flex gap-6 items-center">
                                    <div className="w-28 h-36 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase">{item.brand}</p>
                                        <h3 className="text-sm font-semibold">{item.name}</h3>
                                        <p className="text-xs text-gray-400">Renk: {item.color} &middot; Beden: {item.size}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 mt-2"
                                        >
                                            <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>
                                            Kaldır
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleQuantityChange(item.id, -1)}
                                        className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, 1)}
                                        className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                                <div className="col-span-2 text-center text-sm font-medium">₺{fmt(item.price)}</div>
                                <div className="col-span-2 text-right text-sm font-bold">₺{fmt(item.price * item.qty)}</div>
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
                            <div className="flex justify-between"><span className="text-gray-500">Kargo</span><span className="font-medium text-green-600">Ücretsiz</span></div>

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
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Kupon Kodu"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-primary text-white px-6 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                                    >
                                        Uygula
                                    </button>
                                </div>
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>

                            {/* Minimal Available Coupons */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kullanılabilir Kuponlar</p>
                                <div className="space-y-2">
                                    {AVAILABLE_COUPONS.map((coupon) => (
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
                                                <p className="text-[10px] text-gray-500 leading-tight">{coupon.description}</p>
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
        </main>
    );
}

