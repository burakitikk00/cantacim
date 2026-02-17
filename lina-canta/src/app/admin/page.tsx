"use client";

import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hesap Özeti</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dükkanınızın genel durumunu buradan takip edebilirsiniz.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Son Güncelleme: Şimdi</span>
                    <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <span className="material-icons text-sm">refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bugüne Kadarki Toplam Satış</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">33,400 TL</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-green-500">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        <span>+12% geçen aydan</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Sipariş</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">10</h3>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                </div>

                {/* Open Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Açık Sipariş</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">6</h3>
                    </div>
                    <div className="flex items-center text-xs font-medium text-orange-500">
                        <span className="material-icons text-sm mr-1">pending_actions</span>
                        <span>İşlem Bekliyor</span>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Son 30 Gün Satış</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">3,680 TL</h3>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">İadeler:</span>
                        <span className="text-sm font-bold text-red-500">0 TL</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Satış Hacmi</h2>
                    <select className="mt-4 sm:mt-0 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#FF007F] focus:border-[#FF007F] sm:text-sm rounded-md">
                        <option>Son 7 Gün</option>
                        <option defaultValue="selected">Geçen Ay</option>
                        <option>Bu Yıl</option>
                    </select>
                </div>
                <div className="relative h-64 w-full bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                    {/* Chart Placeholder */}
                    Grafik Alanı (Chart.js entegrasyonu yapılacak)
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">En Çok Satan Ürünler</h2>
                        <Link href="/admin/urunler" className="text-sm text-[#FF007F] hover:text-[#D6006B] font-medium">Tümünü Gör</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Ürün Adı</th>
                                    <th className="px-6 py-3 font-medium text-right">Fiyat</th>
                                    <th className="px-6 py-3 font-medium text-right">Satış Adedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img alt="Coach" className="w-full h-full object-cover opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWkYNZTXDSMUJZste_RUGTXE_eNGk1-e-RZgvIfr2G0_Oszf_NZDotET0eB3Na5B5VKaF0VjY4sjbhFm4_FObfU968z0IT1_ijc67QlWQkdWIWVxgOeOmg7Z5w8jQyMroGWkrwlZggIdii1nSWC9vhK3iQiPTpJME6bIjNcMeHb1OAYeC06UG2cF_6dF2Nrn4cNJCkOv0yNKVPQDZprKdZJnFhUuSWet-xKGbzs0_aO55oAMcex7TO9954atJxRYZN-GfQe3k1P3cl" />
                                        </div>
                                        Coach El ve Omuz Çantası
                                    </td>
                                    <td className="px-6 py-4 text-right">₺4,480.00</td>
                                    <td className="px-6 py-4 text-right font-semibold text-[#FF007F]">12</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img alt="Versace" className="w-full h-full object-cover opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-dt8Aavkwzw5kXpmQ0WTv5H6k14yC5JgJydPYHirb_gcU0ZyJ9pXMW5UYO-LztnM8tmbKpGXGIbmpXbylOn5Tsw40x1MiuAWTR9CfSEE5M85pLHkEGaMIAZOXUFxNSx50FYVYptItRL0NCwo6AUMYCDGixhrS5DG18j0KHlZVaJXTduUBS8rA0pJkkgxssHpDNCBQpGBGkN5ob5Nu_EcfoQZoU6MLXaP0CBYDtXlLI8PcKmFaYXdmsyKuiaLquRaT9NDDZCwGnnVZ" />
                                        </div>
                                        Versace Güneş Gözlüğü
                                    </td>
                                    <td className="px-6 py-4 text-right">₺3,830.00</td>
                                    <td className="px-6 py-4 text-right font-semibold text-[#FF007F]">8</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img alt="Miu Miu" className="w-full h-full object-cover opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFkjNeTxXySPiQs35cnGZ66BcMoMLvWe710u51s2zOGz3vb7obnLMDrkGbQVUmTpCjeI0wksSTj03FchsJczAsaVTPXPp6MMpi6pXBaXJMIvKGG5NTqfqva67U_92f-giJS-fte1tQFcdUm4DjvFTi65_ep2-FLxUS5Xqw9NQjtHMWzRD6JqA7qKi71BC6kIAAhaOtshZ5VTBAYzDbEWdq9nlWPkrZuiKtntF8NKquU2fhUCEkAu--lwfsiz43ztRTxUusslsEaXZN" />
                                        </div>
                                        Miu Miu Güneş Gözlüğü
                                    </td>
                                    <td className="px-6 py-4 text-right">₺3,130.00</td>
                                    <td className="px-6 py-4 text-right font-semibold text-[#FF007F]">5</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Son İşlemler</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <span className="material-icons text-xl">shopping_cart</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Yeni Sipariş <span className="text-[#FF007F]">#1234</span></p>
                                <p className="text-xs text-gray-500 mt-1">2 dakika önce • ₺4,480.00</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <span className="material-icons text-xl">person_add</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Yeni Üye Kaydı</p>
                                <p className="text-xs text-gray-500 mt-1">15 dakika önce • Ayşe Yılmaz</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <span className="material-icons text-xl">inventory_2</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Stok Uyarısı</p>
                                <p className="text-xs text-gray-500 mt-1">1 saat önce • Coach Çanta (2 kaldı)</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button className="w-full text-center text-sm font-medium text-[#FF007F] hover:text-[#D6006B] transition-colors">
                            Tüm Bildirimleri Gör
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
