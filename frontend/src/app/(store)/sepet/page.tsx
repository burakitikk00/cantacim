"use client";

import Link from "next/link";

const CART_ITEMS = [
    { brand: "SAINT LAURENT", name: "Sac de Jour Nano Leather Bag", color: "Tan", size: "Nano", price: 84500, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV" },
    { brand: "GUCCI", name: "GG Marmont Small Shoulder Bag", color: "Siyah", size: "Small", price: 62200, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2" },
];

const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

export default function CartPage() {
    const subtotal = CART_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = 0;
    const total = subtotal + shipping;

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
                <div className="lg:col-span-2 space-y-0">
                    <div className="hidden md:grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-primary/40 border-b border-gray-100 pb-4 mb-4">
                        <div className="col-span-6">Ürün</div>
                        <div className="col-span-2 text-center">Adet</div>
                        <div className="col-span-2 text-center">Fiyat</div>
                        <div className="col-span-2 text-right">Toplam</div>
                    </div>
                    {CART_ITEMS.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 border-b border-gray-100">
                            <div className="col-span-6 flex gap-6 items-center">
                                <div className="w-28 h-36 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase">{item.brand}</p>
                                    <h3 className="text-sm font-semibold">{item.name}</h3>
                                    <p className="text-xs text-gray-400">Renk: {item.color} &middot; Beden: {item.size}</p>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 mt-2">
                                        <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>
                                        Kaldır
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center justify-center gap-3">
                                <button className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                                <button className="size-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                            <div className="col-span-2 text-center text-sm font-medium">₺{fmt(item.price)}</div>
                            <div className="col-span-2 text-right text-sm font-bold">₺{fmt(item.price * item.qty)}</div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-xl p-8 space-y-6 sticky top-28">
                        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-4">Sipariş Özeti</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Ara Toplam</span><span className="font-medium">₺{fmt(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Kargo</span><span className="font-medium text-green-600">Ücretsiz</span></div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                            <span className="font-bold">Toplam</span>
                            <span className="text-xl font-bold">₺{fmt(total)}</span>
                        </div>
                        {/* Coupon */}
                        <div className="flex gap-2">
                            <input className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="Kupon Kodu" />
                            <button className="bg-primary text-white px-6 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">Uygula</button>
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
