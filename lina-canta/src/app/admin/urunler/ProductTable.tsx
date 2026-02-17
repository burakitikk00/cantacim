"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "./actions";

interface Product {
    id: string;
    name: string;
    category: { name: string };
    basePrice: any;
    images: string[];
    isActive: boolean;
    variants: {
        id: string;
        sku: string;
        stock: number;
        price: any;
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
}

export default function ProductTable({ products }: ProductTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
                                                        {product.images[0] ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
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
                                                                                    {variant.attributes.map((attr, idx) => (
                                                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                                                                            <span className="opacity-50 mr-1">{attr.attributeValue.attribute.name}:</span>
                                                                                            {attr.attributeValue.value}
                                                                                        </span>
                                                                                    ))}
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
        </div>
    );
}
