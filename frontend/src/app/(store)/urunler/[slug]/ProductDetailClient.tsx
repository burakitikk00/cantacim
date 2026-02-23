"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getImageSrc } from "@/lib/image-helpers";
import FavoriteButton from "@/components/store/FavoriteButton";
import { useCartStore } from "@/store/cart";
import { addToCart, subscribeStockNotification, submitReview } from "./actions";

interface ProductVariant {
    id: string;
    sku: string;
    price: string;
    stock: number;
    image: string | null;
    attributes: {
        attribute: { name: string; hasColor?: boolean };
        attributeValue: { value: string; slug: string; colorCode?: string | null };
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

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName: string;
}

interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    images: string[];
    category: { name: string; slug: string };
    discountedPrice: string | null;
    discountText: string | null;
}

interface DiscountInfo {
    type: string;
    value: number;
    text: string;
}

interface ProductDetailClientProps {
    product: Product;
    discount: DiscountInfo | null;
    reviews: Review[];
    avgRating: number;
    reviewCount: number;
    recommendedProducts: RecommendedProduct[];
    canReview: boolean;
    reviewableOrderId: string | null;
}

export default function ProductDetailClient({
    product,
    discount,
    reviews,
    avgRating,
    reviewCount,
    recommendedProducts,
    canReview,
    reviewableOrderId,
}: ProductDetailClientProps) {
    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [notifyRequested, setNotifyRequested] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Review form
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [reviewHover, setReviewHover] = useState(0);

    const cartStore = useCartStore();

    // Check localStorage for stock notification
    useEffect(() => {
        const notified = localStorage.getItem(`stock-notify-${product.id}`);
        if (notified) setNotifyRequested(true);
    }, [product.id]);

    // Auto-hide alert
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const hasVariations = product.variants.length > 0 && product.variants.some(v => v.attributes.length > 0);

    const allAttributes = product.variants.reduce((acc, variant) => {
        variant.attributes.forEach((attr) => {
            const attrName = attr.attribute.name;
            if (!acc[attrName]) {
                acc[attrName] = { hasColor: !!attr.attribute.hasColor, values: [] };
            }
            if (!acc[attrName].values.find((v) => v.slug === attr.attributeValue.slug)) {
                acc[attrName].values.push(attr.attributeValue);
            }
        });
        return acc;
    }, {} as Record<string, { hasColor: boolean; values: { value: string; slug: string; colorCode?: string | null }[] }>);

    // Check if a specific attribute value has stock
    const isAttributeValueInStock = (attrName: string, valueSlug: string) => {
        // Find all variants matching this attribute value + currently selected others
        const matchingVariants = product.variants.filter(v => {
            const hasThisValue = v.attributes.some(a => a.attribute.name === attrName && a.attributeValue.slug === valueSlug);
            if (!hasThisValue) return false;

            // Check other selected attributes
            return Object.entries(selectedAttributes).every(([key, val]) => {
                if (key === attrName) return true; // skip self
                return v.attributes.some(a => a.attribute.name === key && a.attributeValue.slug === val);
            });
        });

        return matchingVariants.some(v => v.stock > 0);
    };

    // Handle attribute selection
    const handleAttributeSelect = (attrName: string, valueSlug: string) => {
        // Check stock before allowing selection
        if (!isAttributeValueInStock(attrName, valueSlug)) return;

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
            // Auto-switch to variant image if available
            if (variant.image) {
                const idx = displayImages.indexOf(variant.image);
                if (idx !== -1) {
                    setSelectedImgIndex(idx);
                }
            }
        } else {
            setSelectedVariant(null);
        }
    };

    // Determine current display values
    const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

    // Calculate discounted price
    let discountedPrice: number | null = null;
    if (discount) {
        if (discount.type === "PERCENTAGE") {
            discountedPrice = Number(currentPrice) * (1 - discount.value / 100);
        } else {
            discountedPrice = Number(currentPrice) - discount.value;
        }
    }

    // Combine product images and unique variant images
    const variantImages = product.variants.map(v => v.image).filter((img): img is string => !!img && !product.images.includes(img));
    const uniqueVariantImages = Array.from(new Set(variantImages));
    const displayImages = [...product.images, ...uniqueVariantImages];

    const mainImage = getImageSrc(selectedVariant?.image || displayImages[selectedImgIndex] || null);
    const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
    const allVariantsOutOfStock = product.variants.length > 0 && product.variants.every(v => v.stock === 0);

    const handleAddToCart = async () => {
        // If product has variations but none selected
        if (hasVariations && !selectedVariant) {
            setAlertMessage("Sepete eklenmedi! Lütfen varyasyon seçiniz.");
            return;
        }

        if (isOutOfStock || allVariantsOutOfStock) return;

        setIsAddingToCart(true);
        try {
            // Use zustand for local state
            if (selectedVariant) {
                const variantLabel = selectedVariant.attributes.map(a => a.attributeValue.value).join(" / ");
                cartStore.addItem({
                    variantId: selectedVariant.id,
                    productName: product.name,
                    variantLabel,
                    price: discountedPrice || Number(selectedVariant.price),
                    image: selectedVariant.image || product.images[0],
                    sku: selectedVariant.sku,
                });
            } else if (product.variants.length === 1) {
                // Single variant, no attributes
                const v = product.variants[0];
                cartStore.addItem({
                    variantId: v.id,
                    productName: product.name,
                    variantLabel: "",
                    price: discountedPrice || Number(v.price),
                    image: v.image || product.images[0],
                    sku: v.sku,
                });
            }

            // Also sync to DB
            const variantId = selectedVariant?.id || product.variants[0]?.id;
            if (variantId) {
                await addToCart(variantId);
            }

            setAlertMessage(null);
        } catch {
            setAlertMessage("Sepete eklenirken bir hata oluştu.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleNotifyMe = async () => {
        if (notifyRequested) return;
        const variantId = selectedVariant?.id || product.variants[0]?.id;
        if (!variantId) return;

        const result = await subscribeStockNotification(variantId);
        if (result.success) {
            setNotifyRequested(true);
            localStorage.setItem(`stock-notify-${product.id}`, "true");
        } else {
            setAlertMessage(result.error || "Bir hata oluştu.");
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewableOrderId || reviewRating === 0) return;

        const result = await submitReview({
            productId: product.id,
            orderId: reviewableOrderId,
            rating: reviewRating,
            comment: reviewComment,
        });

        if (result.success) {
            setReviewSubmitted(true);
        } else {
            setAlertMessage(result.error || "Yorum gönderilemedi.");
        }
    };

    // Stars renderer
    const renderStars = (rating: number, size = "text-lg") => {
        const full = Math.floor(rating);
        const hasHalf = rating - full >= 0.5;
        const empty = 5 - full - (hasHalf ? 1 : 0);
        return (
            <div className="flex text-primary">
                {Array.from({ length: full }).map((_, i) => (
                    <span key={`f${i}`} className={`material-symbols-outlined fill-icon ${size}`}>star</span>
                ))}
                {hasHalf && <span className={`material-symbols-outlined ${size}`}>star_half</span>}
                {Array.from({ length: empty }).map((_, i) => (
                    <span key={`e${i}`} className={`material-symbols-outlined ${size} text-gray-300`}>star</span>
                ))}
            </div>
        );
    };

    return (
        <main className="max-w-7xl mx-auto px-6 pt-28 md:pt-32 pb-16 relative">
            {/* Alert Toast */}
            {alertMessage && (
                <div className="fixed top-24 right-6 z-[100] animate-slide-in-right">
                    <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
                        <span className="material-symbols-outlined text-xl">error</span>
                        <p className="text-sm font-medium">{alertMessage}</p>
                        <button onClick={() => setAlertMessage(null)} className="ml-2 hover:opacity-70">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-1 md:gap-2 text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-normal md:tracking-widest mb-6 md:mb-12">
                <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href="/urunler" className="hover:text-primary transition-colors">Ürünler</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href={`/urunler?cat=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
                <span className="material-symbols-outlined text-xs text-primary/30">chevron_right</span>
                <span className="text-primary">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
                {/* Left Column: Image Gallery */}
                <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 h-fit lg:sticky lg:top-28">
                    {/* Thumbnails */}
                    <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full md:w-16 shrink-0 no-scrollbar overflow-x-auto md:overflow-y-auto snap-x max-h-none md:max-h-[500px]">
                        {displayImages.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setSelectedImgIndex(i);
                                    // If a variant matches this image, select it
                                    if (selectedVariant?.image !== img) {
                                        const matchingVariant = product.variants.find(v => v.image === img);
                                        if (matchingVariant) {
                                            const newAttrs = { ...selectedAttributes };
                                            matchingVariant.attributes.forEach(a => {
                                                newAttrs[a.attribute.name] = a.attributeValue.slug;
                                            });
                                            setSelectedAttributes(newAttrs);
                                            setSelectedVariant(matchingVariant);
                                        }
                                    }
                                }}
                                className={`aspect-[3/4] w-[4.5rem] md:w-full shrink-0 snap-start bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImgIndex === i ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-gray-300"}`}
                            >
                                <img
                                    alt={`${product.name} thumbnail ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    src={getImageSrc(img)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 aspect-[3/4] max-h-[600px] w-full bg-[#f9fafb] rounded-xl overflow-hidden group">
                        <img
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                            src={mainImage}
                        />
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="space-y-8 md:space-y-10">
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-[10px] md:text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">{product.category.name}</h2>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            {renderStars(avgRating)}
                            <span className="text-[11px] md:text-sm font-medium text-gray-400 underline underline-offset-4 cursor-pointer whitespace-nowrap">
                                {reviewCount > 0 ? `${reviewCount} Değerlendirme` : "Henüz değerlendirme yok"}
                            </span>
                            <div className="h-4 w-px bg-gray-200"></div>
                            {(isOutOfStock || allVariantsOutOfStock) ? (
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Tükendi</span>
                            ) : (
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Stokta</span>
                            )}
                        </div>
                        <div className="pt-2 md:pt-4 flex items-center gap-4">
                            <div className="flex flex-col">
                                {discountedPrice ? (
                                    <>
                                        <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(discountedPrice)}</span>
                                        <span className="text-xs md:text-sm text-gray-400 line-through">{formatPrice(Number(currentPrice))}</span>
                                    </>
                                ) : (
                                    <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(Number(currentPrice))}</span>
                                )}
                            </div>
                            {discount && (
                                <span className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-red-100">
                                    {discount.text}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Variations */}
                    {Object.keys(allAttributes).length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            {Object.entries(allAttributes).map(([attrName, { hasColor, values }]) => (
                                <div key={attrName}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                            {attrName}: <span className="text-gray-500 font-normal">{selectedAttributes[attrName] ? values.find(v => v.slug === selectedAttributes[attrName])?.value : "Seçiniz"}</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {hasColor ? (
                                            <div className="flex gap-4">
                                                {values.map((val) => {
                                                    const hex = val.colorCode || "#CCCCCC";
                                                    const isSelected = selectedAttributes[attrName] === val.slug;
                                                    const inStock = isAttributeValueInStock(attrName, val.slug);
                                                    return (
                                                        <button
                                                            key={val.slug}
                                                            onClick={() => handleAttributeSelect(attrName, val.slug)}
                                                            disabled={!inStock}
                                                            className={`size-10 rounded-full border-2 p-0.5 transition-all relative ${isSelected ? "border-primary" : inStock ? "border-gray-200 hover:border-gray-400" : "border-gray-100 opacity-40 cursor-not-allowed"}`}
                                                        >
                                                            <div className="w-full h-full rounded-full" style={{ backgroundColor: hex }}></div>
                                                            {!inStock && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-[2px] h-10 bg-gray-400 rotate-45 absolute"></div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-3 w-full">
                                                {values.map((val) => {
                                                    const isSelected = selectedAttributes[attrName] === val.slug;
                                                    const inStock = isAttributeValueInStock(attrName, val.slug);
                                                    return (
                                                        <button
                                                            key={val.slug}
                                                            onClick={() => handleAttributeSelect(attrName, val.slug)}
                                                            disabled={!inStock}
                                                            className={`py-2.5 md:py-3 border text-[11px] md:text-xs font-bold rounded-lg transition-all relative ${isSelected
                                                                ? "border-primary bg-primary text-white"
                                                                : inStock
                                                                    ? "border-gray-200 hover:border-gray-400 text-gray-400"
                                                                    : "border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50"
                                                                }`}
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
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                        {(isOutOfStock || allVariantsOutOfStock) ? (
                            <button
                                onClick={handleNotifyMe}
                                disabled={notifyRequested}
                                className={`flex-1 h-14 md:h-16 rounded-lg font-bold uppercase tracking-widest text-[11px] md:text-sm flex items-center justify-center gap-2 transition-colors ${notifyRequested
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg md:text-xl">notifications_active</span>
                                {notifyRequested ? "Bildirim Kaydınız Alındı" : "Gelince Haber Ver"}
                            </button>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="flex-1 bg-primary text-white h-14 md:h-16 rounded-lg font-bold uppercase tracking-widest text-[11px] md:text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <span className="material-symbols-outlined text-lg md:text-xl">shopping_bag</span>
                                {isAddingToCart ? "Ekleniyor..." : "Sepete Ekle"}
                            </button>
                        )}
                        <FavoriteButton productId={product.id} variant="detail" iconSize="text-xl md:text-2xl" />
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

            {/* Reviews Section */}
            <section className="mt-24 pt-16 border-t border-gray-100">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <h3 className="text-2xl font-bold tracking-tight">Değerlendirmeler</h3>
                        {reviewCount > 0 && (
                            <div className="flex items-center gap-2">
                                {renderStars(avgRating, "text-base")}
                                <span className="text-sm text-gray-500">({reviewCount})</span>
                            </div>
                        )}
                    </div>

                    {/* Review Form */}
                    {canReview && !reviewSubmitted && (
                        <div className="mb-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Değerlendirmenizi Yazın</h4>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setReviewHover(star)}
                                        onMouseLeave={() => setReviewHover(0)}
                                        onClick={() => setReviewRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <span className={`material-symbols-outlined text-2xl ${(reviewHover || reviewRating) >= star ? "fill-icon text-primary" : "text-gray-300"}`}>
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                placeholder="Yorumunuzu yazın (isteğe bağlı)..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-0 outline-none resize-none mb-4"
                            />
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewRating === 0}
                                className="bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Değerlendirmeyi Gönder
                            </button>
                        </div>
                    )}

                    {reviewSubmitted && (
                        <div className="mb-12 p-6 bg-green-50 rounded-xl border border-green-100 text-center">
                            <span className="material-symbols-outlined text-green-600 text-3xl mb-2">check_circle</span>
                            <p className="text-sm font-medium text-green-700">Değerlendirmeniz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır.</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                                {review.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{review.userName}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("tr-TR")}</span>
                                    </div>
                                    {renderStars(review.rating, "text-sm")}
                                    {review.comment && (
                                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Henüz onaylanmış bir değerlendirme bulunmuyor.</p>
                    )}
                </div>
            </section>

            {/* Stilini Tamamla Section */}
            {recommendedProducts.length > 0 && (
                <section className="mt-32 pt-20 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-12">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Stilini Tamamla</h3>
                            <p className="text-sm text-gray-500">Tarzınızı tamamlayacak özenle seçilmiş parçalar.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                        {recommendedProducts.map((r) => (
                            <Link key={r.id} href={`/urunler/${r.slug}`} className="group relative flex flex-col overflow-hidden rounded-lg md:rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                                <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                    <img
                                        alt={r.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        src={getImageSrc(r.images[0] || null)}
                                    />
                                    <FavoriteButton productId={r.id} variant="overlay" />
                                </div>
                                <div className="flex flex-1 flex-col p-2.5 md:p-4">
                                    <div className="mb-1 md:mb-2">
                                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest text-gray-400">{r.category.name}</p>
                                        <h4 className="text-[11px] md:text-sm font-semibold line-clamp-1">{r.name}</h4>
                                    </div>
                                    <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-primary/5 pt-2.5 md:pt-4 gap-1 sm:gap-0">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <span className="text-xs md:text-base font-bold text-gray-900">
                                                {r.discountedPrice ? formatPrice(Number(r.discountedPrice)) : formatPrice(Number(r.basePrice))}
                                            </span>
                                            {r.discountedPrice && (
                                                <span className="text-[9px] md:text-xs text-gray-400 line-through">{formatPrice(Number(r.basePrice))}</span>
                                            )}
                                        </div>
                                        {r.discountText && (
                                            <span className="text-[8px] md:text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                                {r.discountText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Alert animation CSS */}
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </main>
    );
}
