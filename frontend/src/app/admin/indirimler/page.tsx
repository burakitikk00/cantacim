"use client";

import { useState } from "react";

// Mock Data
const DISCOUNTS = [
    { id: 1, name: "LİNA EFSANE KASIM", method: "Otomatik İndirim", type: "Yüzdesel İndirim", period: "21/11/2025 - 30/11/2025", usage: 55, status: "Aktif" },
    { id: 2, name: "Hoşgeldin200", method: "İndirim Kodu", type: "Sabit Tutar İndirimi", period: "01/01/2025 - 31/12/2025", usage: 12, status: "Aktif" },
    { id: 3, name: "3AL2ODE", method: "Otomatik İndirim", type: "3 Al 2 Öde", period: "10/10/2025 - 20/10/2025", usage: 120, status: "Pasif" },
];

const CATEGORIES = [
    { id: "c1", name: "Çantalar" },
    { id: "c2", name: "Cüzdanlar" },
    { id: "c3", name: "Gözlükler" },
    { id: "c4", name: "Ayakkabılar" },
    { id: "c5", name: "Aksesuarlar" },
];

const PRODUCTS = [
    { id: "p1", name: "Coach El ve Omuz Çantası", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWkYNZTXDSMUJZste_RUGTXE_eNGk1-e-RZgvIfr2G0_Oszf_NZDotET0eB3Na5B5VKaF0VjY4sjbhFm4_FObfU968z0IT1_ijc67QlWQkdWIWVxgOeOmg7Z5w8jQyMroGWkrwlZggIdii1nSWC9vhK3iQiPTpJME6bIjNcMeHb1OAYeC06UG2cF_6dF2Nrn4cNJCkOv0yNKVPQDZprKdZJnFhUuSWet-xKGbzs0_aO55oAMcex7TO9954atJxRYZN-GfQe3k1P3cl", price: "4,480 TL" },
    { id: "p2", name: "Versace Güneş Gözlüğü", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-dt8Aavkwzw5kXpmQ0WTv5H6k14yC5JgJydPYHirb_gcU0ZyJ9pXMW5UYO-LztnM8tmbKpGXGIbmpXbylOn5Tsw40x1MiuAWTR9CfSEE5M85pLHkEGaMIAZOXUFxNSx50FYVYptItRL0NCwo6AUMYCDGixhrS5DG18j0KHlZVaJXTduUBS8rA0pJkkgxssHpDNCBQpGBGkN5ob5Nu_EcfoQZoU6MLXaP0CBYDtXlLI8PcKmFaYXdmsyKuiaLquRaT9NDDZCwGnnVZ", price: "3,830 TL" },
    { id: "p3", name: "Miu Miu Güneş Gözlüğü", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFkjNeTxXySPiQs35cnGZ66BcMoMLvWe710u51s2zOGz3vb7obnLMDrkGbQVUmTpCjeI0wksSTj03FchsJczAsaVTPXPp6MMpi6pXBaXJMIvKGG5NTqfqva67U_92f-giJS-fte1tQFcdUm4DjvFTi65_ep2-FLxUS5Xqw9NQjtHMWzRD6JqA7qKi71BC6kIAAhaOtshZ5VTBAYzDbEWdq9nlWPkrZuiKtntF8NKquU2fhUCEkAu--lwfsiz43ztRTxUusslsEaXZN", price: "3,130 TL" },
    { id: "p4", name: "Saint Laurent Çanta", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2", price: "5,200 TL" },
    { id: "p5", name: "Gucci Cüzdan", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbGV0fGVufDB8fDB8fHww", price: "2,100 TL" },
];

export default function DiscountsPage() {
    // Form State
    const [method, setMethod] = useState("Otomatik İndirim");
    const [type, setType] = useState("Yüzdesel İndirim");
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [minRequirement, setMinRequirement] = useState("Yok");
    const [minReqValue, setMinReqValue] = useState("");
    const [scope, setScope] = useState("Tüm Ürünler");
    const [isActive, setIsActive] = useState(true);

    // Selection States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // Logic Variables
    const typeOptions = method === "İndirim Kodu"
        ? ["Yüzdesel İndirim", "Sabit Tutar İndirimi", "Ücretsiz Kargo"]
        : ["Yüzdesel İndirim", "Sabit Tutar İndirimi", "3 Al 2 Öde", "X Alana Y %50 İndirimli"];

    const showCodeInput = method === "İndirim Kodu";
    const showAmountInput = type === "Yüzdesel İndirim" || type === "Sabit Tutar İndirimi";
    const showMinReqValue = minRequirement !== "Yok";

    const showCategorySelection = scope === "Belirli Kategoriler" || scope === "Belirli Kategori ve Ürünler";
    const showProductSelection = scope === "Belirli Ürünler" || scope === "Belirli Kategori ve Ürünler";

    const filteredProducts = PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    const toggleCategory = (id: string) => {
        if (selectedCategories.includes(id)) setSelectedCategories(selectedCategories.filter(c => c !== id));
        else setSelectedCategories([...selectedCategories, id]);
    };

    const toggleProduct = (id: string) => {
        if (selectedProducts.includes(id)) setSelectedProducts(selectedProducts.filter(p => p !== id));
        else setSelectedProducts([...selectedProducts, id]);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">İndirimler</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Kampanya ve indirim kuponlarını buradan yönetebilirsiniz.</p>
                </div>
            </div>

            {/* Main Grid: Form + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Definition Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <h2 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-4">İndirim Tanımla</h2>

                        {/* Method & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Yöntemi</label>
                                <select
                                    value={method}
                                    onChange={(e) => { setMethod(e.target.value); setType(typeOptions[0]); }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                >
                                    <option>Otomatik İndirim</option>
                                    <option>İndirim Kodu</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {method === "Otomatik İndirim" ? "Müşterilerin sepetine otomatik uygulanır." : "Müşteriler ödeme ekranında kodu girmelidir."}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Tipi</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                >
                                    {typeOptions.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Conditional Inputs */}
                        {showCodeInput && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Kodu</label>
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono uppercase tracking-wider focus:ring-[#FF007F] focus:border-[#FF007F]"
                                    placeholder="Örn: YAZ2024"
                                />
                                <button type="button" onClick={() => setCode("CODE-" + Math.random().toString(36).substring(7).toUpperCase())} className="text-xs text-[#FF007F] mt-2 font-medium hover:underline">
                                    Rastgele Kod Oluştur
                                </button>
                            </div>
                        )}

                        {/* Amount & Value */}
                        {showAmountInput && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Değeri</label>
                                <div className="relative">
                                    <input
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        type="number"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                        placeholder={type === "Yüzdesel İndirim" ? "Örn: 20" : "Örn: 100"}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold sm:text-sm">
                                            {type === "Yüzdesel İndirim" ? "%" : "TL"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scope */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Uygulanacak Ürünler</label>
                            <select
                                value={scope}
                                onChange={(e) => {
                                    setScope(e.target.value);
                                    setSelectedCategories([]);
                                    setSelectedProducts([]);
                                }}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                            >
                                <option>Tüm Ürünler</option>
                                <option>Belirli Kategoriler</option>
                                <option>Belirli Ürünler</option>
                                <option>Belirli Kategori ve Ürünler</option>
                            </select>
                        </div>

                        {/* Category Selection UI */}
                        {showCategorySelection && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Kategorileri Seçin</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`cursor-pointer px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-between ${selectedCategories.includes(cat.id)
                                                    ? "bg-[#FF007F] text-white border-[#FF007F]"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#FF007F]"
                                                }`}
                                        >
                                            {cat.name}
                                            {selectedCategories.includes(cat.id) && <span className="material-icons text-sm">check</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Selection UI */}
                        {showProductSelection && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Ürünleri Seçin</label>

                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Ürün ara..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                    />
                                </div>

                                {/* Searchable List */}
                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-4 ${selectedProducts.includes(product.id)
                                                    ? "bg-white border-[#FF007F] ring-1 ring-[#FF007F]"
                                                    : "bg-white border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedProducts.includes(product.id) ? "bg-[#FF007F] border-[#FF007F]" : "border-gray-300"}`}>
                                                {selectedProducts.includes(product.id) && <span className="material-icons text-white text-xs">check</span>}
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">Ürün bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Minimum Requirements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Koşul</label>
                                <select
                                    value={minRequirement}
                                    onChange={(e) => setMinRequirement(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                >
                                    <option>Yok</option>
                                    <option>Minimum Alışveriş Tutarı</option>
                                    <option>Minimum Ürün Adedi</option>
                                </select>
                            </div>
                            {showMinReqValue && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Koşul Değeri</label>
                                    <input
                                        value={minReqValue}
                                        onChange={(e) => setMinReqValue(e.target.value)}
                                        type="number"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                        placeholder={minRequirement === "Minimum Alışveriş Tutarı" ? "TL Tutar" : "Adet"}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Dates & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Başlangıç Tarihi</label>
                                <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bitiş Tarihi</label>
                                <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-3">
                                <div className={`relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in`}>
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="status"
                                        checked={isActive}
                                        onChange={() => setIsActive(!isActive)}
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-[#FF007F]"
                                    />
                                    <label htmlFor="status" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isActive ? "bg-[#FF007F]" : "bg-gray-300"}`}></label>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{isActive ? "Aktif" : "Pasif"}</span>
                            </div>

                            <button className="bg-[#FF007F] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#D6006B] transition-colors shadow-lg shadow-pink-200">
                                İNDİRİM TANIMLA
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Summary Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-4 mb-4">İNDİRİM DETAYI</h2>
                        <div className="space-y-4 text-sm">
                            {showCodeInput && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kod</span>
                                    <span className="font-mono font-bold text-lg text-[#FF007F] bg-[#FF007F]/10 px-2 py-1 rounded">{code || "..."}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Yöntem / Tip</span>
                                <div className="font-medium text-gray-800">{method}</div>
                                <div className="text-gray-600">{type}</div>
                            </div>
                            {showAmountInput && amount && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Değer</span>
                                    <div className="font-bold text-xl text-gray-900">
                                        {type === "Yüzdesel İndirim" ? `%${amount}` : `₺${amount}`}
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kapsam</span>
                                <div className="text-gray-800">{scope}</div>
                                {showCategorySelection && selectedCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedCategories.map(cid => (
                                            <span key={cid} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {CATEGORIES.find(c => c.id === cid)?.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {showProductSelection && selectedProducts.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {selectedProducts.length} ürün seçildi
                                    </div>
                                )}
                            </div>
                            {showMinReqValue && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Koşul</span>
                                    <div className="text-gray-800">
                                        {minRequirement === "Minimum Alışveriş Tutarı" ? `Minimum ${minReqValue} TL` : `Minimum ${minReqValue} Adet`}
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="material-icons text-sm">info</span>
                                    Bu indirim diğer kampanyalarla birleştirilemez.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Discounts Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mt-12">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#111827]">MEVCUT İNDİRİMLER</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#FF007F] text-white">Tümü</button>
                        <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">Aktif</button>
                        <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">Pasif</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">İndirim Adı</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3">Yöntem</th>
                                <th className="px-6 py-3">Tip</th>
                                <th className="px-6 py-3">Dönem</th>
                                <th className="px-6 py-3">Kullanılan</th>
                                <th className="px-6 py-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {DISCOUNTS.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#111827]">{d.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{d.method}</td>
                                    <td className="px-6 py-4 text-gray-600">{d.type}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{d.period}</td>
                                    <td className="px-6 py-4 text-gray-600">{d.usage} Adet</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1.5 bg-[#FF007F] text-white text-xs font-bold rounded hover:bg-[#D6006B] transition-colors">
                                            İŞLEMLER
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
        .toggle-checkbox:checked {
            right: 0;
            border-color: #FF007F;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #FF007F;
        }
        .toggle-checkbox {
            right: auto;
            left: 0;
            transition: all 0.3s;
        }
        .toggle-label {
            width: 3rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ccc;
        }
      `}</style>
        </div>
    );
}
