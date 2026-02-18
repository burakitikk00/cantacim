"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "./actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Product {
    id: string;
    name: string;
    shopierId: string | null;
    category: { name: string };
    basePrice: any;
    images: string[];
    isActive: boolean;
    variants: {
        id: string;
        sku: string;
        stock: number;
        price: any;
        image: string | null;
        attributes: {
            attributeValue: {
                value: string;
                attribute: { name: string };
            };
        }[];
    }[];
}

interface ProductTableProps {
    products: Product[];
    currentPage: number;
    totalPages: number;
}

export default function ProductTable({ products, currentPage, totalPages }: ProductTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        setDeletingId(id);
        const result = await deleteProduct(id);

        if (!result.success) {
            alert(result.error);
        }
        setDeletingId(null);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ürün</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Fiyat</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Stok</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <span className="material-icons text-4xl mb-2">inventory_2</span>
                                        <p className="text-sm">Henüz hiç ürün eklenmemiş.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                const price = Number(product.basePrice);
                                const isExpanded = expandedId === product.id;
                                const hasVariants = product.variants.length > 0;

                                return (
                                    <>
                                        <tr
                                            key={product.id}
                                            className={`transition-colors group ${isExpanded ? "bg-gray-50" : "hover:bg-gray-50/80"
                                                }`}
                                        >
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => hasVariants && toggleExpand(product.id)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative group-hover:border-[#FF007F]/20 transition-colors">
                                                        {(product.images[0] || product.variants[0]?.image) ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={product.images[0] || product.variants[0]?.image || ''}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if image fails to load
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="material-icons text-lg text-gray-400">broken_image</span>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <span className="material-icons text-lg">image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-[#FF007F] transition-colors flex items-center gap-2">
                                                            {product.name}
                                                            {product.shopierId && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100" title={`Shopier ID: ${product.shopierId}`}>
                                                                    <span className="material-icons text-[10px] mr-1">shopping_bag</span>
                                                                    Shopier
                                                                </span>
                                                            )}
                                                            {hasVariants && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-800">
                                                                    {product.variants.length} Varyant
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasVariants && (
                                                            <div className="text-xs text-blue-500 font-medium flex items-center gap-1 mt-0.5">
                                                                {isExpanded ? "Gizle" : "Detayları Göster"}
                                                                <span className={`material-icons text-[14px] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                    {product.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                {formatPrice(price)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {totalStock > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                        {totalStock} Adet
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                                        Tükendi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                        Pasif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-400 group-hover:text-gray-900 transition-colors">
                                                    <Link
                                                        href={`/admin/urunler/${product.id}`}
                                                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                        title="Düzenle"
                                                    >
                                                        <span className="material-icons text-[18px]">edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(product.id);
                                                        }}
                                                        disabled={deletingId === product.id}
                                                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                                                        title="Sil"
                                                    >
                                                        {deletingId === product.id ? (
                                                            <span className="material-icons animate-spin text-[18px]">refresh</span>
                                                        ) : (
                                                            <span className="material-icons text-[18px]">delete</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={6} className="px-6 py-4 shadow-inner">
                                                    <div className="pl-16">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <span className="material-icons text-sm">style</span>
                                                            Varyant Detayları
                                                        </h4>
                                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                                    <tr>
                                                                        <th className="px-4 py-2 font-medium text-gray-500">SKU</th>
                                                                        <th className="px-4 py-2 font-medium text-gray-500">Özellikler</th>
                                                                        <th className="px-4 py-2 font-medium text-gray-500 text-right">Fiyat</th>
                                                                        <th className="px-4 py-2 font-medium text-gray-500 text-right">Stok</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {product.variants.map((variant) => (
                                                                        <tr key={variant.id} className="hover:bg-gray-50/50">
                                                                            <td className="px-4 py-2 text-gray-600 font-mono text-xs">{variant.sku}</td>
                                                                            <td className="px-4 py-2 text-gray-900">
                                                                                <div className="flex gap-2">
                                                                                    {(() => {
                                                                                        // Try to extract attributes
                                                                                        const colorAttr = variant.attributes.find(a => a.attributeValue.attribute.name === "Renk");
                                                                                        const sizeAttr = variant.attributes.find(a => a.attributeValue.attribute.name === "Beden");

                                                                                        let color = colorAttr?.attributeValue.value;
                                                                                        let size = sizeAttr?.attributeValue.value;

                                                                                        // Enhanced list of common colors in Turkish
                                                                                        const commonColors = [
                                                                                            "Siyah", "Beyaz", "Kırmızı", "Mavi", "Yeşil", "Pembe",
                                                                                            "Altın", "Gold", "Gümüş", "Silver", "Gri", "Bej",
                                                                                            "Lacivert", "Bordo", "Kahve", "Kahverengi", "Turuncu",
                                                                                            "Sarı", "Mor", "Krem", "Vizon", "Taba", "Haki",
                                                                                            "Pudra", "Lila", "Mercan", "Turkuaz", "Fuşya", "Somon",
                                                                                            "Hardal", "Kiremit", "Petrol", "Antrasit", "Bronz", "Bakır"
                                                                                        ];

                                                                                        // Fallback to SKU parsing if missing
                                                                                        if (!color && !size && variant.sku) {
                                                                                            const parts = variant.sku.split('-');
                                                                                            if (parts.length > 1) {
                                                                                                const foundColor = commonColors.find(c => variant.sku.toLowerCase().includes(c.toLowerCase()));
                                                                                                if (foundColor) color = foundColor;
                                                                                            }
                                                                                        }

                                                                                        // Clean up "Renk" suffix if present
                                                                                        if (color && color.toLowerCase().endsWith(" renk")) {
                                                                                            color = color.substring(0, color.length - 5).trim();
                                                                                            color = color.charAt(0).toUpperCase() + color.slice(1);
                                                                                        }

                                                                                        // Color style mapping
                                                                                        const getColorStyle = (c: string) => {
                                                                                            if (!c) return "bg-gray-100 text-gray-800 border-gray-200";
                                                                                            const normalized = c.toLowerCase()
                                                                                                .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c");

                                                                                            if (normalized.includes("siyah")) return "bg-gray-900 text-white border-gray-700";
                                                                                            if (normalized.includes("beyaz")) return "bg-white text-gray-900 border-gray-300 shadow-sm";
                                                                                            if (normalized.includes("kirmizi") || normalized.includes("bordo")) return "bg-red-100 text-red-800 border-red-200";
                                                                                            if (normalized.includes("mavi") || normalized.includes("lacivert") || normalized.includes("turkuaz") || normalized.includes("petrol")) return "bg-blue-100 text-blue-800 border-blue-200";
                                                                                            if (normalized.includes("yesil") || normalized.includes("haki") || normalized.includes("zumbut")) return "bg-green-100 text-green-800 border-green-200";
                                                                                            if (normalized.includes("sari") || normalized.includes("altin") || normalized.includes("gold") || normalized.includes("hardal")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
                                                                                            if (normalized.includes("turuncu") || normalized.includes("kiremit") || normalized.includes("somon") || normalized.includes("mercan") || normalized.includes("bakir") || normalized.includes("taba")) return "bg-orange-100 text-orange-800 border-orange-200";
                                                                                            if (normalized.includes("mor") || normalized.includes("lila") || normalized.includes("fusya")) return "bg-purple-100 text-purple-800 border-purple-200";
                                                                                            if (normalized.includes("pembe") || normalized.includes("pudra")) return "bg-pink-100 text-pink-800 border-pink-200";
                                                                                            if (normalized.includes("gri") || normalized.includes("gumus") || normalized.includes("silver") || normalized.includes("antrasit")) return "bg-gray-200 text-gray-800 border-gray-300";
                                                                                            if (normalized.includes("kahve") || normalized.includes("vizon") || normalized.includes("bej") || normalized.includes("krem") || normalized.includes("bronz")) return "bg-[#D7CCC8] text-[#5D4037] border-[#BCAAA4]";

                                                                                            return "bg-gray-100 text-gray-800 border-gray-200";
                                                                                        };

                                                                                        const colorStyle = color ? getColorStyle(color) : "";

                                                                                        return (
                                                                                            <>
                                                                                                {color && (
                                                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${colorStyle}`}>
                                                                                                        <span className="opacity-70 mr-1.5 font-normal">Renk:</span>
                                                                                                        {color}
                                                                                                    </span>
                                                                                                )}
                                                                                                {size && (
                                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-600 border border-gray-200 font-medium">
                                                                                                        <span className="opacity-50 mr-1">Beden:</span>
                                                                                                        {size}
                                                                                                    </span>
                                                                                                )}
                                                                                                {!color && !size && variant.sku}
                                                                                            </>
                                                                                        );
                                                                                    })()}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-right text-gray-900 font-medium">
                                                                                {formatPrice(Number(variant.price))}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-right">
                                                                                {variant.stock > 0 ? (
                                                                                    <span className="text-emerald-600 font-medium text-xs">{variant.stock} Adet</span>
                                                                                ) : (
                                                                                    <span className="text-red-500 font-medium text-xs">Tükendi</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div className="text-sm text-gray-500">
                        Toplam <span className="font-semibold text-gray-900">{totalPages}</span> sayfa
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", (currentPage - 1).toString());
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            disabled={currentPage <= 1}
                            className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 shadow-sm"
                        >
                            <span className="material-icons text-sm">chevron_left</span>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = currentPage - 2 + i;
                                if (currentPage < 3) p = i + 1;
                                if (currentPage > totalPages - 2) p = totalPages - 4 + i;
                                if (p < 1 || p > totalPages) return null;

                                return (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set("page", p.toString());
                                            router.push(`${pathname}?${params.toString()}`);
                                        }}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all shadow-sm ${currentPage === p
                                            ? 'bg-[#FF007F] text-white shadow-pink-200'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", (currentPage + 1).toString());
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            disabled={currentPage >= totalPages}
                            className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 shadow-sm"
                        >
                            <span className="material-icons text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
