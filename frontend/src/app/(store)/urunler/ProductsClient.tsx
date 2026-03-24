"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { getImageSrc } from "@/lib/image-helpers";
import FavoriteButton from "@/components/store/FavoriteButton";
import ImageWithPlaceholder from "@/components/store/ImageWithPlaceholder";

interface Product {
    id: string;
    name: string;
    slug: string;
    basePrice: string; // Serialized Decimal
    images: string[];
    category: { name: string; slug: string };
    variants: any[];
    discountText?: string;
    discountedPrice?: string; // Add this
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface AttributeValue {
    id: string;
    value: string;
    slug: string;
}

interface Attribute {
    id: string;
    name: string;
    slug: string;
    values: AttributeValue[];
}

interface ProductsClientProps {
    products: Product[];
    categories: Category[];
    attributes: Attribute[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
}

const SORT_OPTIONS = [
    { label: "Önerilenler", value: "recommended" },
    { label: "En Yeniler", value: "newest" },
    { label: "Fiyat: Artan", value: "price_asc" },
    { label: "Fiyat: Azalan", value: "price_desc" },
    { label: "İndirim Oranı", value: "discount_desc" },
];

export default function ProductsClient({
    products,
    categories,
    attributes,
    totalItems,
    currentPage,
    totalPages,
}: ProductsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sidebar State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Initial Values
    const initialMinPrice = searchParams.get("minPrice") || "";
    const initialMaxPrice = searchParams.get("maxPrice") || "";
    const initialSort = searchParams.get("sort") || "recommended";
    const initialQ = searchParams.get("q") || "";

    // Local Filter State
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
    const [sort, setSort] = useState(initialSort);
    const [qParam, setQParam] = useState(initialQ);

    // Accordion State for Filters
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        categories: true,
        price: false, // by default closed
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: prev[section] === undefined ? true : !prev[section]
        }));
    };

    // Sync state with URL change
    useEffect(() => {
        // Cats
        const cats = searchParams.getAll("cat");
        setSelectedCats(cats);

        // Attributes
        const newAttrs: Record<string, string[]> = {};
        attributes.forEach(attr => {
            const values = searchParams.getAll(attr.slug);
            if (values.length > 0) {
                newAttrs[attr.slug] = values;
            }
        });
        setSelectedAttributes(newAttrs);

        setMinPrice(searchParams.get("minPrice") || "");
        setMaxPrice(searchParams.get("maxPrice") || "");
        setSort(searchParams.get("sort") || "recommended");
        setQParam(searchParams.get("q") || "");
    }, [searchParams, attributes]);

    const updateURL = (newParams: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams();

        // 1. Maintain existing params that aren't being updated? 
        // No, we rebuild based on state + newParams override for clean control
        // But here we are passing *overrides*.
        // Actually best to rebuild from current State + Overrides.

        // Let's create a consolidated state object
        const finalCats = "cat" in newParams ? (newParams.cat as string[]) : selectedCats;
        const finalMin = "minPrice" in newParams ? newParams.minPrice : minPrice;
        const finalMax = "maxPrice" in newParams ? newParams.maxPrice : maxPrice;
        const finalSort = "sort" in newParams ? newParams.sort : sort;
        const finalQ = "q" in newParams ? newParams.q : qParam;

        // Attributes
        const finalAttrs = { ...selectedAttributes };
        // If newParams contains attribute updates
        Object.keys(newParams).forEach(key => {
            if (attributes.some(a => a.slug === key)) {
                finalAttrs[key] = newParams[key] as string[];
            }
        });

        // Construct URLSearchParams
        finalCats.forEach(c => params.append("cat", c));
        if (finalMin) params.set("minPrice", finalMin as string);
        if (finalMax) params.set("maxPrice", finalMax as string);
        if (finalSort) params.set("sort", finalSort as string);
        if (finalQ) params.set("q", finalQ as string);

        Object.entries(finalAttrs).forEach(([slug, values]) => {
            values.forEach(v => params.append(slug, v));
        });

        // Page reset on filter change
        if (!newParams.page) {
            params.set("page", "1");
        } else {
            params.set("page", newParams.page as string);
        }

        router.push(`/urunler?${params.toString()}`);
    };

    const applyFilters = () => {
        updateURL({}); // Uses current state
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        setSelectedCats([]);
        setSelectedAttributes({});
        setMinPrice("");
        setMaxPrice("");
        // Direct push to clear, but maintain search query if exists
        router.push(qParam ? `/urunler?q=${qParam}` : "/urunler");
    };

    const toggleCategory = (slug: string) => {
        setSelectedCats(prev =>
            prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
        );
    };

    const toggleAttribute = (attrSlug: string, valueSlug: string) => {
        setSelectedAttributes(prev => {
            const current = prev[attrSlug] || [];
            const updated = current.includes(valueSlug)
                ? current.filter(v => v !== valueSlug)
                : [...current, valueSlug];

            // cleanup if empty
            if (updated.length === 0) {
                const { [attrSlug]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [attrSlug]: updated };
        });
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        setIsSortOpen(false);
        updateURL({ sort: value });
    };

    // Derived Title
    const getPageTitle = () => {
        if (qParam) return `"${qParam}" İçin Sonuçlar`;
        if (selectedCats.length === 0) return "Tüm Ürünler";
        const names = categories
            .filter(c => selectedCats.includes(c.slug))
            .map(c => c.name);
        return names.join(", ");
    };

    // Close dropdowns
    useEffect(() => {
        const handleClickOutside = () => setIsSortOpen(false);
        if (isSortOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isSortOpen]);

    return (
        <main className="max-w-[1440px] w-full mx-auto px-2 sm:px-3 md:px-6 lg:px-12 pt-24 md:pt-28 pb-20 md:pb-24 relative overflow-x-hidden md:overflow-x-visible">
            {isFilterOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsFilterOpen(false)} />
            )}

            <aside className={`fixed top-0 left-0 h-full w-80 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Filtreler</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 border-transparent">
                    {/* Categories - Multi Select */}
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection("categories")} className="flex items-center justify-between w-full group">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 group-hover:text-primary transition-colors">Kategoriler</h3>
                            <span className={`material-symbols-outlined text-gray-400 transition-transform ${openSections.categories !== false ? "rotate-180" : ""}`}>expand_more</span>
                        </button>
                        {openSections.categories !== false && (
                            <div className="space-y-3 mt-4">
                                {categories.map((c) => (
                                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${selectedCats.includes(c.slug) ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"}`}>
                                            {selectedCats.includes(c.slug) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCats.includes(c.slug)}
                                            onChange={() => toggleCategory(c.slug)}
                                        />
                                        <span className={`text-sm ${selectedCats.includes(c.slug) ? "font-bold text-primary" : "text-gray-600 group-hover:text-primary"}`}>{c.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Attributes */}
                    {attributes.map((attr) => {
                        const isOpen = openSections[`attr_${attr.slug}`];
                        return (
                            <div key={attr.id} className="border-b border-gray-100 pb-6">
                                <button onClick={() => toggleSection(`attr_${attr.slug}`)} className="flex items-center justify-between w-full group">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 group-hover:text-primary transition-colors">{attr.name}</h3>
                                    <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
                                </button>
                                {isOpen && (
                                    <div className="space-y-3 mt-4">
                                        {attr.values.length === 0 && <p className="text-xs text-gray-400">Seçenek yok</p>}
                                        {attr.values.map((val) => {
                                            const isSelected = selectedAttributes[attr.slug]?.includes(val.slug);
                                            return (
                                                <label key={val.id} className="flex items-center gap-3 cursor-pointer group select-none">
                                                    <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"}`}>
                                                        {isSelected && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={!!isSelected}
                                                        onChange={() => toggleAttribute(attr.slug, val.slug)}
                                                    />
                                                    <span className={`text-sm ${isSelected ? "font-bold text-primary" : "text-gray-600 group-hover:text-primary"}`}>{val.value}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Price Range */}
                    <div className="pb-6">
                        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full group">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 group-hover:text-primary transition-colors">Fiyat Aralığı</h3>
                            <span className={`material-symbols-outlined text-gray-400 transition-transform ${openSections.price !== false ? "rotate-180" : ""}`}>expand_more</span>
                        </button>
                        {openSections.price !== false && (
                            <div className="space-y-4 mt-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Min (TL)</label>
                                        <input
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="0"
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-primary focus:ring-0 outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Max (TL)</label>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="50000"
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-primary focus:ring-0 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white space-y-3">
                    <button onClick={applyFilters} className="w-full bg-primary text-white h-12 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors rounded">
                        Filtreleri Uygula
                    </button>
                    <button onClick={clearFilters} className="w-full bg-transparent border border-gray-200 text-primary h-12 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors rounded">
                        Temizle
                    </button>
                </div>
            </aside>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6 relative z-[20] w-full">
                <div className="space-y-2 md:space-y-4 w-full">
                    <nav className="flex items-center flex-wrap gap-2 text-[10px] md:text-[11px] uppercase tracking-widest text-primary/40">
                        <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px]">chevron_right</span>
                        <span className="text-primary font-medium">Koleksiyon</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-primary capitalize break-words">{getPageTitle()}</h1>
                    <p className="text-primary/40 text-xs md:text-sm">Toplam {totalItems} ürün</p>
                </div>

                <div className="flex items-center flex-wrap gap-2 sm:gap-4 w-full">
                    <button onClick={() => setIsFilterOpen(true)} className="flex flex-1 md:flex-none items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 border border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-all rounded group">
                        <span className="material-symbols-outlined text-base sm:text-lg">tune</span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Filtrele</span>
                    </button>

                    <div className="relative z-[30] flex-1 md:flex-none">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded hover:border-gray-300 transition-colors bg-white w-full justify-between"
                        >
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400">Sırala:</span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary truncate max-w-[80px] sm:max-w-[none]">
                                    {SORT_OPTIONS.find(o => o.value === sort)?.label || "Önerilenler"}
                                </span>
                            </div>
                            <span className={`material-symbols-outlined text-xs sm:text-sm text-gray-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}>expand_more</span>
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl py-2 flex flex-col min-w-[160px] md:min-w-[200px]">
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`px-4 py-2 text-left text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors ${sort === option.value ? "text-primary bg-gray-50" : "text-gray-500"}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">search_off</span>
                    <h3 className="text-lg font-medium text-gray-900">Ürün Bulunamadı</h3>
                    <p className="text-gray-500 mt-2 text-sm">Arama kriterlerinize uygun ürün bulunmamaktadır.</p>
                    <button onClick={clearFilters} className="mt-6 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary pb-1 hover:text-primary/60 transition-colors">
                        Filtreleri Temizle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-2 sm:gap-x-3 md:gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-12 w-full">
                    {products.map((product) => {
                        const displayImage = getImageSrc(product.images[0] || product.variants.find((v: any) => v.image)?.image || null);
                        return (
                            <Link key={product.id} href={`/urunler/${product.slug}`} className="group relative flex flex-col overflow-hidden rounded-[8px] sm:rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md w-full">
                                <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                    <ImageWithPlaceholder
                                        src={displayImage}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                                    />
                                    <FavoriteButton productId={product.id} variant="overlay" />
                                </div>
                                <div className="flex flex-1 flex-col p-2 sm:p-2.5 md:p-4">
                                    <div className="mb-1 sm:mb-1.5 md:mb-2 w-full">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{product.category.name}</p>
                                        <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-primary line-clamp-2 md:line-clamp-1 leading-tight mt-0.5">{product.name}</h3>
                                    </div>
                                    <div className="mt-auto flex flex-col xl:flex-row xl:items-center justify-between border-t border-primary/5 pt-2 md:pt-4 gap-1.5 md:gap-2">
                                        <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                                            <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                                                {product.discountedPrice ? formatPrice(Number(product.discountedPrice)) : formatPrice(Number(product.basePrice))}
                                            </span>
                                            {product.discountedPrice && (
                                                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 line-through">
                                                    {formatPrice(Number(product.basePrice))}
                                                </span>
                                            )}
                                        </div>
                                        {product.discountText && (
                                            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-red-600 uppercase tracking-tight bg-red-50 px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 rounded text-center leading-none mt-1 xl:mt-0 w-fit">
                                                {product.discountText} 
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-2">
                    {/* Simplified Pagination for now, ideally rebuild logic with new updateURL */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => updateURL({ page: p.toString() })}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-all ${currentPage === p ? "bg-primary text-white border-primary" : "border border-gray-200 hover:border-gray-400 text-gray-600"}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </main>
    );
}
