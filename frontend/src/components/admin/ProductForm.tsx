"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageEditor from "./ImageEditor";
import { updateProduct } from "@/app/admin/urunler/actions";

interface ProductFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
    title: string;
    categories?: { id: string; name: string }[];
}

interface Variant {
    id: number | string;
    color: string;
    size: string;
    stock: number | null;
    price: number | null;
    image?: string;
    sku?: string;
}

export default function ProductForm({ initialData, title, categories = [] }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State for images
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

    // Helper to parse SKU for attributes if missing
    const parseSkuForAttributes = (sku: string) => {
        const parts = sku.split('-');
        if (parts.length > 1) {
            // Simple heuristic: check common color names in parts
            const commonColors = ["Siyah", "Beyaz", "Kırmızı", "Mavi", "Yeşil", "Pembe", "Altın", "Gümüş", "Gri", "Bej", "Lacivert", "Bordo", "Kahverengi", "Turuncu", "Sarı", "Mor"];
            const foundColor = commonColors.find(c => sku.toLowerCase().includes(c.toLowerCase()));

            // Simple heuristic for sizes
            const commonSizes = ["Small", "Medium", "Large", "XL", "XXL", "Standart", "Nano", "Mini"];
            const foundSize = commonSizes.find(s => sku.toLowerCase().includes(s.toLowerCase()));

            return { color: foundColor || "", size: foundSize || "" };
        }
        return { color: "", size: "" };
    };

    // State for variants
    const [variants, setVariants] = useState<Variant[]>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData?.variants?.map((v: any) => {
            // Try to find attributes first
            let color = v.attributes?.find((a: any) => a.attributeValue.attribute.name === "Renk")?.attributeValue.value || "";
            let size = v.attributes?.find((a: any) => a.attributeValue.attribute.name === "Beden")?.attributeValue.value || "";

            // If attributes are missing, try to parse from SKU
            if (!color && !size && v.sku) {
                const parsed = parseSkuForAttributes(v.sku);
                if (!color) color = parsed.color;
                if (!size) size = parsed.size;
            }

            // Should also check if "Renk" is part of the value (e.g. "Siyah Renk") and normalize
            if (color && color.toLowerCase().endsWith(" renk")) {
                color = color.substring(0, color.length - 5).trim(); // Remove " Renk" suffix
                // Capitalize first letter
                color = color.charAt(0).toUpperCase() + color.slice(1);
            }

            return {
                id: v.id,
                color,
                size,
                stock: v.stock,
                price: Number(v.price),
                sku: v.sku,
                image: v.image
            };
        }) || [{ id: 1, color: "", size: "", stock: null, price: null }]
    );

    // State for selecting image for a specific variant
    const [selectingForVariant, setSelectingForVariant] = useState<number | string | null>(null);

    // Categories (Single select)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryId || "");

    const [mainPrice, setMainPrice] = useState(initialData?.basePrice || "");
    const isMockStock = !initialData?.variants?.length;
    const [mainStock, setMainStock] = useState(initialData?.stock || (isMockStock ? "" : 0));

    // Computed state for disabling main price/stock
    const hasVariantPrices = variants.some(v => v.price !== null && v.price > 0);
    const hasVariantStocks = variants.some(v => v.stock !== null && v.stock > 0);

    const handleImageUpload = () => {
        // Mock upload logic - in real app would upload to S3/Cloudinary
        const newImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDN7alVJYJImA_YeB77T8ihi8RpAgmepzTlPWfQ8qjShEHjRzuq_xHEZnWTxhC5yJ_-Cjm_aS4hyU_qrFwlqXwDVoAJOgwe1BiyluKCBsIWLRxcyF9bH3Bq8UTuXqu-CJr6p8REWkuLLIAscHN8NB-_OoOKOnjgd1tGAjaD-_cE-Ykvf-pHY5TFh3sfu5vY01Z2jKesMB_bPFkNj1tjJyc0Ru3ySq1jJUHU9QU6NL-5YNpeodii6aD5h3yoLTVqPmTtOFpEfCzvh7e2";
        setImages([...images, newImage]);
        setEditingImageIndex(images.length);
    };

    const handleEditorSave = (newUrl: string) => {
        if (editingImageIndex !== null) {
            const newImages = [...images];
            newImages[editingImageIndex] = newUrl;
            setImages(newImages);
            setEditingImageIndex(null);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { id: `temp-${Date.now()}`, color: "", size: "", stock: null, price: null }]);
    };

    const removeVariant = (id: number | string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id: number | string, field: keyof Variant, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const finalValue = value === "" ? null : value;
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: finalValue } : v));
    };

    const selectImageForVariant = (image: string) => {
        if (selectingForVariant !== null) {
            updateVariant(selectingForVariant, "image", image);
            setSelectingForVariant(null);
        }
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategoryId(catId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name: (e.target as any).name.value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (e.target as any).description.value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                brand: (e.target as any).brand.value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sku: (e.target as any).sku.value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: (e.target as any).status.value,
                price: mainPrice,
                stock: mainStock,
                categoryId: selectedCategoryId,
                images,
                variants
            };

            const result = await updateProduct(initialData?.id, formData);
            if (result.success) {
                router.push("/admin/urunler");
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-12 relative">
            {/* Image Editor Modal */}
            {editingImageIndex !== null && images[editingImageIndex] && (
                <ImageEditor
                    imageSrc={images[editingImageIndex]}
                    onSave={handleEditorSave}
                    onCancel={() => setEditingImageIndex(null)}
                />
            )}

            {/* Variant Image Selection Modal */}
            {selectingForVariant !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectingForVariant(null)}>
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Görsel Seç</h3>
                            <button type="button" onClick={() => setSelectingForVariant(null)} className="material-icons text-gray-400">close</button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} onClick={() => selectImageForVariant(img)} className="aspect-[3/4] relative cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-[#FF007F]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} className="w-full h-full object-cover" alt="Selection" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/urunler" className="text-sm text-gray-500 hover:text-[#FF007F] mb-2 inline-flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                        Ürünlere Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/urunler" className="px-6 py-3 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#FF007F] hover:bg-[#D6006B] transition-colors flex items-center gap-2 disabled:opacity-50">
                        {loading && <span className="material-icons animate-spin text-sm">refresh</span>}
                        Kaydet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827]">Temel Bilgiler</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                            <input name="name" defaultValue={initialData?.name} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]" placeholder="Örn: Sac de Jour Nano" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]" placeholder="Ürün açıklaması..." />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827]">Görseller</h2>
                        <div onClick={handleImageUpload} className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FF007F]/50 transition-colors cursor-pointer bg-gray-50">
                            <span className="material-icons text-4xl text-gray-300 mb-2">cloud_upload</span>
                            <p className="text-sm text-gray-500">Görsel yüklemek için tıklayın</p>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-[3/4]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} className="w-full h-full object-cover rounded-lg border border-gray-200" alt="Uploaded" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                        <button type="button" onClick={() => setEditingImageIndex(idx)} className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-[#FF007F] hover:text-white transition-colors">
                                            <span className="material-icons text-sm">edit</span>
                                        </button>
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111827]">Varyasyonlar</h2>
                            <button type="button" onClick={addVariant} className="text-sm text-[#FF007F] font-medium hover:underline flex items-center gap-1">
                                <span className="material-icons text-sm">add</span> Varyasyon Ekle
                            </button>
                        </div>
                        <div className="space-y-3">
                            {variants.map((variant) => (
                                <div key={variant.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                                    {/* Image */}
                                    <div className="col-span-1">
                                        <div
                                            onClick={() => setSelectingForVariant(variant.id)}
                                            className="w-full aspect-[3/4] bg-white border border-gray-200 rounded flex items-center justify-center cursor-pointer hover:border-[#FF007F] transition-colors relative group overflow-hidden"
                                        >
                                            {variant.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={variant.image} className="w-full h-full object-cover" alt="Variant" />
                                            ) : (
                                                <span className="material-icons text-gray-300 text-sm">image</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-10 grid grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Renk</label>
                                            <div className="relative">
                                                <input
                                                    list={`colors-${variant.id}`}
                                                    value={variant.color}
                                                    onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                                    placeholder="Seç veya Yaz"
                                                />
                                                <datalist id={`colors-${variant.id}`}>
                                                    <option value="Siyah">Siyah</option>
                                                    <option value="Beyaz">Beyaz</option>
                                                    <option value="Kırmızı">Kırmızı</option>
                                                    <option value="Altın">Altın</option>
                                                    <option value="Gümüş">Gümüş</option>
                                                    <option value="Mavi">Mavi</option>
                                                    <option value="Yeşil">Yeşil</option>
                                                    <option value="Pembe">Pembe</option>
                                                    <option value="Mor">Mor</option>
                                                    <option value="Gri">Gri</option>
                                                    <option value="Kahverengi">Kahverengi</option>
                                                    <option value="Bej">Bej</option>
                                                    <option value="Lacivert">Lacivert</option>
                                                    <option value="Bordo">Bordo</option>
                                                    <option value="Turuncu">Turuncu</option>
                                                    <option value="Sarı">Sarı</option>
                                                    <option value="Krem">Krem</option>
                                                    <option value="Vizon">Vizon</option>
                                                    <option value="Taba">Taba</option>
                                                    <option value="Haki">Haki</option>
                                                </datalist>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Beden</label>
                                            <div className="relative">
                                                <input
                                                    list={`sizes-${variant.id}`}
                                                    value={variant.size}
                                                    onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                                    placeholder="Seç veya Yaz"
                                                />
                                                <datalist id={`sizes-${variant.id}`}>
                                                    <option value="Standart">Standart</option>
                                                    <option value="Nano">Nano</option>
                                                    <option value="Mini">Mini</option>
                                                    <option value="Small">Small</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Large">Large</option>
                                                    <option value="XL">XL</option>
                                                </datalist>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fiyat (Opsiyonel)</label>
                                            <input
                                                type="number"
                                                value={variant.price || ""}
                                                onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                                placeholder="Ana Fiyat"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stok (Opsiyonel)</label>
                                            <input
                                                type="number"
                                                value={variant.stock || ""}
                                                onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-[#FF007F] focus:border-[#FF007F]"
                                                placeholder="Ana Stok"
                                            />
                                        </div>
                                    </div>
                                    {/* Delete */}
                                    <div className="col-span-1 flex justify-end pt-5">
                                        <button type="button" onClick={() => removeVariant(variant.id)} className="text-gray-400 hover:text-red-500"><span className="material-icons">delete</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827]">Kategoriler</h2>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedCategoryId === cat.id
                                        ? "bg-[#FF007F] text-white border-[#FF007F]"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-[#FF007F]"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing - Disabled if variants have price */}
                    <div className={`bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4 ${hasVariantPrices ? "opacity-60 grayscale pointer-events-none relative" : ""}`}>
                        {hasVariantPrices && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Varyasyon fiyatları aktif</span>
                            </div>
                        )}
                        <h2 className="text-lg font-bold text-[#111827]">Fiyatlandırma</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (TL)</label>
                            <input
                                value={mainPrice}
                                onChange={(e) => setMainPrice(e.target.value)}
                                type="number"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Stock - Disabled if variants have stock */}
                    <div className={`bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4 ${hasVariantStocks ? "opacity-60 grayscale pointer-events-none relative" : ""}`}>
                        {hasVariantStocks && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Varyasyon stoğu aktif</span>
                            </div>
                        )}
                        <h2 className="text-lg font-bold text-[#111827]">Stok Yönetimi</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                            <input
                                value={mainStock}
                                onChange={(e) => setMainStock(e.target.value)}
                                type="number"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827]">Durum</h2>
                        <select name="status" defaultValue={initialData?.isActive ? 'Aktif' : 'Pasif'} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]">
                            <option value="Aktif">Aktif</option>
                            <option value="Pasif">Pasif</option>
                            <option value="Taslak">Taslak</option>
                        </select>
                    </div>

                    {/* Organization Info */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827]">Organizasyon</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                            <select name="brand" defaultValue={initialData?.brand} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]">
                                <option>Seçiniz...</option>
                                <option value="Saint Laurent">Saint Laurent</option>
                                <option value="Gucci">Gucci</option>
                                <option value="Prada">Prada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input name="sku" defaultValue={initialData?.sku} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]" placeholder="Örn: SL-001" />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
