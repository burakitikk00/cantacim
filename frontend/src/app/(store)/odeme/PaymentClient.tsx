"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Address } from "@prisma/client";
import { useCartStore } from "@/store/cart";
import { calculateShippingCost, StoreSettingsParams } from "@/utils/shipping";

export default function PaymentClient({ initialAddresses, settings }: { initialAddresses: Address[], settings: StoreSettingsParams | null }) {
    const router = useRouter();
    const { items: cartItems, totalPrice, selectedCoupon } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState<string>("");
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);

    // Card form states
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [expiryError, setExpiryError] = useState("");
    const [cardNumberError, setCardNumberError] = useState("");

    // Card brand detection
    const detectCardBrand = (num: string): string => {
        const n = num.replace(/\s/g, "");
        if (/^4/.test(n)) return "visa";
        if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
        if (/^3[47]/.test(n)) return "amex";
        if (/^9792/.test(n) || /^65/.test(n) || /^36/.test(n)) return "troy";
        return "unknown";
    };

    const cardBrand = detectCardBrand(cardNumber);

    // Bank detection via IIN/BIN (mock mapping for common Turkish bins)
    const detectBankName = (num: string) => {
        const bin = num.replace(/\s/g, "").slice(0, 6);
        if (bin.length < 4) return "";
        const banks = [
            { name: "Garanti BBVA", bins: ["4282", "5400", "5549", "4920", "5528"] },
            { name: "İş Bankası", bins: ["4508", "4170", "5451", "5468", "4506", "5472"] },
            { name: "Ziraat Bankası", bins: ["5401", "4183", "5101", "4987", "9792"] },
            { name: "Yapı Kredi", bins: ["4504", "4543", "5437", "5402", "5328"] },
            { name: "Akbank", bins: ["4505", "5447", "4221", "5576"] },
            { name: "QNB Finansbank", bins: ["5456", "5458", "4776", "5209"] },
            { name: "Halkbank", bins: ["5435", "5424"] },
            { name: "VakıfBank", bins: ["5404", "4513"] },
            { name: "Enpara.com", bins: ["5159"] },
            { name: "DenizBank", bins: ["5414", "4290"] }
        ];
        for (const bank of banks) {
            if (bank.bins.some(b => bin.startsWith(b))) return bank.name;
        }
        return "BANKANIZ";
    };

    const detectedBank = detectBankName(cardNumber);

    const cardBrandLogos: Record<string, { alt: string }> = {
        visa: { alt: "Visa" },
        mastercard: { alt: "Mastercard" },
        amex: { alt: "Amex" },
        troy: { alt: "Troy" },
    };

    // Inline SVG logos for reliable rendering
    const CardBrandSvg = ({ brand, className }: { brand: string; className?: string }) => {
        if (brand === "visa") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zM540.7 157.7c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.2-42.7M617.2 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.6h56.2s9.2-24.2 11.3-29.5c6.1 0 60.9.1 68.7.1 1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.7-195.8zm-66.2 126.3c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.6h-44.6zM232.8 152.9L180.5 284l-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.9 172.6h56.6l84.2-195.8h-57.1" fill="currentColor" />
            </svg>
        );
        if (brand === "mastercard") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="330" cy="250" r="170" fill="#EB001B" opacity="0.9" />
                <circle cx="450" cy="250" r="170" fill="#F79E1B" opacity="0.9" />
                <path d="M390 120.8a169.5 169.5 0 0 0-60 129.2c0 52.4 23.8 99.3 61.2 130.4A169.5 169.5 0 0 0 450 250c0-52.4-23.8-99.3-60-129.2Z" fill="#FF5F00" />
            </svg>
        );
        if (brand === "amex") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="40" fill="#2E77BB" />
                <text x="390" y="280" textAnchor="middle" fill="white" fontSize="120" fontFamily="Arial" fontWeight="bold">AMEX</text>
            </svg>
        );
        if (brand === "troy") return (
            <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="40" fill="#1A3C7B" />
                <text x="390" y="280" textAnchor="middle" fill="white" fontSize="140" fontFamily="Arial" fontWeight="bold">TROY</text>
            </svg>
        );
        return null;
    };

    // Format card number: XXXX XXXX XXXX XXXX
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "").slice(0, 16);
        let formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
        setCardNumber(formatted);
        setCardNumberError(val.length > 0 && val.length < 16 ? "Kart numarası 16 haneli olmalıdır" : "");
    };

    // Format expiry: AA/YY
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + " / " + val.slice(2);
        setCardExpiry(val);
        setExpiryError("");
    };

    // Validate expiry on blur
    const handleExpiryBlur = () => {
        const digits = cardExpiry.replace(/\D/g, "");
        if (digits.length < 4) { if (digits.length > 0) setExpiryError("Geçerli bir tarih girin (AA/YY)"); return; }
        const month = parseInt(digits.slice(0, 2), 10);
        const year = parseInt("20" + digits.slice(2, 4), 10);
        if (month < 1 || month > 12) { setExpiryError("Geçersiz ay (01-12)"); return; }
        const now = new Date();
        const expDate = new Date(year, month);
        if (expDate < now) { setExpiryError("Kartınızın süresi dolmuş!"); return; }
        setExpiryError("");
    };

    // CVV handler - max 3 digits
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
    };

    // Display helpers for card face
    const displayCardNumber = () => {
        const raw = cardNumber.replace(/\s/g, "");
        if (!raw) return "XXXX XXXX XXXX XXXX";
        const padded = raw.padEnd(16, "•");
        return padded.replace(/(....)/g, "$1 ").trim();
    };

    const displayCardName = cardName || "AD SOYAD";
    const displayExpiry = () => {
        const digits = cardExpiry.replace(/\D/g, "");
        if (!digits) return "XX/XX";
        const m = digits.slice(0, 2).padEnd(2, "X");
        const y = digits.slice(2, 4).padEnd(2, "X");
        return m + "/" + y;
    };
    const displayCvv = cardCvv || "XXX";

    // Get raw card number (no spaces) for payment submission
    const getRawCardNumber = () => cardNumber.replace(/\s/g, "");

    useEffect(() => {
        setIsMounted(true);
        if (useCartStore.getState().items.length === 0) {
            router.push("/sepet");
        } else {
            if (settings?.calcMethod === "delivery_method" && settings.deliveryMethods && settings.deliveryMethods.length > 0) {
                const defMethod = settings.deliveryMethods.find((m: any) => m.isDefault);
                if (defMethod) {
                    setSelectedShipping(defMethod.id.toString());
                } else {
                    setSelectedShipping(settings.deliveryMethods[0].id.toString());
                }
            } else {
                setSelectedShipping("standard");
            }
        }
    }, [router, settings]);

    // Sort addresses conceptually so default is first
    const defaultAddress = initialAddresses.find(a => a.isDefault) || initialAddresses[0];
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddress?.id || null);

    const [addresses, setAddresses] = useState(initialAddresses.sort((a, b) => {
        if (a.id === defaultAddress?.id) return -1;
        if (b.id === defaultAddress?.id) return 1;
        return 0;
    }));
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);

    const handleCompleteOrder = () => {
        const rawNum = getRawCardNumber();
        const last4 = rawNum.length >= 4 ? rawNum.slice(-4) : "0000";
        router.push(`/odeme/onay?shipping=${selectedShipping}&address=${selectedAddressId}&bank=${encodeURIComponent(detectedBank)}&brand=${encodeURIComponent(cardBrand)}&last4=${last4}`);
    };

    const handleAddressSelect = (id: string) => {
        setSelectedAddressId(id);

        // Reorder addresses: selected one goes to top
        const newAddresses = [...addresses].sort((a, b) => {
            if (a.id === id) return -1;
            if (b.id === id) return 1;
            return 0;
        });

        setAddresses(newAddresses);
        setIsAddressExpanded(false);
    };

    const formatDisplayPhone = (val: string) => {
        if (!val) return "";
        let num = val.replace(/\D/g, '');
        if (num.startsWith('90')) num = num.substring(2);
        else if (num.startsWith('0')) num = num.substring(1);

        if (num.length === 0) return '';

        let formatted = '+90';
        if (num.length > 0) formatted += ' ' + num.substring(0, 3);
        if (num.length > 3) formatted += ' ' + num.substring(3, 6);
        if (num.length > 6) formatted += ' ' + num.substring(6, 8);
        if (num.length > 8) formatted += ' ' + num.substring(8, 10);
        return formatted;
    };

    const visibleAddresses = isAddressExpanded ? addresses : addresses.slice(0, 2);

    // Determine if FREE_SHIPPING coupon is active
    const isFreeShippingCoupon = selectedCoupon?.discountType === 'FREE_SHIPPING';

    // Calculate shipping 
    const isDeliveryMethod = settings?.calcMethod === "delivery_method";
    const parseId = parseInt(selectedShipping);
    const shippingCost = isFreeShippingCoupon ? 0 : (settings ? calculateShippingCost(settings, cartItems, isNaN(parseId) ? undefined : parseId) : 0);

    // Find options to display
    let deliveryOptionsToRender: any[] = [];
    if (isDeliveryMethod && settings?.deliveryMethods) {
        deliveryOptionsToRender = settings.deliveryMethods;
    }

    // Calculate coupon discount
    const calculateCouponDiscount = () => {
        if (!selectedCoupon) return 0;
        const subtotal = totalPrice();
        let discount = 0;
        switch (selectedCoupon.discountType) {
            case 'PERCENTAGE':
                discount = subtotal * (selectedCoupon.discountValue / 100);
                break;
            case 'FIXED':
                discount = selectedCoupon.discountValue;
                break;
            case 'FREE_SHIPPING':
                discount = 0; // Shipping is already zeroed out above
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
        return Math.min(discount, subtotal);
    };

    const discountAmount = isMounted ? calculateCouponDiscount() : 0;
    const grandTotal = isMounted ? (totalPrice() + shippingCost - discountAmount) : 0;

    return (
        <main className="max-w-7xl mx-auto px-6 pb-12 pt-32 lg:px-20">
            {/* Breadcrumbs & Title */}
            <div className="mb-12">
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-4">
                    <Link href="/sepet" className="hover:text-primary transition-colors">Sepet</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary font-bold">Ödeme Bilgileri</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Onay</span>
                </nav>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary">Güvenli Ödeme</h2>
                <p className="text-zinc-500 mt-2">Lütfen siparişinizi tamamlamak için bilgilerinizi eksiksiz doldurunuz.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Checkout Steps */}
                <div className="lg:col-span-8 space-y-16">
                    {/* 1. Delivery Address Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">1</span>
                                <h3 className="text-2xl font-bold tracking-tight">Teslimat Adresi</h3>
                            </div>
                            <Link
                                href="/hesap/adreslerim/yeni?returnUrl=/odeme"
                                className="text-sm font-bold underline underline-offset-4 hover:opacity-60 transition-opacity flex items-center gap-1"
                            >
                                Yeni Adres Ekle
                            </Link>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-4xl text-zinc-300 mb-4">location_on</span>
                                <h4 className="font-bold text-lg mb-2">Kayıtlı Adresiniz Yok</h4>
                                <p className="text-sm text-zinc-500 mb-6">Sipariş verebilmek için lütfen bir teslimat adresi ekleyin.</p>
                                <Link
                                    href="/hesap/adreslerim/yeni?returnUrl=/odeme"
                                    className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    Ekle
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ease-in-out">
                                    {visibleAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => handleAddressSelect(addr.id)}
                                            className={`relative border-2 ${selectedAddressId === addr.id ? 'border-primary' : 'border-zinc-200'} p-6 rounded-xl bg-white ${selectedAddressId !== addr.id ? 'hover:border-zinc-400' : ''} transition-all duration-300 cursor-pointer group shadow-sm`}
                                        >
                                            {selectedAddressId === addr.id && (
                                                <div className="absolute top-4 right-4 text-primary">
                                                    <span className="material-symbols-outlined fill-1">check_circle</span>
                                                </div>
                                            )}
                                            <h4 className="font-bold text-lg mb-2">{addr.title}</h4>
                                            <p className="font-semibold text-sm mb-1">{addr.fullName}</p>
                                            <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                                                {addr.neighborhood} {addr.fullAddress}<br />
                                                {addr.district}<br />
                                                {addr.city}
                                            </p>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{formatDisplayPhone(addr.phone)}</p>
                                        </div>
                                    ))}
                                </div>

                                {addresses.length > 2 && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                                            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-primary transition-colors group"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                {isAddressExpanded ? 'Daha Az Göster' : 'Diğer Adresleri Göster'}
                                            </span>
                                            <div className={`p-1 rounded-full transition-colors ${isAddressExpanded ? 'rotate-180' : ''}`}>
                                                <span className="material-symbols-outlined text-lg block">expand_more</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* 2. Shipping Method Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">2</span>
                            <h3 className="text-2xl font-bold tracking-tight">Kargo Yöntemi</h3>
                        </div>
                        {isFreeShippingCoupon ? (
                            <div className="p-5 border-2 border-green-500 bg-green-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-green-100 rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600">local_shipping</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-green-700">Ücretsiz Kargo</p>
                                        <p className="text-sm text-green-600">Kupon ile ücretsiz kargo uygulanmaktadır ({selectedCoupon?.code})</p>
                                    </div>
                                    <p className="font-extrabold text-green-600">Ücretsiz</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {!isDeliveryMethod && (
                                    <label className={`flex items-center justify-between p-5 border-2 border-primary bg-white rounded-xl cursor-pointer hover:border-primary transition-colors`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 bg-zinc-100 rounded flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-700">Standart Teslimat</p>
                                                <p className="text-sm text-zinc-400">Belirlenen kurallara göre kargo</p>
                                            </div>
                                        </div>
                                        <p className="font-extrabold text-primary">
                                            {shippingCost === 0 ? "Ücretsiz" : `₺${new Intl.NumberFormat("tr-TR").format(shippingCost)}`}
                                        </p>
                                        <input
                                            className="hidden"
                                            name="shipping"
                                            type="radio"
                                            checked={true}
                                            readOnly
                                        />
                                    </label>
                                )}

                                {isDeliveryMethod && deliveryOptionsToRender.map((option) => (
                                    <label key={option.id} className={`flex items-center justify-between p-5 border-2 ${selectedShipping === option.id.toString() ? 'border-primary' : 'border-zinc-200'} bg-white rounded-xl cursor-pointer hover:border-primary transition-colors`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 bg-zinc-100 rounded flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                            </div>
                                            <div>
                                                <p className="font-bold">{option.name}</p>
                                            </div>
                                        </div>
                                        <p className="font-extrabold text-primary">
                                            {Number(option.fee.toString().replace(",", ".")) === 0
                                                ? "Ücretsiz"
                                                : `₺${new Intl.NumberFormat("tr-TR").format(Number(option.fee.toString().replace(",", ".")))}`}
                                        </p>
                                        <input
                                            className="hidden"
                                            name="shipping"
                                            type="radio"
                                            checked={selectedShipping === option.id.toString()}
                                            onChange={() => setSelectedShipping(option.id.toString())}
                                        />
                                    </label>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 3. Payment Method Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="size-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold">3</span>
                            <h3 className="text-2xl font-bold tracking-tight">Ödeme Bilgileri</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Card Simulation */}
                            <div className="w-full aspect-[1.58/1] perspective-[1000px] group">
                                <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                                    {/* Front Face */}
                                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black rounded-2xl p-5 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                                <div className="absolute -right-10 -top-10 size-40 bg-white/20 rounded-full blur-3xl"></div>
                                                <div className="absolute -left-10 -bottom-10 size-40 bg-zinc-400/20 rounded-full blur-3xl"></div>
                                            </div>
                                            <div className="flex justify-between items-start relative z-10 h-6">
                                                <div className="text-white text-sm sm:text-base font-bold italic tracking-wider opacity-90 drop-shadow-md">
                                                    {detectedBank}
                                                </div>
                                            </div>
                                            <div className="relative z-10 flex flex-col justify-end flex-grow mt-2">
                                                {/* Chip & Contactless */}
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="w-9 h-7 sm:w-11 sm:h-9 rounded-md shrink-0 bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-500 overflow-hidden flex flex-col justify-between p-1 shadow-inner border border-zinc-500/50">
                                                        <div className="h-[1px] w-full bg-zinc-500/60"></div>
                                                        <div className="flex justify-between w-full h-full my-[1px]">
                                                            <div className="w-[1px] h-full bg-zinc-500/60"></div>
                                                            <div className="flex-1 border border-zinc-500/40 rounded-sm mx-1"></div>
                                                            <div className="w-[1px] h-full bg-zinc-500/60"></div>
                                                        </div>
                                                        <div className="h-[1px] w-full bg-zinc-500/60"></div>
                                                    </div>
                                                </div>

                                                {/* Number & Contactless combined line */}
                                                <div className="flex justify-between items-center mb-2 w-full">
                                                    <p className="text-base sm:text-[18px] md:text-[20px] font-mono tracking-[0.1em] sm:tracking-[0.14em] uppercase text-white drop-shadow-md whitespace-nowrap min-w-0">
                                                        {displayCardNumber()}
                                                    </p>
                                                    <span className="material-symbols-outlined text-white text-xl sm:text-3xl rotate-90 opacity-80 pl-1 sm:pl-2 shrink-0">wifi</span>
                                                </div>

                                                {/* Expiry below number, offset to right */}
                                                <div className="flex justify-center w-full mb-1 sm:mb-2 ml-4 sm:ml-8">
                                                    <div className="flex items-center gap-1.5 opacity-90">
                                                        <div className="text-[5px] sm:text-[6px] uppercase leading-[1.1] font-bold flex flex-col scale-90 delay-700">
                                                            <span>SKT</span>
                                                        </div>
                                                        <p className="font-mono text-[10px] sm:text-xs font-semibold tracking-widest">{displayExpiry()}</p>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Name & Brand Logo */}
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] sm:text-xs md:text-sm font-mono font-medium tracking-widest uppercase truncate max-w-[70%] drop-shadow-md pb-0.5 whitespace-nowrap">
                                                        {displayCardName}
                                                    </p>
                                                    <div className="h-8 sm:h-12 w-16 sm:w-20 transition-all duration-300 flex justify-end items-end">
                                                        {cardBrand !== "unknown" && cardBrandLogos[cardBrand] ? (
                                                            <CardBrandSvg brand={cardBrand} className="h-full w-auto text-white drop-shadow-md" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-white/40 text-4xl">credit_card</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Face */}
                                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black rounded-2xl text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                                <div className="absolute -right-10 -top-10 size-40 bg-white/20 rounded-full blur-3xl"></div>
                                                <div className="absolute -left-10 -bottom-10 size-40 bg-zinc-400/20 rounded-full blur-3xl"></div>
                                            </div>

                                            {/* Magnetic Strip */}
                                            <div className="w-full h-12 bg-black/50 absolute top-8 z-10"></div>

                                            {/* CVV Area */}
                                            <div className="mt-8 px-8 relative z-10 w-full">
                                                <div className="w-full bg-zinc-200 h-10 rounded flex items-center justify-end px-4 relative">
                                                    <div className="absolute inset-y-1 left-1 right-16 grid grid-cols-10 gap-0.5 opacity-20">
                                                        {Array.from({ length: 20 }).map((_, i) => (
                                                            <div key={i} className="-skew-x-12 bg-zinc-400 h-full w-full"></div>
                                                        ))}
                                                    </div>
                                                    <span className="text-zinc-900 font-mono text-lg tracking-widest relative z-10">{displayCvv}</span>
                                                </div>
                                                <p className="text-right text-[10px] uppercase tracking-widest opacity-50 mt-1">CVV / CVC</p>
                                            </div>

                                            {/* Bottom Element */}
                                            <div className="absolute bottom-5 right-5 opacity-30 text-white">
                                                {cardBrand !== "unknown" && cardBrandLogos[cardBrand] ? (
                                                    <CardBrandSvg brand={cardBrand} className="h-5 w-auto text-white" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-white/30 text-xl">credit_card</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Kart Üzerindeki İsim</label>
                                    <input
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        onFocus={() => setIsFlipped(false)}
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="Ad Soyad"
                                        type="text"
                                        autoComplete="cc-name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Kart Numarası</label>
                                    <div className="relative">
                                        <input
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            onFocus={() => setIsFlipped(false)}
                                            className={`w-full bg-white border rounded-lg px-4 py-3 pr-14 focus:ring-1 outline-none transition-all ${cardNumberError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-zinc-200 focus:ring-primary focus:border-primary'}`}
                                            placeholder="0000 0000 0000 0000"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            maxLength={19}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {cardBrand !== "unknown" && cardBrandLogos[cardBrand] ? (
                                                <CardBrandSvg brand={cardBrand} className="h-6 w-auto" />
                                            ) : (
                                                <span className="material-symbols-outlined text-zinc-400">credit_card</span>
                                            )}
                                        </div>
                                    </div>
                                    {cardNumberError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{cardNumberError}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">SKT</label>
                                        <input
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            onBlur={handleExpiryBlur}
                                            onFocus={() => setIsFlipped(false)}
                                            className={`w-full bg-white border rounded-lg px-4 py-3 focus:ring-1 outline-none transition-all ${expiryError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-zinc-200 focus:ring-primary focus:border-primary'}`}
                                            placeholder="AA / YY"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="cc-exp"
                                            maxLength={7}
                                        />
                                        {expiryError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{expiryError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">CVV</label>
                                        <input
                                            value={cardCvv}
                                            onChange={handleCvvChange}
                                            onFocus={() => setIsFlipped(true)}
                                            onBlur={() => setIsFlipped(false)}
                                            className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="123"
                                            type="password"
                                            inputMode="numeric"
                                            autoComplete="cc-csc"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        className="w-5 h-5 border-zinc-300 text-primary focus:ring-primary rounded transition-all"
                                        type="checkbox"
                                        checked={billingSameAsShipping}
                                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                    />
                                </div>
                                <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Fatura adresi teslimat adresiyle aynı olsun.</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input className="w-5 h-5 border-zinc-300 text-primary focus:ring-primary rounded transition-all" type="checkbox" />
                                </div>
                                <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">3D Secure ile güvenli ödeme yapmak istiyorum.</span>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 pb-6 border-b border-zinc-100">Sipariş Özeti</h3>
                        {/* Item List Preview */}
                        <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {isMounted && cartItems.map((item) => (
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
                        {/* Totals */}
                        <div className="space-y-4 pt-6 border-t border-zinc-100 mb-8">
                            <div className="flex justify-between text-zinc-500">
                                <span>Ara Toplam</span>
                                <span>₺{isMounted ? new Intl.NumberFormat("tr-TR").format(totalPrice()) : "0,00"}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Kargo Ücreti</span>
                                <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-primary'}`}>
                                    {shippingCost === 0 ? 'Ücretsiz' : `₺${new Intl.NumberFormat("tr-TR").format(shippingCost)}`}
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
                                        ₺{isMounted ? new Intl.NumberFormat("tr-TR").format(grandTotal) : "0,00"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Complete Order Button */}
                        <button
                            onClick={handleCompleteOrder}
                            disabled={!selectedAddressId}
                            className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siparişi Tamamla
                        </button>

                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="Visa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAM79h086N4JwHQzeHJf9MoevzYcUW0qNRH0fgf_giOpateQVwAVTRhmxvaqmjIcfGgBwbyVc_XlTDo0X4eqY0wSTuIyTiCH9Oc-U5sOr9ozCUJaJKmQ-gePh5nGla2XGhDiLoYYz9Ui3N0I5QllEv9axTCzAUXgJhFEJmiHQgYw8Dz78We33ugoQa_M5HpKre2w0-TFcG3L9SGQ4jL41JWz4BEFSiah5EORPPZbzoQ2OWrPLq5fWJ0y-amEWam3-5slthJeAhsksP" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="PayPal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHmBBCUwcQD-SHv9SxzZ1Lo0uoOKqGLjVftqbxOJmCjeYALStTlTSzxCoFk_Sd-Eg7tuSrO-5iQ0fsPgjjWGhNUYi-PgCuE_AUatxrtezN5croUEiYz55l3yM6sapyjRwUZ6P1Zl8Sepu5p3szI8nSqHpkb-5BIk_o-EN6ZkxOZBdC213B2jPVZDqe1aDERr0LNquc4W0y8SNR5kVmxIOsxIJrD7e21mPjMGi2E4ynhQsbJ8TUrJGECPcKUnIpfuU_c_djQVmT3MJ0" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="h-4" alt="Mastercard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj5wl8WTCn83qpxhN926l1-tUX4zqx03Iecio0wLtBxYkfJXNnsjA8EVAMUaLmAP4rbr5yy472shkP06pwj1S2-FB-aZRxtczsqN0XT_ir_ywBh_d7ePt8h-7rGOK2UzK_IT2-ZAnfvp8Ks360DQIOdWdT_pA5-k_NuOKBL4JVcSyoqmR7cyKE23Epf_2BjouA0Yqdqthc-o1SyhmEB2h1D6FN0gF0Oyyv7VZkrOPlr7rZRfK0h3hlXCSNrJGJfBvDEzno-wn-rvCc" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                256-Bit SSL Sertifikalı Güvenli Ödeme
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
