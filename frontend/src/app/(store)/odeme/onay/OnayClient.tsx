"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { calculateShippingCost, StoreSettingsParams } from "@/utils/shipping";
import { Address } from "@prisma/client";
import { createOrder } from "@/app/actions/order";

export default function OnayClient({ address, settings, shippingMethod, last4, bank, brand }: { address: Address, settings: StoreSettingsParams | null, shippingMethod: string, last4?: string; bank?: string; brand?: string; }) {
    const router = useRouter();
    const { items: cartItems, totalPrice, clearCart, selectedCoupon } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (useCartStore.getState().items.length === 0) {
            router.push("/sepet");
        }
    }, [router]);

    const isFreeShippingCoupon = selectedCoupon?.discountType === 'FREE_SHIPPING';
    const isDeliveryMethod = settings?.calcMethod === "delivery_method";
    const parseId = parseInt(shippingMethod);
    const shippingCost = isFreeShippingCoupon ? 0 : (settings && isMounted ? calculateShippingCost(settings, cartItems, isNaN(parseId) ? undefined : parseId) : 0);
    const subTotal = isMounted ? totalPrice() : 0;

    const calculateCouponDiscount = () => {
        if (!selectedCoupon) return 0;
        let discount = 0;
        switch (selectedCoupon.discountType) {
            case 'PERCENTAGE':
                discount = subTotal * (selectedCoupon.discountValue / 100);
                break;
            case 'FIXED':
                discount = selectedCoupon.discountValue;
                break;
            case 'FREE_SHIPPING':
                discount = 0; // Already zeroed out shippingCost
                break;
            case 'BUY_X_GET_Y':
                if (selectedCoupon.buyX && selectedCoupon.getY) {
                    const allUnitPrices: number[] = [];
                    cartItems.forEach(item => {
                        for (let i = 0; i < item.quantity; i++) {
                            allUnitPrices.push(item.price);
                        }
                    });
                    allUnitPrices.sort((a, b) => a - b);
                    const totalQty = allUnitPrices.length;
                    const freeCountPerSet = selectedCoupon.buyX - selectedCoupon.getY;
                    const sets = Math.floor(totalQty / selectedCoupon.buyX);
                    const totalFreeCount = sets * freeCountPerSet;
                    for (let i = 0; i < totalFreeCount; i++) {
                        discount += allUnitPrices[i];
                    }
                }
                break;
        }
        return Math.min(discount, subTotal);
    };

    const discountAmount = isMounted ? calculateCouponDiscount() : 0;
    const total = subTotal + shippingCost - discountAmount;

    let shippingMethodName = shippingMethod === 'standard' ? 'Standart Teslimat' : shippingMethod;
    let shippingMethodDesc = 'Belirlenen kurallara göre kargo';

    if (isDeliveryMethod && settings?.deliveryMethods) {
        const selected = settings.deliveryMethods.find((m: any) => m.id.toString() === shippingMethod);
        if (selected) {
            shippingMethodName = selected.name;
        }
    }

    const CardBrandSvg = ({ brandType, className }: { brandType: string; className?: string }) => {
        if (brandType === "visa") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zM540.7 157.7c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.2-42.7M617.2 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.6h56.2s9.2-24.2 11.3-29.5c6.1 0 60.9.1 68.7.1 1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.7-195.8zm-66.2 126.3c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.6h-44.6zM232.8 152.9L180.5 284l-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.9 172.6h56.6l84.2-195.8h-57.1" fill="currentColor" />
            </svg>
        );
        if (brandType === "mastercard") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="330" cy="250" r="170" fill="#EB001B" opacity="0.9" />
                <circle cx="450" cy="250" r="170" fill="#F79E1B" opacity="0.9" />
                <path d="M390 120.8a169.5 169.5 0 0 0-60 129.2c0 52.4 23.8 99.3 61.2 130.4A169.5 169.5 0 0 0 450 250c0-52.4-23.8-99.3-60-129.2Z" fill="#FF5F00" />
            </svg>
        );
        if (brandType === "amex") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="40" fill="#2E77BB" />
                <text x="390" y="280" textAnchor="middle" fill="white" fontSize="120" fontFamily="Arial" fontWeight="bold">AMEX</text>
            </svg>
        );
        if (brandType === "troy") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="40" fill="#1A3C7B" />
                <text x="390" y="280" textAnchor="middle" fill="white" fontSize="140" fontFamily="Arial" fontWeight="bold">TROY</text>
            </svg>
        );
        return <span className="material-symbols-outlined text-zinc-400">credit_card</span>;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmOrder = async () => {
        setIsSubmitting(true);
        try {
            const orderData = {
                items: cartItems.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
                addressId: address.id,
                shippingMethod,
                couponCode: selectedCoupon?.code || null,
                paymentInfo: { bank, brand, last4 }
            };

            const result = await createOrder(orderData);

            if (result.success) {
                clearCart();
                router.push("/hesap/siparisler"); // Redirect to orders page so user can see it right away
            } else {
                alert(result.error || "Sipariş oluşturulurken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Yükleniyor...</div>;
    }

    return (
        <main className="max-w-7xl mx-auto px-6 pb-12 pt-32 lg:px-20">
            {/* Breadcrumbs & Title */}
            <div className="mb-12">
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-4">
                    <Link href="/sepet" className="hover:text-primary transition-colors">Sepet</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <Link href="/odeme" className="hover:text-primary transition-colors">Ödeme Bilgileri</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary font-bold">Onay</span>
                </nav>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary">Sipariş Onayı</h2>
                <p className="text-zinc-500 mt-2">Lütfen sipariş detaylarınızı son kez kontrol edip onaylayınız.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Details */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Summary Card */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-8">
                        {/* Address Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">location_on</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Teslimat Adresi</h4>
                                <p className="font-medium text-zinc-900">{address.title} - {address.fullName}</p>
                                <p className="text-sm text-zinc-500 leading-relaxed mt-1">
                                    {address.neighborhood} {address.fullAddress}<br />
                                    {address.district}, {address.city}<br />
                                    {address.phone}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">local_shipping</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Kargo Yöntemi</h4>
                                <p className="font-medium text-zinc-900">
                                    {shippingMethodName}
                                </p>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {shippingMethodDesc}
                                </p>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="flex gap-6 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="size-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">credit_card</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Ödeme Yöntemi</h4>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <CardBrandSvg brandType={brand || "unknown"} className="h-6 w-auto text-primary" />
                                        <div className="text-sm text-zinc-600 flex items-center gap-2">
                                            {bank && bank !== "BANKANIZ" && <span className="font-semibold text-zinc-800">{bank}</span>}
                                            {bank && bank !== "BANKANIZ" && <span>•</span>}
                                            <span className="font-medium capitalize">{brand === 'unknown' || !brand ? 'Kredi / Banka Kartı' : brand}</span>
                                            <span className="mx-1">•</span>
                                            <span className="font-mono">**** {last4 || '0000'}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        Kart bilgileriniz PCI-DSS standartlarında işlenmektedir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <Link
                            href="/odeme"
                            className="text-zinc-500 font-bold text-sm hover:text-zinc-800 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Geri Dön ve Düzenle
                        </Link>
                    </div>

                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 pb-6 border-b border-zinc-100">Özet</h3>

                        {/* Item List Preview */}
                        <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.variantId} className="flex gap-4">
                                    <div className="size-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img className="w-full h-full object-cover" alt={item.productName} src={item.image} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                                                <span className="material-symbols-outlined text-zinc-400">image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-primary line-clamp-1">{item.productName}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{item.variantLabel}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-medium">{item.quantity} Adet</span>
                                            <span className="text-sm font-extrabold">₺{new Intl.NumberFormat("tr-TR").format(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8 pt-6 border-t border-zinc-100">
                            <div className="flex justify-between text-zinc-500">
                                <span>Ara Toplam</span>
                                <span>₺{subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Kargo Ücreti</span>
                                <span className={shippingCost === 0 ? "text-green-600 font-medium" : "text-primary font-medium"}>
                                    {shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                </span>
                            </div>
                            {isMounted && discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">İndirim ({selectedCoupon?.code})</span>
                                    <span className="font-bold">-₺{new Intl.NumberFormat("tr-TR").format(discountAmount)}</span>
                                </div>
                            )}
                            {isMounted && isFreeShippingCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Ücretsiz Kargo ({selectedCoupon?.code})</span>
                                    <span className="font-bold">Uygulandı</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-4 border-t border-zinc-100">
                                <span className="text-lg font-bold">Toplam</span>
                                <div className="text-right">
                                    <p className="text-2xl font-extrabold tracking-tighter text-primary">
                                        ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    Onayla ve Bitir
                                </>
                            )}
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                "Onayla ve Bitir" butonuna basarak <Link href="#" className="underline">Mesafeli Satış Sözleşmesi</Link>'ni ve <Link href="#" className="underline">Ön Bilgilendirme Formu</Link>'nu okuduğunuzu ve kabul ettiğinizi onaylamış olursunuz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
