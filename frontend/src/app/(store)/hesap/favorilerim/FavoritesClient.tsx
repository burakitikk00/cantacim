"use client";

import React from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/store/FavoriteButton";

interface FavoriteProduct {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    images: string[];
    category: { name: string; slug: string };
    variants: any[];
}

interface FavoriteItem {
    favoriteId: string;
    addedAt: string;
    product: FavoriteProduct;
}

interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    images: string[];
    category: { name: string; slug: string };
}

interface FavoritesClientProps {
    favorites: FavoriteItem[];
    recommendations: RecommendedProduct[];
}

export default function FavoritesClient({ favorites, recommendations }: FavoritesClientProps) {
    const [items, setItems] = React.useState(favorites);

    // Listen for favoriteChanged events to remove unfavorited items
    React.useEffect(() => {
        const handler = () => {
            // Refetch favorites via page reload (server component)
            window.location.reload();
        };
        window.addEventListener("favoriteChanged", handler);
        return () => window.removeEventListener("favoriteChanged", handler);
    }, []);

    if (items.length === 0) {
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
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Favorilerim</h2>
                </div>

                {/* Empty State */}
                <div className="text-center py-24 rounded-2xl border-2 border-dashed border-primary/10 bg-primary/[0.02]">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary/30">favorite</span>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">Henüz favori ürününüz yok</h3>
                    <p className="text-sm text-primary/50 max-w-sm mx-auto mb-8">
                        Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
                    </p>
                    <Link
                        href="/urunler"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">storefront</span>
                        Alışverişe Başla
                    </Link>
                </div>
            </div>
        );
    }

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
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Favorilerim</h2>
                <p className="text-sm md:text-base text-primary/50">
                    Koleksiyonunuzda {items.length} ürün bulunmaktadır.
                </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                    const product = item.product;
                    const displayImage = product.images[0] || product.variants.find((v: any) => v.image)?.image || "/placeholder.jpg";

                    return (
                        <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                            <Link href={`/urunler/${product.slug}`}>
                                <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={product.name}
                                        src={displayImage}
                                    />
                                </div>
                            </Link>
                            <FavoriteButton productId={product.id} variant="overlay" />
                            <div className="flex flex-1 flex-col p-4">
                                <Link href={`/urunler/${product.slug}`}>
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{product.category.name}</p>
                                        <h3 className="text-sm font-semibold">{product.name}</h3>
                                    </div>
                                </Link>
                                <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                                    <span className="text-base font-bold text-gray-900">
                                        {formatPrice(Number(product.basePrice))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recommendation Section – Dinamik */}
            <div className="mt-16">
                <div className="rounded-2xl bg-primary p-8 text-white lg:p-12">
                    <div className="space-y-4 mb-8">
                        <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Sizin İçin Seçildi
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold">Sizin İçin Seçilenler</h3>
                        <p className="max-w-md text-sm leading-relaxed text-white/70">
                            Favorilerinizdeki ürünlere dayanarak, yeni sezon koleksiyonumuzun size çok yakışacağını düşünüyoruz.
                        </p>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((product) => {
                                const displayImage = product.images[0] || "/placeholder.jpg";

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/urunler/${product.slug}`}
                                        className="group relative flex flex-col overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-300 hover:bg-white/20 hover:ring-white/25 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt={product.name}
                                                src={displayImage}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        </div>
                                        <div className="flex flex-1 flex-col p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                                                {product.category.name}
                                            </p>
                                            <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                                                {product.name}
                                            </h4>
                                            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
                                                <span className="text-base font-bold text-white">
                                                    {formatPrice(Number(product.basePrice))}
                                                </span>
                                                <span className="material-symbols-outlined text-lg text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                                                    arrow_forward
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <Link
                            href="/urunler"
                            className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-bold text-primary transition-transform hover:scale-105"
                        >
                            Keşfetmeye Başla
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
