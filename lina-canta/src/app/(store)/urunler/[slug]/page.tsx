"use client";

import Link from "next/link";

const THUMBS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAz6S_Pgst2j0m2X-LdzIVIMnGt6FO2asSzgeohHq2SJznJ83d3SQH5fzT-dzLTHMW7wGpD1yN1iCx5bZw7jeb25kdbOe7owS83H65a_53WyxDJyB0cV-ldxU9Q7KY3fhP4svr2BDZFgF90TBmvf4mWqVw3dUZqyuWFcmlQp4h_lkdBiY55UlDErlFFEdr1HrJnx00tw75rLixNH9f_Oaq5uXQ1C1SKvt84s0teVzQyGyJAchrnvsytDSttRGm_CtewFOvgQikRGXRz",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAOPSPFbAWQbuZ43GvR7OrKmoWneWrJm9ukZL2xn6Q8SJHnLlcea4pDPdn9KtGA-kAd05yS9b_J0lqlPsbwm6qtAwOH1JHejsMfhjA3hntPZ1rGHLC0ML1v6ZIKTa6HpukE--cX-YkbCpCVWbjivSAlzD91RHCjeZsTrpVyALaHTBYG7v_5hOBCDAwyy82sKCha_Frob_625rlDNItgv54GPjWSoU8LLSmct5-5psNEG__Pkvu6jJ1oqM5_rNBFMxs8rlpklZpW1UXT",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA2q_JyZOlUU-pZ7_EVugpvgz-8UIlPOB_ImPN4Amx_QDkuv9CbCwLXg0LSbwcUKsoHYGhJez29q4iWWWkHrgaKycjGUgzX99rM79_02pHqzrSAKt32b7SFMyhpsg5Y8c6zbOnUoiwlAxNoFCc9_ZWUEpPSyXXTPQSrMWORPc-X_yu28Wj91x8adA2GIgMICB-fXcY_YKXqasAqgPE2fZd16J_gzTUZezpN3xQjaGrmocNRjSH-seREuNOxU0Bita8iauyKBzxzSU4N",
];

