"use client";

import { useState } from "react";

type ShippingCalcMethod =
    | "single"
    | "sum"
    | "first_plus"
    | "threshold"
    | "delivery_method";

interface DeliveryMethod {
    id: number;
    name: string;
    fee: string;
    isDefault: boolean;
}

const SHIPPING_CALC_OPTIONS: { value: ShippingCalcMethod; label: string }[] = [
    { value: "single", label: "Sepetin toplamı için tek bir ürünün kargo ücretini uygula" },
    { value: "sum", label: "Sepetteki tüm ürünlerin kargo ücretlerini toplayarak uygula" },
    { value: "first_plus", label: "Sepetteki ilk ürünün kargo ücreti üzerine ürün başına ücret ekle" },
    { value: "threshold", label: "Sepetin toplamını eşik değerle karşılaştırarak kargo ücreti belirle" },
    { value: "delivery_method", label: "Müşterinin seçeceği teslimat yöntemine göre ücret belirle" },
];

const AVAILABLE_CARRIERS = [
    "Yurtiçi Kargo",
    "Aras Kargo",
    "MNG Kargo",
    "PTT Kargo",
    "Sürat Kargo",
    "UPS",
    "DHL",
    "FedEx",
    "Trendyol Express *",
    "HepsiJet *",
];

