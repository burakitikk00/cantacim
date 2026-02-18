"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductVariant {
    id: string;
    price: string;
    stock: number;
    image: string | null;
    attributes: {
        attribute: { name: string };
        attributeValue: { value: string; slug: string };
    }[];
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    images: string[];
    category: { name: string; slug: string };
    variants: ProductVariant[];
}

interface ProductDetailClientProps {
    product: Product;
}

const RELATED = [
    { brand: "Saint Laurent", name: "Leather Card Case", price: "₺9.800", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1f8Dpms9DHynDNhbSgwsUb_3RwhVdq_V60H73R0aLjVya3KYUFs_2ls8ujsJ77NGvfCMlqnmVfeNQYZ8krGg3EaRZVs6gsdMhtKe89zFqwcvACwguLsqoVLBQRcqz6dWcYcfMJwVpOq6KdkYME1MfFcYFNQ8W6eGM3sibYAyshr-sflexynGFB1iafhZgjmCRrBlKtKxZyP4MPNA9XSKJfEwXGe5_r7IhUsXOplwh1KUG8vy_EkCkiSLl5UqHbeRqrXGBBd1Il838" },
    { brand: "Saint Laurent", name: "Monogram Phone Case", price: "₺12.400", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh3sCIeGlMAnDJ4DrPS6znDbaz6kiaNxSx7me98wK6Wb_0L4aHNd2m2W9KMXthVfmlwIcbEv3Q4ds7pFeUGO71xyqLRRQM9pwrUiu5jlQzWP3M1-uBrLgbFLR-d7Ds8yx8MxV8xXiaaVcRQM0RPVl_Mma1ER0GK3XNPa-7Hb15qK2yVXkJtHddltQQhbJymeip2XrwQhUO1jY1CWGpZ4SXOmAkEGd6i5ZOAAdj9ugh1RBZoPtWvB2j0cy2p-NmrdnCWDqubF5wlCIP" },
    { brand: "Saint Laurent", name: "SL 276 Cat-Eye", price: "₺14.200", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0PesV603qtPymgmSWtIkSEfRErJUUe9oBtrM-wpHzSuLuh0HJvOVswK6uKWU9Sl-w6Mz9EcW36cHiWOXJos3N0dHbIwIe8lkW-Z_XdgwAMswFqWpddToyYCdJMyXnaO08wR9dsE7ZUqOiHxDxd4EQTiDXsEoUG-YU-lSjDJ3tNM6Gosz4lXeA9mGJynAdSRauNgO5jG71hH7VvNts1pAuNtIhcKuNePzHf932233Aapq-HekoD8MK3UGDGxwLbMRQz4bZo6h43tC" },
    { brand: "Saint Laurent", name: "Opyum Leather Pumps", price: "₺34.500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhKCVfLkeIakmDGjF8TwU23Ac72q9M8Ol74q4CN6ZU5Q8pv68uzsbq2PPqWrpSXbOLIlaFBboJE82bI7qZL8XuwvRwHhiLcSM0kMbRKau-BjPvZH1QHaYMvI4NtqvUKWAvbBzVAG2CZ1ylRXRinr7Oa-ISeeDTpmmL4lP7ByFJGbwrujLijj2MnZzTOl7LIoBwdnuLLWxC9jVTcD6-dKQOTVBGL7-4K3xMZWDvg1iiNeGpy8bevWA7af9oCFaN54voQzsJv7nthiOs" },
];

const COLOR_MAP: Record<string, string> = {
    "Siyah": "#1A1A1A",
    "Beyaz": "#FFFFFF",
    "Kırmızı": "#8B0000",
    "Mavi": "#00008B",
    "Yeşil": "#006400",
    "Pembe": "#FFC0CB",
    "Altın": "#D4AF37",
    "Gümüş": "#C0C0C0",
    "Gri": "#808080",
    "Bej": "#F5F5DC",
    "Tan": "#C19A6B",
    "Bordo": "#800000",
    "Lacivert": "#000080",
    "Krem": "#FFFDD0"
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    // Group variants by attributes
    const allAttributes = product.variants.reduce((acc, variant) => {
        variant.attributes.forEach((attr) => {
            const attrName = attr.attribute.name;
            if (!acc[attrName]) {
                acc[attrName] = [];
            }
            if (!acc[attrName].find((v) => v.slug === attr.attributeValue.slug)) {
                acc[attrName].push(attr.attributeValue);
            }
        });
        // Sort values (optional)
        return acc;
    }, {} as Record<string, { value: string; slug: string }[]>);

    // Handle attribute selection
    const handleAttributeSelect = (attrName: string, valueSlug: string) => {
        const newAttributes = { ...selectedAttributes, [attrName]: valueSlug };
        setSelectedAttributes(newAttributes);

        // Try to find a matching variant
        const variant = product.variants.find((v) => {
            return Object.entries(newAttributes).every(([key, value]) => {
                return v.attributes.some((attr) => attr.attribute.name === key && attr.attributeValue.slug === value);
            });
        });

        if (variant) {
            setSelectedVariant(variant);
        } else {
            setSelectedVariant(null);
        }
    };

    // Determine current display values
    const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

    // Combine product images and unique variant images
    const variantImages = product.variants.map(v => v.image).filter((img): img is string => !!img && !product.images.includes(img));
    const uniqueVariantImages = Array.from(new Set(variantImages));
    const displayImages = [...product.images, ...uniqueVariantImages];

    const mainImage = selectedVariant?.image || displayImages[selectedImgIndex] || "/placeholder.jpg";
    const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-12">
                <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href="/urunler" className="hover:text-primary transition-colors">Çantalar</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href={`/urunler?cat=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
                <span className="material-symbols-outlined text-xs text-primary/30">chevron_right</span>
                <span className="text-primary">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-7 flex gap-6 h-fit lg:sticky lg:top-28">
                    {/* Thumbnails */}
                    <div className="flex flex-col gap-4 w-20 shrink-0 no-scrollbar overflow-y-auto max-h-[700px]">
                        {displayImages.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedImgIndex(i)}
                                className={`aspect-[3/4] w-full bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImgIndex === i ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-gray-300"}`}
                            >
                                <img
                                    alt={`${product.name} thumbnail ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    src={img}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 aspect-[3/4] bg-[#f9fafb] rounded-xl overflow-hidden group">
                        <img
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            src={mainImage}
                        />
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">{product.category.name}</h2>
                        <h1 className="text-4xl font-bold tracking-tight text-primary">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex text-primary">
                                {[1, 2, 3, 4].map((i) => (
                                    <span key={i} className="material-symbols-outlined fill-icon text-lg">star</span>
                                ))}
                                <span className="material-symbols-outlined text-lg">star_half</span>
                            </div>
                            <span className="text-sm font-medium text-gray-400 underline underline-offset-4 cursor-pointer">48 Değerlendirme</span>
                            <div className="h-4 w-px bg-gray-200"></div>
                            {isOutOfStock ? (
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Tükendi</span>
                            ) : (
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Stokta</span>
                            )}
                        </div>
                        <div className="pt-4">
                            <span className="text-3xl font-bold text-primary">{formatPrice(Number(currentPrice))}</span>
                        </div>
                    </div>

                    {/* Variations */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        {Object.entries(allAttributes).map(([attrName, values]) => (
                            <div key={attrName}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                        {attrName}: <span className="text-gray-500 font-normal">{selectedAttributes[attrName] || "Seçiniz"}</span>
                                    </span>
                                    {/* Optional Size Guide if needed */}
                                    {/* <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Beden Tablosu</button> */}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {attrName.toLowerCase().includes("renk") ? (
                                        <div className="flex gap-4">
                                            {values.map((val) => {
                                                const hex = COLOR_MAP[val.value] || "#CCCCCC";
                                                const isSelected = selectedAttributes[attrName] === val.slug;
                                                return (
                                                    <button
                                                        key={val.slug}
                                                        onClick={() => handleAttributeSelect(attrName, val.slug)}
                                                        className={`size-10 rounded-full border-2 p-0.5 transition-all ${isSelected ? "border-primary" : "border-gray-200 hover:border-gray-400"}`}
                                                    >
                                                        <div className="w-full h-full rounded-full" style={{ backgroundColor: hex }}></div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        // Standard buttons for other attributes (Size, etc)
                                        <div className="grid grid-cols-4 gap-3 w-full">
                                            {values.map((val) => {
                                                const isSelected = selectedAttributes[attrName] === val.slug;
                                                return (
                                                    <button
                                                        key={val.slug}
                                                        onClick={() => handleAttributeSelect(attrName, val.slug)}
                                                        className={`py-3 border text-xs font-bold rounded-lg transition-all ${isSelected
                                                            ? "border-primary bg-primary text-white"
                                                            : "border-gray-200 hover:border-gray-400 text-gray-400"}`}
                                                    >
                                                        {val.value}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            disabled={isOutOfStock}
                            className="flex-1 bg-primary text-white h-16 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-xl">shopping_bag</span>
                            {isOutOfStock ? "Tükendi" : "Sepete Ekle"}
                        </button>
                        <button className="size-16 border-2 border-gray-100 rounded-lg flex items-center justify-center hover:border-gray-200 hover:bg-gray-50 transition-all">
                            <span className="material-symbols-outlined text-2xl">favorite</span>
                        </button>
                    </div>

                    {/* Accordions */}
                    <div className="pt-8 space-y-px">
                        <details className="group border-t border-gray-100" open>
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Ürün Açıklaması</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div
                                className="pb-8 text-sm leading-relaxed text-gray-600"
                                dangerouslySetInnerHTML={{ __html: product.description || "Açıklama bulunmuyor." }}
                            />
                        </details>
                        <details className="group border-t border-gray-100">
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Materyal & Bakım</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pb-8 text-sm leading-relaxed text-gray-600">
                                Profesyonel deri temizliği önerilir. Doğrudan güneş ışığına ve neme maruz bırakmayınız.
                            </div>
                        </details>
                        <details className="group border-t border-b border-gray-100">
                            <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                                <span className="text-xs font-bold uppercase tracking-widest">Teslimat & İade</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pb-8 text-sm leading-relaxed text-gray-600">
                                5.000₺ üzeri siparişlerde ücretsiz kargo. 14 gün içinde koşulsuz iade hakkı.
                            </div>
                        </details>
                    </div>
                </div>
            </div>

            {/* You May Also Like Section */}
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
                    {RELATED.map((r, i) => (
                        <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md cursor-pointer">
                            <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                <img
                                    alt={r.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    src={r.img}
                                />
                                <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500">
                                    <span className="material-symbols-outlined fill text-lg">favorite</span>
                                </button>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <div className="mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-gray-400">{r.brand}</p>
                                    <h4 className="text-sm font-semibold">{r.name}</h4>
                                </div>
                                <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                                    <span className="text-base font-bold text-gray-900">{r.price}</span>
                                    <button className="flex h-9 items-center justify-center rounded bg-primary px-4 text-xs font-bold text-white transition-opacity hover:opacity-90">
                                        Sepete Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
