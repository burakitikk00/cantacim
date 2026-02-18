"use client";

import React from "react";
import Link from "next/link";

export default function FavoritesPage() {
    return (
        <div className="flex-1">
            <div className="mb-8 flex flex-col gap-2">
                <nav className="flex gap-2 text-xs font-semibold text-primary/40 uppercase tracking-widest mb-3">
                    <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                    <span>/</span>
                    <Link href="/hesap" className="text-primary/60 hover:text-primary">Hesabım</Link>
                    <span>/</span>
                    <span className="text-primary">Favorilerim</span>
                </nav>
                <h2 className="text-3xl font-extrabold tracking-tight">Favorilerim</h2>
                <p className="text-primary/50">Koleksiyonunuzda 5 ürün bulunmaktadır.</p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Product Card 1 */}
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Hermes Birkin 30 Deri Çanta"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnDK6Oy0cMtn6_vyFGufbWC-SoFDL6caNsMGwSd6Ak_yukHTiHcZrZ-7p9ErBNOvc9n_-9yk94oGk4AtlsxbiOdWcd6pJCG7kZ-8BLKw3EJvxJrwmMaN2Uj1Ah4cx-J2Jg3p8HSUW6F8g-7dRvpWLvOFyKQqhjMGw38hTjemn-tCPgkC04fWtEK6t_W9u7jz32zdWcDSLROksWLiOUJgykK3LhSmR-z7YGuTIasGV_b3nF91z0Sb7rMyToHqYaKuXlxqf9G4bZyIPO"
                        />
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Hermès</p>
                            <h3 className="text-sm font-semibold">Birkin 30 Lüks Deri</h3>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-gray-900">68.000 ₺</span>
                                <span className="text-xs text-gray-400 line-through">85.000 ₺</span>
                            </div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
                                %20 İndirim
                            </span>
                        </div>
                    </div>
                </div>

                {/* Product Card 2 */}
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Chanel Klasik Flap Çanta Siyah"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZYEFfK4aOcs-JeoRotHK_kB_c-8s4HX7tztHbRTsAYWZRB5wLkH0W6ihkEXqNSX-Ws_hHL6j7IOhawhR-3mHrn4QS3hinAfqC41dXi38xud3kxVdrNXNmllArDFyXkJqGbpi1n-TVu79-aIRuuNir69VX0lTukN7CrNsi2mvnOwj0UMENNusMVvrHK1-0ybtJPkO5mHUYaPKAVcKhPibMFWMD7ik3g6LBbYrnl3n0ajY94izzb-p-SAyF0gw9KtPMhSLPHTP06XPp"
                        />
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Chanel</p>
                            <h3 className="text-sm font-semibold">Klasik Flap Kuzu Derisi</h3>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-gray-900">80.000 ₺</span>
                                <span className="text-xs text-gray-400 line-through">120.000 ₺</span>
                            </div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
                                3 Al 2 Öde
                            </span>
                        </div>
                    </div>
                </div>

                {/* Product Card 3 */}
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Gucci İpek Eşarp Renkli"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHrg78C-Lpk7XxftePyh92mnT4WVPY4rjnVTHIpRoN4IKAX5r8dV2AHcbVQUxMG0L3jh1d_YXZ0iTefiNm_ev4IkjQuba_zwb-Bk-qirSaUmFY1ayzs5CTS1WNmUkeSswiAQwCRr1-tVRhsy3LgaDO6CfPA4HoNcQgqo2P6SoVM7Oh3Gj6kBzfbxMVREq7pXx-uxxpIfZ_QnKT0YSUX9Rx1QUEDyt03qnr5ar3WIL0KrAlrmU_bz_2uwT22yilxaLQ9SX8Vl50XQW4"
                        />
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Gucci</p>
                            <h3 className="text-sm font-semibold">Flora İpek Eşarp</h3>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                            <span className="text-base font-bold">12.500 ₺</span>

                        </div>
                    </div>
                </div>

                {/* Product Card 4 */}
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Dior Lady Bag Beyaz"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfbK1zuW6gBtXmaato7zy9tuBVKWvE5RHfXZumWLs4cD6bUWTJ-dAgD3JJsEkZnS-B6dayVP5hoTCgArGAIuFBXLFA4FwRq5beuvqYZHDDjRDAHaWXgz-wU42-kVh4B8IT1tXkVQEy9HzwI5U4tKqTD-fFvTVS5iogFLM6ljyWsnOm5V9QIU6ZvhI1OVeLn9NPQQThtn-ankyEPIHZOExIZXvwgkGmVvjq8OLPUd03DrUZZkEoQz5KV_cN0r09OnYuvdXxjb3uO0_x"
                        />
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Dior</p>
                            <h3 className="text-sm font-semibold">Lady Dior Cannage</h3>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                            <span className="text-base font-bold">95.000 ₺</span>

                        </div>
                    </div>
                </div>

                {/* Product Card 5 */}
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Louis Vuitton Bag"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWdFCOMYqzGC72xJC9NuXTeHTKB7Wc5MG4T5ppR69AuQwITE54UX6U_R4QI7jBC0Aj0SmBCuYFGUAqk2cB402FOnplVDCh8UlVqgnH1GnG56uxYEm8LIRxH9KJdyBO4LjWXEwiWQqqfnOTnnTBri3PnEBkoZ31AfvUw7jiYAi9U7z3CKiVKi0VrYs_9RIQCowE5uYJRmf5FecIFUZpo3VuyPo16z57R7WvUbvDy4SePeQAo_eCwkGgytp6jl1BAUylKs06iXleoEmA"
                        />
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Louis Vuitton</p>
                            <h3 className="text-sm font-semibold">Capucines BB Bag</h3>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-gray-900">100.800 ₺</span>
                                <span className="text-xs text-gray-400 line-through">112.000 ₺</span>
                            </div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
                                Sepette %10
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Featured Recommendation */}
            <div className="mt-16 rounded-2xl bg-primary p-8 text-white lg:p-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center">
                    <div className="flex-1 space-y-4">
                        <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Sizin İçin Seçildi</span>
                        <h3 className="text-3xl font-bold">Yaz Koleksiyonu Önizleme</h3>
                        <p className="max-w-md text-sm leading-relaxed text-white/70">
                            Favorilerinizdeki ürünlere dayanarak, yeni sezon ipek şal koleksiyonumuzun size çok yakışacağını düşünüyoruz.
                        </p>
                        <button className="rounded-lg bg-white px-8 py-3 text-sm font-bold text-primary transition-transform hover:scale-105">
                            Keşfetmeye Başla
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-40 w-40 overflow-hidden rounded-xl bg-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className="h-full w-full object-cover"
                                alt="Önerilen lüks ürün 1"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiOanM_9_HYSzUHWOntA87n39psphjRch4BKTNr9WBoR_QUmFjkpcm9YyvDO0GyuKAChTsROKCTWLLvx6U5aYjXF2Pm4tzrwhCWq-4qeLXJlYdsbqm83yN-rDks_tNxvw4Ee-uhsYgVyC3cvSlG6_-eaYdDAvikIihEBHIM4A1p3x8kehXZJSAJLk88a6HPCHCFWrVDtioL6x0IAatM_DKEP1oDEjp-UoCdcPfXxA8f0Yu6i9eJvl1mBT84lPOBDI17B75lBbVegze"
                            />
                        </div>
                        <div className="h-40 w-40 overflow-hidden rounded-xl bg-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className="h-full w-full object-cover"
                                alt="Önerilen lüks ürün 2"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2vEDYIOaQvbgyY7G8veCIiml-7Ds2Xc2ZrD58i0duSA81Az9V4mPjPzTQqS3lraqpI-heX9jtCfPHzz6jLPJdMeNINAMxkMhyQ06Q4QHX8-ACnN7uZbEFDLeE5xVVPtmqwOzMt0sVdtqyDaM8vs6XydvP09lmsITHRXr-vqbrKKj1kAtCGFfDCV9O68GpVIxZ5IFTNovqEYCPGB6oEHRwoxq2ICiex1wgAQwuhvOnv9Fzj9n0YonqzM-p2PSmY880yNq5sNQBygXa"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