export default function KargoAyarlariPage() {
    const [shippingFee, setShippingFee] = useState("90,00");
    const [currency] = useState("TL");
    const [applyToFree, setApplyToFree] = useState(false);
    const [calcMethod, setCalcMethod] = useState<ShippingCalcMethod>("single");
    const [calcMenuOpen, setCalcMenuOpen] = useState(false);
    const [fastDelivery, setFastDelivery] = useState(true);
    const [freeShipping, setFreeShipping] = useState(false);
    const [international, setInternational] = useState(false);

    // first_plus states
    const [extraPerItem, setExtraPerItem] = useState("0,00");

    // threshold states
    const [thresholdValue, setThresholdValue] = useState("");
    const [belowThresholdFee, setBelowThresholdFee] = useState("");
    const [aboveThresholdFee, setAboveThresholdFee] = useState("");

    // delivery_method states
    const [selectedCarrier, setSelectedCarrier] = useState("");
    const [carrierDropdownOpen, setCarrierDropdownOpen] = useState(false);
    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([
        { id: 1, name: "Yurtiçi Kargo", fee: "0,00", isDefault: true },
    ]);

    const selectedCalcLabel = SHIPPING_CALC_OPTIONS.find((o) => o.value === calcMethod)?.label || "";

    const addDeliveryMethod = () => {
        if (!selectedCarrier) return;
        if (deliveryMethods.some((m) => m.name === selectedCarrier)) return;
        setDeliveryMethods([
            ...deliveryMethods,
            { id: Date.now(), name: selectedCarrier, fee: "0,00", isDefault: false },
        ]);
        setSelectedCarrier("");
        setCarrierDropdownOpen(false);
    };

    const removeDeliveryMethod = (id: number) => {
        const updated = deliveryMethods.filter((m) => m.id !== id);
        if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
            updated[0].isDefault = true;
        }
        setDeliveryMethods(updated);
    };

    const setDefaultMethod = (id: number) => {
        setDeliveryMethods(
            deliveryMethods.map((m) => ({ ...m, isDefault: m.id === id }))
        );
    };

    const updateMethodFee = (id: number, fee: string) => {
        setDeliveryMethods(
            deliveryMethods.map((m) => (m.id === id ? { ...m, fee } : m))
        );
    };

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <span>Dükkan Yönetimi</span>
                <span className="material-icons text-sm">chevron_right</span>
                <span className="text-[#111827] font-medium">Kargo Ayarları</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#111827]">Kargo Ayarları</h1>
                <p className="text-sm text-[#6B7280] mt-1">Kargo ücretlendirme ve teslimat tercihlerinizi yönetin</p>
            </div>

            {/* Kargo Ücret Detayları */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-[#FF007F] text-xl">local_shipping</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#111827]">Kargo Ücret Detayları</h2>
                        <p className="text-xs text-[#9CA3AF]">Standart kargo ücretinizi ve hesaplama yöntemini belirleyin</p>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Standart Kargo Ücreti */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                Standart Kargolama Ücreti
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                                    {currency}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                Para Birimi
                            </label>
                            <div className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#6B7280] bg-[#F9FAFB] flex items-center gap-2">
                                <span className="material-icons text-lg text-[#9CA3AF]">payments</span>
                                Türk Lirası (TL)
                            </div>
                        </div>
                    </div>

                    {/* Checkbox: Apply to free */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="mt-0.5">
                            <input
                                type="checkbox"
                                checked={applyToFree}
                                onChange={(e) => setApplyToFree(e.target.checked)}
                                className="w-5 h-5 rounded border-[#D1D5DB] text-[#FF007F] focus:ring-[#FF007F]/20 cursor-pointer"
                            />
                        </div>
                        <span className="text-sm text-[#374151] group-hover:text-[#111827] transition-colors">
                            Standart Kargo Ücreti, Ücretsiz Kargo&apos;lu ürünlerim için de geçerli olsun.
                        </span>
                    </label>

                    {/* Divider */}
                    <div className="border-t border-[#F3F4F6]" />

                    {/* Kargo Ücreti Hesaplama - Dropdown Menu */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-1">Kargo Ücreti Hesaplama</h3>
                        </div>

                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setCalcMenuOpen(!calcMenuOpen)}
                                className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-left transition-all ${calcMenuOpen
                                    ? "border-[#FF007F] ring-2 ring-[#FF007F]/20"
                                    : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                                    }`}
                            >
                                <span className="text-[#111827] font-medium">{selectedCalcLabel}</span>
                                <span className={`material-icons text-[#9CA3AF] text-xl transition-transform duration-200 ${calcMenuOpen ? "rotate-180" : ""}`}>
                                    expand_more
                                </span>
                            </button>

                            {calcMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-40" onClick={() => setCalcMenuOpen(false)} />

                                    {/* Menu */}
                                    <div className="absolute z-50 mt-2 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {SHIPPING_CALC_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setCalcMethod(opt.value);
                                                    setCalcMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left transition-colors ${calcMethod === opt.value
                                                    ? "bg-[#FFF1F7] text-[#FF007F] font-medium"
                                                    : "text-[#374151] hover:bg-[#F9FAFB]"
                                                    }`}
                                            >
                                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${calcMethod === opt.value
                                                    ? "border-[#FF007F]"
                                                    : "border-[#D1D5DB]"
                                                    }`}>
                                                    {calcMethod === opt.value && (
                                                        <span className="w-2 h-2 rounded-full bg-[#FF007F]" />
                                                    )}
                                                </span>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ===== CONDITIONAL SUB-FORMS ===== */}

                    {/* first_plus: Ek Kargo Ücreti */}
                    {calcMethod === "first_plus" && (
                        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                    Birden Fazla Ürün İçin Ek Kargo Ücreti
                                </label>
                                <div className="relative max-w-xs">
                                    <input
                                        type="text"
                                        value={extraPerItem}
                                        onChange={(e) => setExtraPerItem(e.target.value)}
                                        className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                                        {currency}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <span className="material-icons text-amber-500 text-xl flex-shrink-0 mt-0.5">info</span>
                                <p className="text-sm text-amber-800">
                                    Standart kargolama ücretini güncellediğinizde mevcut ürünleriniz kargolama ücretleri de güncellenecektir.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* threshold: Eşik Değer Ayarları */}
                    {calcMethod === "threshold" && (
                        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                        Sepet Eşik Değeri
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={thresholdValue}
                                            onChange={(e) => setThresholdValue(e.target.value)}
                                            placeholder="Örn: 500,00"
                                            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-12 placeholder:text-[#D1D5DB]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                                            {currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                        Para Birimi
                                    </label>
                                    <div className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#6B7280] bg-white flex items-center gap-2">
                                        <span className="material-icons text-lg text-[#9CA3AF]">payments</span>
                                        Türk Lirası (TL)
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                        Eşik Değer Altı Kargo Ücreti
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={belowThresholdFee}
                                            onChange={(e) => setBelowThresholdFee(e.target.value)}
                                            placeholder="Örn: 29,90"
                                            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-12 placeholder:text-[#D1D5DB]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                                            {currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                        Eşik Değer Üstü Kargo Ücreti
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={aboveThresholdFee}
                                            onChange={(e) => setAboveThresholdFee(e.target.value)}
                                            placeholder="Örn: 0,00 (Ücretsiz)"
                                            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-12 placeholder:text-[#D1D5DB]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9CA3AF]">
                                            {currency}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <span className="material-icons text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
                                <p className="text-sm text-blue-800">
                                    Eşik değere göre kargolama ücreti tanımladığınızda, standart kargo ücretiniz ve varsa ürün bazlı kargo ücretleriniz devre dışı kalır.
                                    Müşterinizin ödeyeceği kargo ücreti sadece alışveriş sepetinin toplam tutarına göre belirlenir.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* delivery_method: Teslimat Yöntemi Seçimi */}
                    {calcMethod === "delivery_method" && (
                        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Kargo Seçiniz */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                    Kargo Seçiniz
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 max-w-md">
                                        <button
                                            type="button"
                                            onClick={() => setCarrierDropdownOpen(!carrierDropdownOpen)}
                                            className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-left bg-white transition-all ${carrierDropdownOpen
                                                ? "border-[#FF007F] ring-2 ring-[#FF007F]/20"
                                                : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                                                }`}
                                        >
                                            <span className={selectedCarrier ? "text-[#111827]" : "text-[#9CA3AF]"}>
                                                {selectedCarrier || "Kargo firması seçin..."}
                                            </span>
                                            <span className={`material-icons text-[#9CA3AF] text-xl transition-transform duration-200 ${carrierDropdownOpen ? "rotate-180" : ""}`}>
                                                expand_more
                                            </span>
                                        </button>

                                        {carrierDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setCarrierDropdownOpen(false)} />
                                                <div className="absolute z-50 mt-2 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                                    {AVAILABLE_CARRIERS.filter(
                                                        (c) => !deliveryMethods.some((m) => m.name === c)
                                                    ).map((carrier) => (
                                                        <button
                                                            key={carrier}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCarrier(carrier);
                                                                setCarrierDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors ${selectedCarrier === carrier
                                                                ? "bg-[#FFF1F7] text-[#FF007F] font-medium"
                                                                : "text-[#374151] hover:bg-[#F9FAFB]"
                                                                }`}
                                                        >
                                                            <span className="material-icons text-lg text-[#9CA3AF]">local_shipping</span>
                                                            {carrier}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addDeliveryMethod}
                                        disabled={!selectedCarrier}
                                        className="flex items-center gap-2 bg-[#FF007F] text-white px-5 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons text-xl">add</span>
                                        Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Alternatif Teslimat Yöntemleri */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                                    Alternatif Teslimat Yöntemleri
                                </h4>

                                <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-5 py-3 w-20">
                                                    Varsayılan
                                                </th>
                                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-5 py-3">
                                                    Teslimat Yöntemi
                                                </th>
                                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-5 py-3 w-40">
                                                    Ücret
                                                </th>
                                                <th className="text-center text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-5 py-3 w-16">
                                                    Sil
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliveryMethods.map((method) => (
                                                <tr key={method.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
                                                    <td className="px-5 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDefaultMethod(method.id)}
                                                            className="flex items-center justify-center"
                                                        >
                                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${method.isDefault
                                                                ? "border-[#FF007F]"
                                                                : "border-[#D1D5DB] hover:border-[#9CA3AF]"
                                                                }`}>
                                                                {method.isDefault && (
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF007F]" />
                                                                )}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                                                                <span className="material-icons text-[#6B7280] text-sm">local_shipping</span>
                                                            </div>
                                                            <span className="text-sm font-medium text-[#111827]">{method.name}</span>
                                                            {method.name.includes("*") && (
                                                                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Anlaşmalı</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={method.fee}
                                                                onChange={(e) => updateMethodFee(method.id, e.target.value)}
                                                                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827] focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none pr-10"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#9CA3AF]">
                                                                {currency}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDeliveryMethod(method.id)}
                                                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-icons text-red-400 text-xl">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {deliveryMethods.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-5 py-8 text-center">
                                                        <span className="material-icons text-3xl text-[#D1D5DB]">local_shipping</span>
                                                        <p className="text-sm text-[#9CA3AF] mt-2">Henüz teslimat yöntemi eklenmemiş</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <span className="material-icons text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
                                    <p className="text-sm text-blue-800">
                                        Bu bölümde seçeceğiniz alternatif kargo firmaları, seçim yapmaları için müşterilerinize sunulur.
                                        Varsayılan kargo firması ilk seçenek olarak gösterilir. Anlaşmalı kargo hizmetleri, yanında yıldız
                                        işareti (*) bulunan firmalarda geçerlidir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* General Info Note (for single & sum) */}
                    {(calcMethod === "single" || calcMethod === "sum") && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-icons text-amber-500 text-xl flex-shrink-0 mt-0.5">warning</span>
                            <p className="text-sm text-amber-800">
                                Standart kargolama ücretini güncellediğinizde mevcut ürünleriniz kargolama ücretleri de güncellenecektir.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hızlı Teslimat Bildirimi */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-blue-600 text-xl">bolt</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#111827]">Hızlı Teslimat Bildirimi</h2>
                        <p className="text-xs text-[#9CA3AF]">Dükkanınızdaki ürünlerin kargoya teslim süresi bildirimini yönetin</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#374151]">
                                Hızlı teslimat bildirimini açık duruma getirdiğinizde dükkanınızda ürünlerinizin kargoya teslim süresi görüntülenecektir.
                            </p>
                        </div>
                        <button
                            onClick={() => setFastDelivery(!fastDelivery)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ml-6 ${fastDelivery ? "bg-[#FF007F]" : "bg-[#D1D5DB]"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${fastDelivery ? "translate-x-8" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${fastDelivery ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${fastDelivery ? "bg-green-500" : "bg-gray-400"}`} />
                            {fastDelivery ? "Açık" : "Kapalı"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ücretsiz Kargo Opsiyonu */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-green-600 text-xl">local_offer</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#111827]">Ücretsiz Kargo Opsiyonu</h2>
                        <p className="text-xs text-[#9CA3AF]">Belirli koşullarda ücretsiz kargo seçeneğini aktifleştirin</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#374151]">
                                Ücretsiz kargo seçeneğini açarak müşterilerinize kargo ücreti olmadan alışveriş yapma imkânı sunabilirsiniz.
                            </p>
                        </div>
                        <button
                            onClick={() => setFreeShipping(!freeShipping)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ml-6 ${freeShipping ? "bg-[#FF007F]" : "bg-[#D1D5DB]"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${freeShipping ? "translate-x-8" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${freeShipping ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${freeShipping ? "bg-green-500" : "bg-gray-400"}`} />
                            {freeShipping ? "Açık" : "Kapalı"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Yurt Dışına Gönderim */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-purple-600 text-xl">public</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#111827]">Yurt Dışına Gönderim</h2>
                        <p className="text-xs text-[#9CA3AF]">Uluslararası gönderim seçeneklerini yönetin</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#374151]">
                                Bu seçenek açık durumdayken müşterileriniz teslimat adresi olarak yurt dışı adresler seçebilirler.
                            </p>
                        </div>
                        <button
                            onClick={() => setInternational(!international)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ml-6 ${international ? "bg-[#FF007F]" : "bg-[#D1D5DB]"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${international ? "translate-x-8" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${international ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${international ? "bg-green-500" : "bg-gray-400"}`} />
                            {international ? "Açık" : "Kapalı"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#FF007F] text-white px-8 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors shadow-lg shadow-[#FF007F]/20">
                    <span className="material-icons text-xl">save</span>
                    Değişiklikleri Kaydet
                </button>
            </div>
        </div>
    );
}
