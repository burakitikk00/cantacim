"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCities, getDistrictsByCityCode } from "turkey-neighbourhoods";

interface AddressData {
    id?: string;
    title: string;
    fullName: string;
    phone: string;
    city: string;
    district: string;
    neighborhood: string;
    fullAddress: string;
}

interface AddressFormProps {
    initialData?: AddressData;
    mode: "create" | "edit";
}

export function AddressForm({ initialData, mode }: AddressFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const normalizeStr = (str: string) =>
        str.toLocaleLowerCase('tr-TR')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c');

    const [selectedCityName, setSelectedCityName] = useState(() => {
        if (!initialData?.city) return "";
        const c = normalizeStr(initialData.city.trim());
        const match = getCities().find(city => normalizeStr(city.name) === c);
        return match ? match.name : initialData.city;
    });

    const [selectedDistrict, setSelectedDistrict] = useState(() => {
        if (!initialData?.district) return "";
        return initialData.district;
    });

    const selectedCityObj = getCities().find(c => c.name === selectedCityName);
    const districts = selectedCityObj ? getDistrictsByCityCode(selectedCityObj.code) : [];

    const matchingDistrict = districts.find(d => normalizeStr(d) === normalizeStr(selectedDistrict.trim()));
    const districtValue = matchingDistrict || (districts.includes(selectedDistrict) ? selectedDistrict : "");

    const handleSubmit = async (formData: FormData) => {
        // Here you would typically call a server action to save/update the address
        startTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const returnUrl = searchParams.get("returnUrl");
            router.push(returnUrl || "/hesap/adreslerim");
        });
    };

    const title = mode === "create" ? "Yeni Adres Ekle" : "Adresi Düzenle";
    const subTitle = mode === "create"
        ? "Siparişlerinizin size ulaşması için yeni bir teslimat adresi oluşturun."
        : "Mevcut teslimat adresinizi güncelleyin.";
    const breadcrumbCurrent = mode === "create" ? "Yeni Adres" : "Adresi Düzenle";

    return (
        <div className="w-full">
            {/* Breadcrumb & Header */}
            <div className="mb-10">
                <nav className="flex gap-2 text-xs font-semibold text-primary/40 uppercase tracking-widest mb-3">
                    <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                    <span>/</span>
                    <Link href="/hesap" className="text-primary/60 hover:text-primary">Hesabım</Link>
                    <span>/</span>
                    <Link href="/hesap/adreslerim" className="text-primary/60 hover:text-primary">Adreslerim</Link>
                    <span>/</span>
                    <span className="text-primary">{breadcrumbCurrent}</span>
                </nav>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
                        <p className="text-zinc-500">{subTitle}</p>
                    </div>
                </header>
            </div>

            <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Address Form */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <span className="material-symbols-outlined text-zinc-400">home_pin</span>
                            <h3 className="text-lg font-bold">Adres Detayları</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address Title */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Adres Başlığı</label>
                                <input
                                    name="title"
                                    placeholder="Örn: Evim, İş Yerim"
                                    className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20 placeholder:text-zinc-300"
                                    type="text"
                                    required
                                    defaultValue={initialData?.title}
                                />
                            </div>

                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Ad Soyad</label>
                                <input
                                    name="fullName"
                                    className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20"
                                    type="text"
                                    required
                                    defaultValue={initialData?.fullName}
                                />
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Telefon Numarası</label>
                                <input
                                    name="phone"
                                    placeholder="05XX XXX XX XX"
                                    className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20 placeholder:text-zinc-300"
                                    type="tel"
                                    required
                                    defaultValue={initialData?.phone}
                                />
                            </div>

                            {/* Select City */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">İl</label>
                                <div className="relative">
                                    <select
                                        name="city"
                                        className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20 appearance-none cursor-pointer"
                                        value={selectedCityName}
                                        onChange={(e) => {
                                            setSelectedCityName(e.target.value);
                                            setSelectedDistrict("");
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Seçiniz</option>
                                        {getCities().sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')).map((city) => (
                                            <option key={city.code} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 pointer-events-none text-xl">expand_more</span>
                                </div>
                            </div>

                            {/* Select District */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">İlçe</label>
                                <div className="relative">
                                    <select
                                        name="district"
                                        className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={districtValue}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        required
                                        disabled={!selectedCityName || districts.length === 0}
                                    >
                                        <option value="" disabled>Seçiniz</option>
                                        {districts.sort((a, b) => a.localeCompare(b, 'tr-TR')).map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 pointer-events-none text-xl">expand_more</span>
                                </div>
                            </div>

                            {/* Neighborhood */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Mahalle / Cadde / Sokak</label>
                                <input
                                    name="neighborhood"
                                    className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20"
                                    type="text"
                                    required
                                    defaultValue={initialData?.neighborhood}
                                />
                            </div>

                            {/* Full Address Textarea */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Açık Adres</label>
                                <textarea
                                    name="fullAddress"
                                    rows={4}
                                    placeholder="Bina No, Daire No, Kat vb. detayları giriniz."
                                    className="w-full rounded-xl border-zinc-200 focus:border-primary focus:ring-0 py-3 px-4 text-sm bg-zinc-50/50 dark:bg-zinc-800/20 placeholder:text-zinc-300 resize-none"
                                    required
                                    defaultValue={initialData?.fullAddress}
                                />
                            </div>

                            {/* Default Address Checkbox */}
                            <div className="md:col-span-2 flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        id="isDefault"
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-200 bg-zinc-50 dark:bg-zinc-800/20 checked:bg-primary checked:border-primary transition-all"
                                    />
                                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    </span>
                                </div>
                                <label htmlFor="isDefault" className="text-sm cursor-pointer select-none text-zinc-600 dark:text-zinc-400">
                                    Bu adresi varsayılan teslimat adresi olarak ayarla
                                </label>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Info/Summary */}
                <div className="space-y-6">
                    <div className="bg-primary/5 text-primary rounded-2xl p-8 border border-primary/10">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined mt-1">info</span>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Adres İpuçları</h4>
                                <ul className="text-sm space-y-3 opacity-80 leading-relaxed list-disc list-inside marker:text-primary/50">
                                    <li>Kargonuzun sorunsuz ulaşması için ilçe ve mahalle bilgilerini doğru seçiniz.</li>
                                    <li>Bina ve daire numarasını açıkça belirtmeyi unutmayınız.</li>
                                    <li>Kurumsal fatura için vergi bilgilerini fatura adımında girebilirsiniz.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 mt-4 flex items-center justify-end gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                    <Link
                        href="/hesap/adreslerim"
                        className="px-8 py-3 rounded-xl text-sm font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors font-bold"
                    >
                        İptal
                    </Link>
                    <button
                        disabled={isPending}
                        className="bg-primary text-white px-12 py-3 rounded-xl text-sm font-bold tracking-wide hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70 flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {mode === "create" ? "Kaydediliyor..." : "Güncelleniyor..."}
                            </>
                        ) : (
                            mode === "create" ? "Adresi Kaydet" : "Değişiklikleri Kaydet"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