const RELATED = [
    { brand: "Saint Laurent", name: "Leather Card Case", price: "₺9.800", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1f8Dpms9DHynDNhbSgwsUb_3RwhVdq_V60H73R0aLjVya3KYUFs_2ls8ujsJ77NGvfCMlqnmVfeNQYZ8krGg3EaRZVs6gsdMhtKe89zFqwcvACwguLsqoVLBQRcqz6dWcYcfMJwVpOq6KdkYME1MfFcYFNQ8W6eGM3sibYAyshr-sflexynGFB1iafhZgjmCRrBlKtKxZyP4MPNA9XSKJfEwXGe5_r7IhUsXOplwh1KUG8vy_EkCkiSLl5UqHbeRqrXGBBd1Il838" },
    { brand: "Saint Laurent", name: "Monogram Phone Case", price: "₺12.400", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh3sCIeGlMAnDJ4DrPS6znDbaz6kiaNxSx7me98wK6Wb_0L4aHNd2m2W9KMXthVfmlwIcbEv3Q4ds7pFeUGO71xyqLRRQM9pwrUiu5jlQzWP3M1-uBrLgbFLR-d7Ds8yx8MxV8xXiaaVcRQM0RPVl_Mma1ER0GK3XNPa-7Hb15qK2yVXkJtHddltQQhbJymeip2XrwQhUO1jY1CWGpZ4SXOmAkEGd6i5ZOAAdj9ugh1RBZoPtWvB2j0cy2p-NmrdnCWDqubF5wlCIP" },
    { brand: "Saint Laurent", name: "SL 276 Cat-Eye", price: "₺14.200", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0PesV603qtPymgmSWtIkSEfRErJUUe9oBtrM-wpHzSuLuh0HJvOVswK6uKWU9Sl-w6Mz9EcW36cHiWOXJos3N0dHbIwIe8lkW-Z_XdgwAMswFqWpddToyYCdJMyXnaO08wR9dsE7ZUqoiHxDxd4EQTiDXsEoUG-YU-lSjDJ3tNM6Gosz4lXeA9mGJynAdSRauNgO5jG71hH7VvNts1pAuNtIhcKuNePzHf932233Aapq-HekoD8MvK3UGDGxwLbMRQz4bZo6h43tC" },
    { brand: "Saint Laurent", name: "Opyum Leather Pumps", price: "₺34.500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhKCVfLkeIakmDGjF8TwU23Ac72q9M8Ol74q4CN6ZU5Q8pv68uzsbq2PPqWrpSXbOLIlaFBboJE82bI7qZL8XuwvRwHhiLcSM0kMbRKau-BjPvZH1QHaYMvI4NtqvUKWAvtBzVAG2CZ1ylRXRinr7Oa-ISeeDTpmmL4lP7ByFJGbwrujLijj2MnZzTOl7LIoBwdnuLLWxC9jVTcD6-dKQOTVBGL7-4K3xMZWDvg1iiNeGpy8bevWA7af9oCFaN54voQzsJv7nthiOs" },
];

import { useState } from "react";

export default function ProductDetailPage() {
    const [selectedImg, setSelectedImg] = useState(0);

    return (
        <main className="max-w-7xl mx-auto px-6 pt-28 pb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-12">
                <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href="/urunler" className="hover:text-primary transition-colors">Çantalar</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary">Sac de Jour Nano</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Image Gallery */}
                <div className="lg:col-span-7 flex gap-6 h-fit lg:sticky lg:top-28">
                    {/* Thumbnails */}
                    <div className="flex flex-col gap-4 w-20 shrink-0">
                        {THUMBS.map((t, i) => (
                            <button key={i} onClick={() => setSelectedImg(i)} className={`aspect-[3/4] w-full bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImg === i ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-gray-300"}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={`View ${i + 1}`} className="w-full h-full object-cover" src={t} />
                            </button>
                        ))}
                    </div>
                    {/* Main Image */}
                    <div className="flex-1 aspect-[3/4] bg-[#f9fafb] rounded-xl overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={THUMBS[selectedImg]} />
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">Saint Laurent</h2>
                        <h1 className="text-4xl font-bold tracking-tight text-primary">Sac de Jour Nano Leather Bag</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex text-primary">
                                {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                                <span className="material-symbols-outlined text-lg">star_half</span>
                            </div>
                            <span className="text-sm font-medium text-gray-400 underline underline-offset-4 cursor-pointer">48 Değerlendirme</span>
                            <div className="h-4 w-px bg-gray-200" />
                            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Stokta</span>
                        </div>
                        <div className="pt-4">
                            <span className="text-3xl font-bold text-primary">₺84.500</span>
                        </div>
                    </div>

                    {/* Variations */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Renk: <span className="text-gray-500 font-normal">Tan</span></span>
                            <div className="flex gap-4">
                                <button className="size-10 rounded-full border-2 border-primary p-0.5"><div className="w-full h-full rounded-full bg-[#C19A6B]" /></button>
                                <button className="size-10 rounded-full border border-gray-200 p-0.5 hover:border-gray-400"><div className="w-full h-full rounded-full bg-[#1A1A1A]" /></button>
                                <button className="size-10 rounded-full border border-gray-200 p-0.5 hover:border-gray-400"><div className="w-full h-full rounded-full bg-[#8B0000]" /></button>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Beden Seçin</span>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Beden Rehberi</button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <button className="py-3 border border-primary bg-primary text-white text-xs font-bold rounded-lg">NANO</button>
                                <button className="py-3 border border-gray-200 hover:border-gray-400 text-xs font-bold rounded-lg">BABY</button>
                                <button className="py-3 border border-gray-200 hover:border-gray-400 text-xs font-bold rounded-lg text-gray-400">SMALL</button>
                                <button className="py-3 border border-gray-200 hover:border-gray-400 text-xs font-bold rounded-lg text-gray-400">LARGE</button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button className="flex-1 bg-primary text-white h-16 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-xl">shopping_bag</span>
                            Sepete Ekle
                        </button>
                        <button className="size-16 border-2 border-gray-100 rounded-lg flex items-center justify-center hover:border-gray-200 hover:bg-gray-50 transition-all">
                            <span className="material-symbols-outlined text-2xl">favorite</span>
                        </button>
                    </div>

                    {/* Accordions */}
                    <div className="pt-8 space-y-px">
                        <details className="group border-t border-gray-100" open>
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Ürün Detayları</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pb-8 text-sm leading-relaxed text-gray-600">
                                Sac De Jour Nano, iki adet tüp tipi üst sap, ayarlanabilir ve çıkarılabilir deri çapraz vücut askısı ve çıkarılabilir deri kılıfta asma kilitle birlikte gelir. %100 Dana derisi.
                            </div>
                        </details>
                        <details className="group border-t border-gray-100">
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Materyal &amp; Bakım</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pb-8 text-sm leading-relaxed text-gray-600">
                                Profesyonel deri temizliği önerilir. Uzun süreli nemden ve doğrudan güneş ışığından kaçının.
                            </div>
                        </details>
                        <details className="group border-t border-b border-gray-100">
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Kargo &amp; İade</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pb-8 text-sm leading-relaxed text-gray-600">
                                ₺50.000 üzeri siparişlerde ücretsiz dünya geneli kargo. Teslimat tarihinden itibaren 14 gün içinde iade kabul edilir.
                            </div>
                        </details>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <section className="mt-32 pt-20 border-t border-gray-100">
                <div className="flex justify-between items-end mb-12">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Stili Tamamla</h3>
                        <p className="text-sm text-gray-500">Tarzınızı tamamlayacak özenle seçilmiş parçalar.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="size-10 rounded-full border border-primary flex items-center justify-center bg-primary text-white hover:bg-black transition-all">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {RELATED.map((r) => (
                        <div key={r.name} className="group cursor-pointer">
                            <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={r.img} />
                                <button className="absolute bottom-4 right-4 size-10 bg-white rounded-lg shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    <span className="material-symbols-outlined text-xl">add</span>
                                </button>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{r.brand}</p>
                                <h4 className="text-sm font-semibold group-hover:underline">{r.name}</h4>
                                <p className="text-sm font-medium text-gray-900">{r.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
