"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductTable from "./ProductTable";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    getAllProductIds,
    bulkUpdateStock,
    bulkUpdateStatus,
    bulkApplyDiscount,
    bulkPriceIncreasePercent,
    bulkPriceIncreaseFlat,
    bulkDeleteProducts,
} from "./actions";

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

interface ProductManagementUIProps {
    products: any[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    categories?: Category[];
    brands?: Brand[];
}

function CustomSelect({
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
}: {
    options: { label: string; value: string }[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative min-w-0" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full rounded-xl border border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 px-4 text-sm bg-zinc-50/50 text-left flex items-center justify-between transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`block truncate ${!value ? "text-zinc-500" : "text-zinc-700"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span
                    className="material-symbols-outlined text-zinc-400 text-xl flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                >
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <ul className="max-h-[30vh] md:max-h-52 overflow-y-auto overscroll-contain py-1">
                        {options.map((opt) => (
                            <li key={opt.value}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors ${value === opt.value ? 'bg-[#FF007F]/5 text-[#FF007F] font-bold' : 'text-zinc-700'}`}
                                >
                                    {opt.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function ProductManagementUI({
    products,
    currentPage,
    totalPages,
    totalCount,
    categories = [],
    brands = [],
}: ProductManagementUIProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectingAll, setIsSelectingAll] = useState(false);
    const [activeTab, setActiveTab] = useState<"filter" | "sort" | "bulk" | null>(null);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    // Filter states — initialize from URL params
    const [dateStart, setDateStart] = useState(searchParams.get("dateStart") || "");
    const [dateEnd, setDateEnd] = useState(searchParams.get("dateEnd") || "");
    const [shippingType, setShippingType] = useState("");
    const [stockMin, setStockMin] = useState(searchParams.get("stockMin") || "");
    const [stockMax, setStockMax] = useState(searchParams.get("stockMax") || "");
    const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
    const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
    const [categoriesSelected, setCategoriesSelected] = useState<string[]>(
        searchParams.get("categories")?.split(",").filter(Boolean) || []
    );
    const [brandsSelected, setBrandsSelected] = useState<string[]>(
        searchParams.get("brands")?.split(",").filter(Boolean) || []
    );
    const [discountOnly, setDiscountOnly] = useState(searchParams.get("discountOnly") === "true");
    const [hiddenOnly, setHiddenOnly] = useState(searchParams.get("hiddenOnly") === "true");

    // Sort states — initialize from URL params
    const [sortCategory, setSortCategory] = useState(searchParams.get("sortBy") || "date");
    const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
    const [itemsPerPage, setItemsPerPage] = useState(searchParams.get("pageSize") || "25");

    // Bulk states
    const [bulkShipping, setBulkShipping] = useState("");
    const [bulkShippingPrice, setBulkShippingPrice] = useState("0");
    const [bulkStock, setBulkStock] = useState("0");
    const [bulkDiscount, setBulkDiscount] = useState("");
    const [cancelDiscounts, setCancelDiscounts] = useState(false);
    const [priceIncreasePct, setPriceIncreasePct] = useState("");
    const [priceIncreaseFlat, setPriceIncreaseFlat] = useState("");
    const [bulkActiveStatus, setBulkActiveStatus] = useState("true");
    const [isDeleteWarningModalOpen, setIsDeleteWarningModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

    // Notification
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [notificationType, setNotificationType] = useState<"success" | "error">("success");

    // Check if any filter is actively applied via URL
    const hasActiveFilters = !!(
        searchParams.get("dateStart") || searchParams.get("dateEnd") ||
        searchParams.get("stockMin") || searchParams.get("stockMax") ||
        searchParams.get("priceMin") || searchParams.get("priceMax") ||
        searchParams.get("categories") || searchParams.get("brands") ||
        searchParams.get("discountOnly") || searchParams.get("hiddenOnly")
    );

    // Build current filter object for getAllProductIds
    const getCurrentFilters = useCallback(() => {
        if (!hasActiveFilters) return null;
        return {
            dateStart: searchParams.get("dateStart") || undefined,
            dateEnd: searchParams.get("dateEnd") || undefined,
            stockMin: searchParams.get("stockMin") || undefined,
            stockMax: searchParams.get("stockMax") || undefined,
            priceMin: searchParams.get("priceMin") || undefined,
            priceMax: searchParams.get("priceMax") || undefined,
            categoriesSelected: searchParams.get("categories")?.split(",").filter(Boolean) || [],
            brandsSelected: searchParams.get("brands")?.split(",").filter(Boolean) || [],
            discountOnly: searchParams.get("discountOnly") === "true",
            hiddenOnly: searchParams.get("hiddenOnly") === "true",
        };
    }, [hasActiveFilters, searchParams]);

    const showNotification = (message: string, type: "success" | "error" = "success") => {
        setNotificationMessage(message);
        setNotificationType(type);
    };

    // ─── SELECTION ──────────────────────────────────────────

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(productId => productId !== id));
        }
    };

    const handleSelectCurrentPage = (checked: boolean) => {
        if (checked) {
            const pageIds = products.map(p => p.id);
            const newIds = Array.from(new Set([...selectedIds, ...pageIds]));
            setSelectedIds(newIds);
        } else {
            const pageIds = new Set(products.map(p => p.id));
            setSelectedIds(selectedIds.filter(id => !pageIds.has(id)));
        }
    };

    const handleSelectAllAcrossPages = async (checked: boolean) => {
        if (checked) {
            setIsSelectingAll(true);
            const filters = getCurrentFilters();
            const allIds = await getAllProductIds(filters);
            setSelectedIds(allIds);
            setIsSelectingAll(false);
        } else {
            setSelectedIds([]);
        }
    };

    // ─── FILTER TOGGLE ──────────────────────────────────────

    const handleCategoryToggle = (cat: string) => {
        setCategoriesSelected(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleBrandToggle = (brandName: string) => {
        setBrandsSelected(prev =>
            prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
        );
    };

    // ─── APPLY FILTERS (URL push) ───────────────────────────

    const applyFilters = () => {
        const params = new URLSearchParams();

        // Preserve sort params
        const existingSortBy = searchParams.get("sortBy");
        const existingSortOrder = searchParams.get("sortOrder");
        const existingPageSize = searchParams.get("pageSize");
        if (existingSortBy) params.set("sortBy", existingSortBy);
        if (existingSortOrder) params.set("sortOrder", existingSortOrder);
        if (existingPageSize) params.set("pageSize", existingPageSize);

        // Add filter params
        if (dateStart) params.set("dateStart", dateStart);
        if (dateEnd) params.set("dateEnd", dateEnd);
        if (stockMin) params.set("stockMin", stockMin);
        if (stockMax) params.set("stockMax", stockMax);
        if (priceMin) params.set("priceMin", priceMin);
        if (priceMax) params.set("priceMax", priceMax);
        if (categoriesSelected.length > 0) params.set("categories", categoriesSelected.join(","));
        if (brandsSelected.length > 0) params.set("brands", brandsSelected.join(","));
        if (discountOnly) params.set("discountOnly", "true");
        if (hiddenOnly) params.set("hiddenOnly", "true");

        // Reset to page 1
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
        setSelectedIds([]);
        setActiveTab(null);
    };

    const clearFilters = () => {
        setDateStart(""); setDateEnd(""); setShippingType(""); setStockMin(""); setStockMax("");
        setPriceMin(""); setPriceMax(""); setCategoriesSelected([]); setBrandsSelected([]); setDiscountOnly(false); setHiddenOnly(false);

        // Keep sort params, remove filter params
        const params = new URLSearchParams();
        const existingSortBy = searchParams.get("sortBy");
        const existingSortOrder = searchParams.get("sortOrder");
        const existingPageSize = searchParams.get("pageSize");
        if (existingSortBy) params.set("sortBy", existingSortBy);
        if (existingSortOrder) params.set("sortOrder", existingSortOrder);
        if (existingPageSize) params.set("pageSize", existingPageSize);

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
        setSelectedIds([]);
        setActiveTab(null);
    };

    // ─── APPLY SORT (URL push) ──────────────────────────────

    const applySort = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sortBy", sortCategory);
        params.set("sortOrder", sortOrder);
        params.set("pageSize", itemsPerPage);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
        setActiveTab(null);
    };

    const clearSort = () => {
        setSortCategory("date");
        setSortOrder("desc");
        setItemsPerPage("25");

        const params = new URLSearchParams(searchParams.toString());
        params.delete("sortBy");
        params.delete("sortOrder");
        params.delete("pageSize");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
        setActiveTab(null);
    };

    // ─── BULK ACTIONS ───────────────────────────────────────

    const executeBulkAction = async (
        actionFn: () => Promise<{ success: boolean; error?: string; count?: number }>,
        successMsg: string
    ) => {
        if (selectedIds.length === 0) {
            showNotification("Ürün seçilmedi.", "error");
            return;
        }

        setIsBulkLoading(true);
        try {
            const result = await actionFn();
            if (result.success) {
                showNotification(`${successMsg} (${result.count || selectedIds.length} ürün etkilendi)`, "success");
                setSelectedIds([]);
                router.refresh();
            } else {
                showNotification(result.error || "Bir hata oluştu.", "error");
            }
        } catch (err) {
            showNotification("Beklenmeyen bir hata oluştu.", "error");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleBulkStock = () => {
        executeBulkAction(
            () => bulkUpdateStock(selectedIds, Number(bulkStock)),
            "Stok başarıyla güncellendi"
        );
    };

    const handleBulkStatus = () => {
        executeBulkAction(
            () => bulkUpdateStatus(selectedIds, bulkActiveStatus === "true"),
            bulkActiveStatus === "true" ? "Ürünler aktif yapıldı" : "Ürünler pasife alındı"
        );
    };

    const handleBulkDiscount = () => {
        const pct = Number(bulkDiscount);
        if (!pct && !cancelDiscounts) {
            showNotification("Lütfen bir indirim oranı girin veya mevcut indirimleri iptal edin.", "error");
            return;
        }
        executeBulkAction(
            () => bulkApplyDiscount(selectedIds, pct, cancelDiscounts),
            cancelDiscounts && !pct ? "Mevcut indirimler iptal edildi" : `%${pct} indirim uygulandı`
        );
    };

    const handleBulkPriceIncreasePct = () => {
        const pct = Number(priceIncreasePct);
        if (!pct) {
            showNotification("Lütfen geçerli bir yüzde girin.", "error");
            return;
        }
        executeBulkAction(
            () => bulkPriceIncreasePercent(selectedIds, pct),
            `%${pct} fiyat artırımı uygulandı`
        );
    };

    const handleBulkPriceIncreaseFlat = () => {
        const amount = Number(priceIncreaseFlat);
        if (!amount) {
            showNotification("Lütfen geçerli bir tutar girin.", "error");
            return;
        }
        executeBulkAction(
            () => bulkPriceIncreaseFlat(selectedIds, amount),
            `₺${amount} fiyat artırımı uygulandı`
        );
    };

    const handleBulkDelete = () => {
        executeBulkAction(
            () => bulkDeleteProducts(selectedIds),
            "Seçili ürünler silindi"
        );
    };

    return (
        <div className="space-y-4">
            {/* Active Filter Badge */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FF007F]/5 border border-[#FF007F]/20 rounded-xl">
                    <span className="material-icons text-[#FF007F] text-[18px]">filter_alt</span>
                    <span className="text-sm text-[#FF007F] font-medium">Filtre aktif — {totalCount} ürün gösteriliyor</span>
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-[#FF007F] font-bold hover:underline"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            )}

            {/* Topbar / Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab(activeTab === "filter" ? null : "filter")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'filter' ? 'bg-[#FF007F]/5 text-[#FF007F] border-b-2 border-[#FF007F]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="material-icons text-[18px]">filter_alt</span>
                        FİLTRELEME
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-[#FF007F] animate-pulse"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === "sort" ? null : "sort")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-l border-gray-100 ${activeTab === 'sort' ? 'bg-[#FF007F]/5 text-[#FF007F] border-b-2 border-[#FF007F]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="material-icons text-[18px]">sort</span>
                        SIRALAMA
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === "bulk" ? null : "bulk")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-l border-gray-100 ${activeTab === 'bulk' ? 'bg-[#FF007F]/5 text-[#FF007F] border-b-2 border-[#FF007F]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="material-icons text-[18px]">library_add_check</span>
                        TOPLU İŞLEMLER
                        {selectedIds.length > 0 && (
                            <span className="bg-[#FF007F] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                {selectedIds.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Contents */}
                <div className={`transition-all duration-300 ease-in-out ${activeTab ? 'opacity-100' : 'hidden opacity-0'}`}>

                    {/* FİLTRELEME İÇERİĞİ */}
                    {activeTab === "filter" && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/30">
                            {/* Listing Date */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">LİSTELEME TARİHİNE GÖRE FİLTRELE</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 mb-1 ml-1">Başlangıç</div>
                                        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 px-4 text-sm bg-zinc-50/50 text-zinc-700 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 mb-1 ml-1">Bitiş</div>
                                        <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 px-4 text-sm bg-zinc-50/50 text-zinc-700 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Type — disabled because no shippingType field in schema */}
                            <div className="flex flex-col gap-2 opacity-40">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">KARGO TİPİNE GÖRE FİLTRELE</label>
                                <div className="space-y-3 mt-1 pl-1">
                                    {['Teslimatta Ödeme', 'Sepette Ödeme', 'Ücretsiz Kargo'].map((type) => (
                                        <label key={type} className="flex items-center gap-3 text-sm text-zinc-600 cursor-not-allowed transition-colors">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="radio"
                                                    name="shipping_filter"
                                                    value={type}
                                                    disabled
                                                    checked={shippingType === type}
                                                    onChange={e => setShippingType(e.target.value)}
                                                    className="peer h-5 w-5 appearance-none rounded-full border-2 border-zinc-200 bg-white transition-all opacity-50"
                                                />
                                            </div>
                                            {type}
                                        </label>
                                    ))}
                                    <p className="text-[10px] text-zinc-400 italic">Kargo tipi alanı henüz tanımlı değil.</p>
                                </div>
                            </div>

                            {/* Stock Quantity */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">STOK ADEDİNE GÖRE FİLTRELE</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 ml-1">En Düşük</div>
                                        <input type="number" value={stockMin} onChange={e => setStockMin(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 px-4 text-sm bg-zinc-50/50 placeholder:text-zinc-300 transition-colors" placeholder="0" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 ml-1">En Yüksek</div>
                                        <input type="number" value={stockMax} onChange={e => setStockMax(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 px-4 text-sm bg-zinc-50/50 placeholder:text-zinc-300 transition-colors" placeholder="100" />
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">ÜRÜN FİYATINA GÖRE FİLTRELE</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 ml-1">En Düşük</div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₺</span>
                                            <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 pl-8 pr-4 text-sm bg-zinc-50/50 placeholder:text-zinc-300 transition-colors" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400/80 ml-1">En Yüksek</div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">₺</span>
                                            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full rounded-xl border-zinc-200 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] py-3 pl-8 pr-4 text-sm bg-zinc-50/50 placeholder:text-zinc-300 transition-colors" placeholder="1000.00" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Multi-Select — dynamic from DB */}
                            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">ÜRÜN KATEGORİSİNE GÖRE FİLTRELE</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {categories.length > 0 ? categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryToggle(cat.name)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${categoriesSelected.includes(cat.name) ? 'bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    )) : (
                                        <p className="text-xs text-zinc-400 italic">Henüz kategori yok.</p>
                                    )}
                                </div>
                            </div>

                            {/* Brand Multi-Select — dynamic from DB */}
                            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">MARKAYA GÖRE FİLTRELE</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {brands.length > 0 ? brands.map((brand) => (
                                        <button
                                            key={brand.id}
                                            onClick={() => handleBrandToggle(brand.name)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${brandsSelected.includes(brand.name) ? 'bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                                        >
                                            {brand.name}
                                        </button>
                                    )) : (
                                        <p className="text-xs text-zinc-400 italic">Henüz marka yok.</p>
                                    )}
                                </div>
                            </div>

                            {/* Other Options */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">DİĞER FİLTRELEME SEÇENEKLERİ</label>
                                <div className="space-y-3 mt-1 pl-1">
                                    <label className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer hover:text-[#FF007F] transition-colors">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={discountOnly} onChange={e => setDiscountOnly(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-200 bg-zinc-50 checked:bg-[#FF007F] checked:border-[#FF007F] transition-all" />
                                            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            </span>
                                        </div>
                                        İNDİRİMDEKİ ÜRÜNLER
                                    </label>
                                    <label className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer hover:text-[#FF007F] transition-colors">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={hiddenOnly} onChange={e => setHiddenOnly(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-200 bg-zinc-50 checked:bg-[#FF007F] checked:border-[#FF007F] transition-all" />
                                            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            </span>
                                        </div>
                                        DÜKKANDA GÖRÜNMEYENLER
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-zinc-100 mt-2">
                                <button onClick={clearFilters} className="px-6 py-3 text-sm font-semibold text-zinc-500 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                                    Temizle
                                </button>
                                <button onClick={applyFilters} className="px-8 py-3 text-sm font-bold tracking-wide text-white bg-[#FF007F] rounded-xl hover:bg-[#D6006B] transition-colors shadow-sm">
                                    Filtrele
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SIRALAMA İÇERİĞİ */}
                    {activeTab === "sort" && (
                        <div className="p-6 bg-zinc-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">SIRALANACAK ALAN</label>
                                    <CustomSelect
                                        value={sortCategory}
                                        onChange={setSortCategory}
                                        placeholder="Alan Seçin"
                                        options={[
                                            { label: "Listeleme Tarihi", value: "date" },
                                            { label: "Ürün Fiyatı", value: "price" },
                                            { label: "Ürün Adı", value: "name" },
                                        ]}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">SIRALAMA YÖNÜ</label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer hover:text-[#FF007F] transition-colors">
                                            <div className="relative flex items-center">
                                                <input type="radio" name="sort_order" checked={sortOrder === "asc"} onChange={() => setSortOrder("asc")} className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-zinc-200 bg-white checked:border-[6px] checked:border-[#FF007F] transition-all" />
                                            </div>
                                            Artan
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer hover:text-[#FF007F] transition-colors">
                                            <div className="relative flex items-center">
                                                <input type="radio" name="sort_order" checked={sortOrder === "desc"} onChange={() => setSortOrder("desc")} className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-zinc-200 bg-white checked:border-[6px] checked:border-[#FF007F] transition-all" />
                                            </div>
                                            Azalan
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">SAYFADA GÖSTERİLEN ÜRÜN</label>
                                    <CustomSelect
                                        value={itemsPerPage}
                                        onChange={setItemsPerPage}
                                        placeholder="Adet Seçin"
                                        options={[
                                            { label: "25", value: "25" },
                                            { label: "50", value: "50" },
                                            { label: "100", value: "100" },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-100">
                                <button
                                    onClick={clearSort}
                                    className="px-6 py-3 text-sm font-semibold text-zinc-500 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                                >
                                    Temizle
                                </button>
                                <button onClick={applySort} className="px-8 py-3 text-sm font-bold tracking-wide text-white bg-[#FF007F] rounded-xl hover:bg-[#D6006B] transition-colors shadow-sm">
                                    Sırala
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TOPLU İŞLEMLER İÇERİĞİ */}
                    {activeTab === "bulk" && (
                        <div className="p-6 bg-gray-50/30">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-1">TOPLU ÜRÜN GÜNCELLEME</h3>
                                    <p className="text-xs text-gray-500">Seçtiğiniz ürünleri toplu şekilde güncellemek için bu menüyü kullanabilirsiniz.</p>
                                    {hasActiveFilters && (
                                        <p className="text-xs text-[#FF007F] mt-1 font-medium">
                                            <span className="material-icons text-[12px] align-middle mr-1">info</span>
                                            Filtre aktif — &quot;Tümünü Seç&quot; yalnızca filtrelenmiş ürünleri seçer.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleSelectAllAcrossPages(selectedIds.length !== totalCount || totalCount === 0)}
                                    disabled={isSelectingAll || isBulkLoading}
                                    className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    {isSelectingAll ? (
                                        <span className="material-icons text-[16px] animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-icons text-[16px]">{selectedIds.length === totalCount && totalCount > 0 ? "deselect" : "select_all"}</span>
                                    )}
                                    {isSelectingAll ? "Seçiliyor..." : selectedIds.length === totalCount && totalCount > 0 ? "Tüm Seçimi Kaldır" : `Tümünü Seç (${totalCount})`}
                                </button>
                            </div>

                            {selectedIds.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                                    <span className="material-icons text-4xl text-gray-300 mb-3">checklist</span>
                                    <p className="text-sm font-medium text-gray-500">Toplu güncelleme yapmak için henüz seçilen bir ürün bulunmuyor.</p>
                                    <p className="text-xs text-gray-400 mt-1">Aşağıdaki listeden ürünleri seçerek işlemlere başlayabilirsiniz.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {/* Kargo — disabled */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4 opacity-40">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">KARGO TİPİ VE ÜCRETİ GÜNCELLE</label>
                                        <div className="space-y-3 mt-auto">
                                            {['Teslimatta Ödeme', 'Sepette Ödeme', 'Ücretsiz Kargo'].map((type) => (
                                                <label key={`bulk_${type}`} className="flex items-center gap-2 text-xs text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="bulk_shipping"
                                                        value={type}
                                                        disabled
                                                        checked={bulkShipping === type}
                                                        onChange={e => setBulkShipping(e.target.value)}
                                                        className="text-[#FF007F] focus:ring-[#FF007F] border-gray-300"
                                                    /> {type}
                                                </label>
                                            ))}
                                            <p className="text-[10px] text-gray-400 italic">Kargo tipi alanı henüz tanımlı değil.</p>
                                        </div>
                                    </div>

                                    {/* Stok */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">STOK ADEDİ GÜNCELLE</label>
                                        <div className="flex gap-2 items-end mt-auto">
                                            <div className="flex-1">
                                                <input type="number" value={bulkStock} onChange={e => setBulkStock(e.target.value)} className="w-full text-xs border-gray-200 rounded-md py-1.5" placeholder="0" />
                                            </div>
                                            <button onClick={handleBulkStock} disabled={isBulkLoading} className="bg-[#FF007F] text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center gap-1">
                                                {isBulkLoading && <span className="material-icons text-[14px] animate-spin">refresh</span>}
                                                Uygula
                                            </button>
                                        </div>
                                    </div>

                                    {/* İndirim */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">İNDİRİM UYGULA</label>
                                        <div className="space-y-3 mt-auto">
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                <input type="number" value={bulkDiscount} onChange={e => setBulkDiscount(e.target.value)} className="w-full pl-7 text-xs border-gray-200 rounded-md py-1.5" placeholder="İndirim oranı" />
                                            </div>
                                            <label className="flex items-center gap-2 text-[10px] text-gray-600">
                                                <input type="checkbox" checked={cancelDiscounts} onChange={e => setCancelDiscounts(e.target.checked)} className="rounded border-gray-300 text-[#FF007F]" />
                                                Mevcut indirimleri iptal et
                                            </label>
                                            <button onClick={handleBulkDiscount} disabled={isBulkLoading} className="w-full bg-[#FF007F] text-white text-xs py-1.5 rounded-md font-medium hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                                                {isBulkLoading && <span className="material-icons text-[14px] animate-spin">refresh</span>}
                                                Uygula
                                            </button>
                                        </div>
                                    </div>

                                    {/* Aktiflik / Pasiflik */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">DURUM GÜNCELLE</label>
                                        <div className="space-y-3 mt-auto">
                                            <label className="flex items-center gap-2 text-xs text-gray-700">
                                                <input type="radio" checked={bulkActiveStatus === "true"} onChange={() => setBulkActiveStatus("true")} className="text-[#FF007F] focus:ring-[#FF007F] border-gray-300" /> Aktif Yap
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-gray-700">
                                                <input type="radio" checked={bulkActiveStatus === "false"} onChange={() => setBulkActiveStatus("false")} className="text-[#FF007F] focus:ring-[#FF007F] border-gray-300" /> Pasif Yap
                                            </label>
                                            <button onClick={handleBulkStatus} disabled={isBulkLoading} className="w-full bg-[#FF007F] text-white text-xs py-1.5 font-medium rounded-md hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                                                {isBulkLoading && <span className="material-icons text-[14px] animate-spin">refresh</span>}
                                                Uygula
                                            </button>
                                        </div>
                                    </div>

                                    {/* Fiyat Artırımları Yüzde */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">FİYAT ARTIRIMI (YÜZDESEL)</label>
                                        <div className="flex gap-2 mt-auto">
                                            <div className="relative flex-1">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                <input type="number" value={priceIncreasePct} onChange={e => setPriceIncreasePct(e.target.value)} className="w-full pl-7 text-xs border-gray-200 rounded-md py-1.5" placeholder="Oran" />
                                            </div>
                                            <button onClick={handleBulkPriceIncreasePct} disabled={isBulkLoading} className="bg-[#FF007F] text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center gap-1">
                                                {isBulkLoading && <span className="material-icons text-[14px] animate-spin">refresh</span>}
                                                Uygula
                                            </button>
                                        </div>
                                    </div>

                                    {/* Fiyat Artırımları Tutar */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">FİYAT ARTIRIMI (TUTAR BAZLI)</label>
                                        <div className="flex gap-2 mt-auto">
                                            <div className="relative flex-1">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
                                                <input type="number" value={priceIncreaseFlat} onChange={e => setPriceIncreaseFlat(e.target.value)} className="w-full pl-7 text-xs border-gray-200 rounded-md py-1.5" placeholder="Tutar" />
                                            </div>
                                            <button onClick={handleBulkPriceIncreaseFlat} disabled={isBulkLoading} className="bg-[#FF007F] text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-[#D6006B] transition-colors disabled:opacity-50 flex items-center gap-1">
                                                {isBulkLoading && <span className="material-icons text-[14px] animate-spin">refresh</span>}
                                                Uygula
                                            </button>
                                        </div>
                                    </div>

                                    {/* Diğer İşlemler */}
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4 justify-center opacity-40">
                                        <button disabled className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-md transition-colors text-xs font-medium cursor-not-allowed" title="Bu özellik henüz aktif değil.">
                                            <span className="material-icons text-[16px]">file_download</span>
                                            ÜRÜNLERİ İNDİR
                                        </button>
                                        <button disabled className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-md transition-colors text-xs font-medium cursor-not-allowed" title="Bu özellik henüz aktif değil.">
                                            <span className="material-icons text-[16px]">share</span>
                                            ÜRÜNLERİ PAYLAŞ
                                        </button>
                                        <p className="text-[10px] text-gray-400 italic text-center">Yakında aktif olacak.</p>
                                    </div>

                                    {/* Silme */}
                                    <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm flex flex-col justify-center">
                                        <div className="mt-auto">
                                            <button onClick={() => setIsDeleteWarningModalOpen(true)} disabled={isBulkLoading} className="w-full py-2.5 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors text-xs font-bold border border-transparent hover:border-red-200 disabled:opacity-50" title="Seçtiğiniz ürünler toplu şekilde silinir.">
                                                <span className="material-icons text-[16px]">delete_sweep</span>
                                                SEÇİLENLERİ SİL
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <ProductTable
                products={products}
                currentPage={currentPage}
                totalPages={totalPages}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectCurrentPage}
            />

            {/* DELETE WARNING MODAL */}
            {isDeleteWarningModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <span className="material-icons text-3xl">warning</span>
                            <h3 className="text-lg font-bold">Uyarı: Kalıcı Olarak Silinecek</h3>
                        </div>
                        <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                            Seçilen tüm ürünler geri dönüşümsüz olarak silinecektir. Silmek yerine ürünleri
                            <strong className="text-zinc-800"> Pasif </strong> duruma alıp sonradan mağazanızda tekrar sergilemek üzere gizleyebilirsiniz.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteWarningModalOpen(false);
                                    setBulkActiveStatus("false");
                                    executeBulkAction(
                                        () => bulkUpdateStatus(selectedIds, false),
                                        "Ürünler pasife alındı"
                                    );
                                }}
                                disabled={isBulkLoading}
                                className="w-full bg-[#FF007F] text-white py-3 rounded-xl font-bold hover:bg-[#D6006B] transition-colors disabled:opacity-50"
                            >
                                Ürünleri Pasife Al
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteWarningModalOpen(false);
                                    setIsDeleteConfirmModalOpen(true);
                                }}
                                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors border border-transparent hover:border-red-200"
                            >
                                Yine De Sil
                            </button>
                            <button
                                onClick={() => setIsDeleteWarningModalOpen(false)}
                                className="w-full text-zinc-500 py-2 text-sm font-medium hover:text-zinc-700 transition-colors mt-1"
                            >
                                İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM MODAL */}
            {isDeleteConfirmModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-in zoom-in-95 fade-in duration-200 border-t-4 border-red-600">
                        <div className="text-center mb-6">
                            <span className="material-icons text-red-600 text-[48px] mb-2">delete_forever</span>
                            <h3 className="text-xl font-extrabold text-zinc-800">Silmeyi Onaylıyor musunuz?</h3>
                            <p className="text-zinc-500 text-sm mt-2">
                                Bu işlem onaylandıktan sonra geri alınamaz. Seçili <strong>{selectedIds.length}</strong> adet ürün kalıcı olarak sistemden silinecektir.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteConfirmModalOpen(false)}
                                className="flex-1 bg-zinc-100 text-zinc-600 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteConfirmModalOpen(false);
                                    handleBulkDelete();
                                }}
                                disabled={isBulkLoading}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                Silmeyi Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATION MODAL */}
            {notificationMessage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex flex-col items-center text-center gap-3">
                            <span className={`material-icons text-5xl ${notificationType === 'success' ? 'text-[#FF007F]' : 'text-red-500'}`}>
                                {notificationType === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <h3 className="text-lg font-bold text-zinc-800">
                                {notificationType === 'success' ? 'Bildirim' : 'Hata'}
                            </h3>
                            <p className="text-zinc-600 text-sm">{notificationMessage}</p>
                            <button
                                onClick={() => setNotificationMessage(null)}
                                className={`mt-4 w-full py-2.5 rounded-xl font-bold transition-colors ${notificationType === 'success'
                                    ? 'bg-[#FF007F] text-white hover:bg-[#D6006B]'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
