"use client";

import Link from "next/link";

export default function CheckoutPage() {
    return (
        <main className="max-w-[1200px] mx-auto px-6 py-28">
            {/* Logos */}
            <div className="flex justify-center mb-12">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="material-symbols-outlined text-3xl">diamond</span>
                    <span className="text-2xl font-bold tracking-tight uppercase">L&apos;Elite</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Forms */}
                <div className="lg:col-span-7 space-y-12">
                    {/* Section 1: Email */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">İletişim</h2>
                            <Link href="/auth/giris" className="text-sm underline text-primary/60 hover:text-primary">Giriş Yap</Link>
                        </div>
                        <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="E-posta adresi" />
                        <label className="flex items-center gap-3 mt-4">
                            <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary" />
                            <span className="text-sm text-primary/60">Haber ve tekliflerden haberdar ol</span>
                        </label>
                    </div>

                    {/* Section 2: Delivery */}
                    <div>
                        <h2 className="text-lg font-bold mb-6">Teslimat Adresi</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Ad" />
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Soyad" />
                            </div>
                            <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Adres" />
                            <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Apartman, daire vb. (isteğe bağlı)" />
                            <div className="grid grid-cols-3 gap-4">
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Posta Kodu" />
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Şehir" />
                                <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary">
                                    <option>Türkiye</option>
                                </select>
                            </div>
                            <input type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Telefon" />
                        </div>
                    </div>

                    {/* Section 3: Payment */}
                    <div>
                        <h2 className="text-lg font-bold mb-6">Ödeme</h2>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex gap-4 mb-6">
                                <button className="flex-1 bg-white border border-primary text-primary py-3 rounded-lg font-bold text-sm shadow-sm">Kredi Kartı</button>
                                <button className="flex-1 bg-transparent border border-gray-200 text-gray-500 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors">Havale/EFT</button>
                            </div>
                            <div className="space-y-4">
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Kart Numarası" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Ad Soyad" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="AA/YY" />
                                        <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="CVC" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link href="/siparis-onay" className="block w-full bg-primary text-white py-5 rounded-lg text-center font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
                                Ödemeyi Tamamla (₺146.700)
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-5 bg-gray-50 p-8 rounded-xl h-fit border border-gray-100">
                    <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                            <div className="size-16 bg-white rounded-lg border border-gray-200 relative">
                                <span className="absolute -top-2 -right-2 size-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="Product" className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">Sac de Jour Nano</h4>
                                <p className="text-xs text-primary/60">Tan / Nano</p>
                            </div>
                            <p className="text-sm font-bold">₺84.500</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-16 bg-white rounded-lg border border-gray-200 relative">
                                <span className="absolute -top-2 -right-2 size-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="Product" className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">GG Marmont Shoulder</h4>
                                <p className="text-xs text-primary/60">Siyah / Small</p>
                            </div>
                            <p className="text-sm font-bold">₺62.200</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-sm border-t border-gray-200 pt-6">
                        <div className="flex justify-between"><span className="text-primary/60">Ara Toplam</span><span className="font-medium">₺146.700</span></div>
                        <div className="flex justify-between"><span className="text-primary/60">Kargo</span><span className="text-green-600 font-medium">Ücretsiz</span></div>
                        <div className="flex justify-between pt-4 border-t border-gray-200">
                            <span className="font-bold text-lg">Toplam</span>
                            <span className="font-bold text-lg">₺146.700</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
