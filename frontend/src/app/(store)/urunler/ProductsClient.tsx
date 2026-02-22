"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/store/FavoriteButton";

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

    // Local Filter State
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
    const [sort, setSort] = useState(initialSort);

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
        // Direct push to clear
        router.push("/urunler");
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
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-24 relative">
            {isFilterOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsFilterOpen(false)} />
            )}

            <aside className={`fixed top-0 left-0 h-full w-80 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl p-6 overflow-y-auto ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Filtreler</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Categories - Multi Select */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Kategoriler</h3>
                        <div className="space-y-3">
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
                    </div>

                    {/* Dynamic Attributes */}
                    {attributes.map((attr) => (
                        <div key={attr.id}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{attr.name}</h3>
                            <div className="space-y-3">
                                {attr.values.length === 0 && <p className="text-xs text-gray-400">Seçenek yok</p>}
                                {attr.values.map((val) => {
                                    const isSelected = selectedAttributes[attr.slug]?.includes(val.slug);

                                    // Special rendering for 'color' or 'renk' if we had hex codes, 
                                    // for now standard checkbox but maybe grid layout for compact view
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
                        </div>
                    ))}

                    {/* Price Range */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Fiyat Aralığı</h3>
                        <div className="space-y-4">
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
                    </div>

                    <div className="pt-6 space-y-3">
                        <button onClick={applyFilters} className="w-full bg-primary text-white h-12 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors rounded">
                            Filtreleri Uygula
                        </button>
                        <button onClick={clearFilters} className="w-full bg-transparent border border-gray-200 text-primary h-12 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors rounded">
                            Temizle
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
                <div className="space-y-4">
                    <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary/40">
                        <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary font-medium">Koleksiyon</span>
                    </nav>
                    <h1 className="text-4xl font-light tracking-tight text-primary capitalize">{getPageTitle()}</h1>
                    <p className="text-primary/40 text-sm">Toplam {totalItems} ürün</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-6 py-3 border border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-all rounded group">
                        <span className="material-symbols-outlined text-lg">tune</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Filtrele</span>
                    </button>

                    <div className="relative z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded hover:border-gray-300 transition-colors bg-white min-w-[160px] md:min-w-[200px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400">Sırala:</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                    {SORT_OPTIONS.find(o => o.value === sort)?.label || "Önerilenler"}
                                </span>
                            </div>
                            <span className={`material-symbols-outlined text-sm text-gray-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}>expand_more</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((product) => {
                        const displayImage = product.images[0] || product.variants.find((v: any) => v.image)?.image || "/placeholder.jpg";
                        return (
                            <Link key={product.id} href={`/urunler/${product.slug}`} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                                <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={displayImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <FavoriteButton productId={product.id} variant="overlay" />
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-gray-400">{product.category.name}</p>
                                        <h3 className="text-sm font-semibold text-primary line-clamp-1">{product.name}</h3>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-gray-900">
                                                {product.discountedPrice ? formatPrice(Number(product.discountedPrice)) : formatPrice(Number(product.basePrice))}
                                            </span>
                                            {product.discountedPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {formatPrice(Number(product.basePrice))}
                                                </span>
                                            )}
                                        </div>
                                        {product.discountText && (
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
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
