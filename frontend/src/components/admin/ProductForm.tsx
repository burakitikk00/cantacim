"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageEditor from "./ImageEditor";
import { updateProduct, createProduct } from "@/app/admin/urunler/actions";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── TYPES ──────────────────────────────────────────────
interface AttributeValueItem {
    id: string;
    value: string;
    slug: string;
    colorCode?: string | null;
}

interface AttributeItem {
    id: string;
    name: string;
    slug: string;
    hasColor: boolean;
    values: AttributeValueItem[];
}

interface ProductFormProps {
    initialData?: any;
    title: string;
    categories?: { id: string; name: string }[];
    brands?: { id: string; name: string; slug: string }[];
    attributes?: AttributeItem[];
}

interface Variant {
    id: number | string;
    attributeValues: Record<string, string>; // attributeId -> attributeValueId
    stock: number | null;
    price: number | null;
    image?: string;
    sku?: string;
}

// ─── CUSTOM DROPDOWN ────────────────────────────────────
function CustomDropdown({
    label,
    value,
    options,
    onChange,
    placeholder = "Seçiniz...",
    required = false,
    renderOption,
}: {
    label?: string;
    value: string;
    options: { id: string; label: string; colorCode?: string | null }[];
    onChange: (id: string) => void;
    placeholder?: string;
    required?: boolean;
    renderOption?: (opt: { id: string; label: string; colorCode?: string | null }) => React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
    const selectedLabel = options.find(o => o.id === value)?.label;

    return (
        <div ref={ref} className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm text-left transition-all ${open
                    ? "border-[#FF007F] ring-2 ring-[#FF007F]/20 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                    } bg-white`}
            >
                <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
                    {selectedLabel || placeholder}
                </span>
                <span className={`material-icons text-gray-400 text-lg transition-transform ${open ? "rotate-180" : ""}`}>
                    expand_more
                </span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease]"
                    style={{ zIndex: 9999 }}
                >
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Ara..."
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border-none outline-none placeholder:text-gray-400"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">Sonuç bulunamadı</div>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { onChange(opt.id); setOpen(false); setSearch(""); }}
                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${value === opt.id
                                        ? "bg-[#FF007F]/5 text-[#FF007F] font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {renderOption ? renderOption(opt) : (
                                        <>
                                            {opt.colorCode && (
                                                <span className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0"
                                                    style={{ backgroundColor: opt.colorCode }} />
                                            )}
                                            <span>{opt.label}</span>
                                        </>
                                    )}
                                    {value === opt.id && <span className="material-icons text-[#FF007F] text-base ml-auto">check</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── STATUS BADGE ───────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        Aktif: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
        Taslak: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
        Pasif: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    };
    const c = config[status] || config.Taslak;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────
export default function ProductForm({
    initialData,
    title,
    categories = [],
    brands = [],
    attributes = [],
}: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    // ─── Images ─────────────────────────────────────
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Determine initial selected attributes from existing variants ───
    const getInitialAttributes = (): [string, string] => {
        if (!initialData?.variants?.length) return ["", ""];
        const attrIds = new Set<string>();
        for (const v of initialData.variants) {
            for (const a of (v.attributes || [])) {
                attrIds.add(a.attributeValue.attribute.id);
            }
        }
        const arr = Array.from(attrIds);
        return [arr[0] || "", arr[1] || ""];
    };

    const [selectedAttr1, setSelectedAttr1] = useState(getInitialAttributes()[0]);
    const [selectedAttr2, setSelectedAttr2] = useState(getInitialAttributes()[1]);

    // ─── Build variants from initialData with dynamic attributes ───
    const buildInitialVariants = (): Variant[] => {
        if (!initialData?.variants?.length) return [];
        return initialData.variants.map((v: any) => {
            const attributeValues: Record<string, string> = {};
            for (const a of (v.attributes || [])) {
                attributeValues[a.attributeValue.attribute.id] = a.attributeValue.id;
            }
            return {
                id: v.id,
                attributeValues,
                stock: v.stock,
                price: Number(v.price),
                sku: v.sku,
                image: v.image,
            };
        });
    };

    const [variants, setVariants] = useState<Variant[]>(buildInitialVariants());
    const [selectingForVariant, setSelectingForVariant] = useState<number | string | null>(null);

    // ─── Other form state ───────────────────────────
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || "");
    const [selectedBrandId, setSelectedBrandId] = useState(initialData?.brandId || "");
    const [mainPrice, setMainPrice] = useState(initialData?.basePrice ? String(initialData.basePrice) : "");
    const [mainStock, setMainStock] = useState(initialData?.variants?.length ? "" : "");
    const [status, setStatus] = useState(
        initialData ? (initialData.isActive ? "Aktif" : "Pasif") : "Taslak"
    );
    const [productName, setProductName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [baseSku, setBaseSku] = useState(initialData?.variants?.[0]?.sku?.split('-').slice(0, 2).join('-') || "");

    // ─── Validation ─────────────────────────────────
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showValidationModal, setShowValidationModal] = useState(false);

    // Computed
    const hasVariantPrices = variants.some(v => v.price !== null && v.price > 0);
    const hasVariantStocks = variants.some(v => v.stock !== null && v.stock > 0);
    const anyAttrSelected = selectedAttr1 !== "";
    const bothAttrsSelected = selectedAttr1 !== "" && selectedAttr2 !== "";

    // Get attribute objects
    const attr1 = attributes.find(a => a.id === selectedAttr1);
    const attr2 = attributes.find(a => a.id === selectedAttr2);

    // ─── IMAGE HANDLING ─────────────────────────────
    const [uploadingImages, setUploadingImages] = useState(false);

    // Client-side görsel sıkıştırma — kaliteyi bozmadan boyutu düşürür
    const compressImage = (file: File, maxWidth = 1200, maxHeight = 1600, quality = 0.85): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;

                // Oranı koruyarak boyutlandır
                if (w > maxWidth || h > maxHeight) {
                    const ratio = Math.min(maxWidth / w, maxHeight / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) { reject(new Error("Canvas context failed")); return; }

                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Blob creation failed"));
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = () => reject(new Error("Image load failed"));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingImages(true);

        try {
            for (let i = 0; i < files.length; i++) {
                // Sıkıştır
                const compressed = await compressImage(files[i]);

                const formData = new FormData();
                formData.append("file", compressed, `image-${Date.now()}-${i}.jpg`);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                if (result.success && result.url) {
                    setImages(prev => [...prev, result.url]);
                } else {
                    console.error("Upload failed:", result.error);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploadingImages(false);
        }
        e.target.value = "";
    };

    const handleEditorSave = (newUrl: string) => {
        if (editingImageIndex !== null) {
            const newImages = [...images];
            newImages[editingImageIndex] = newUrl;
            setImages(newImages);
            setEditingImageIndex(null);
        }
    };

    // ─── VARIANT HANDLERS ───────────────────────────
    const addVariant = () => {
        if (!anyAttrSelected) return;
        setVariants([...variants, {
            id: `temp-${Date.now()}`,
            attributeValues: {},
            stock: null,
            price: null,
        }]);
    };

    // ─── AUTO-GENERATE VARIANTS ─────────────────────
    const autoGenerateVariants = () => {
        if (!anyAttrSelected) return;
        const attr1Values = attr1?.values || [];
        const attr2Values = attr2?.values || [];

        const newVariants: Variant[] = [];

        if (bothAttrsSelected && attr2Values.length > 0) {
            // Kartezyen çarpım: attr1 x attr2
            for (const v1 of attr1Values) {
                for (const v2 of attr2Values) {
                    // Zaten var mı kontrol et
                    const exists = variants.some(v =>
                        v.attributeValues[attr1!.id] === v1.id &&
                        v.attributeValues[attr2!.id] === v2.id
                    );
                    if (!exists) {
                        newVariants.push({
                            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            attributeValues: {
                                [attr1!.id]: v1.id,
                                [attr2!.id]: v2.id,
                            },
                            stock: null,
                            price: null,
                        });
                    }
                }
            }
        } else {
            // Sadece attr1 değerleri
            for (const v1 of attr1Values) {
                const exists = variants.some(v =>
                    v.attributeValues[attr1!.id] === v1.id
                );
                if (!exists) {
                    newVariants.push({
                        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        attributeValues: {
                            [attr1!.id]: v1.id,
                        },
                        stock: null,
                        price: null,
                    });
                }
            }
        }

        if (newVariants.length > 0) {
            setVariants([...variants, ...newVariants]);
        }
    };

    const removeVariant = (id: number | string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariantField = (id: number | string, field: string, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value === "" ? null : value } : v));
    };

    const updateVariantAttribute = (variantId: number | string, attributeId: string, valueId: string) => {
        setVariants(variants.map(v => {
            if (v.id !== variantId) return v;
            return { ...v, attributeValues: { ...v.attributeValues, [attributeId]: valueId } };
        }));
    };

    const selectImageForVariant = (image: string) => {
        if (selectingForVariant !== null) {
            updateVariantField(selectingForVariant, "image", image);
            setSelectingForVariant(null);
        }
    };

    // ─── SKU AUTO-GENERATION ────────────────────────
    const generateSku = () => {
        const brandSlug = brands.find(b => b.id === selectedBrandId)?.slug?.toUpperCase().slice(0, 3) || "PRD";
        const catSlug = categories.find(c => c.id === selectedCategoryId)?.name?.toUpperCase().slice(0, 3) || "GEN";
        return `${brandSlug}-${catSlug}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    };

    useEffect(() => {
        if (!isEditMode && !baseSku) {
            if (selectedBrandId || selectedCategoryId) {
                setBaseSku(generateSku());
            }
        }
    }, [selectedBrandId, selectedCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── FORM SUBMIT ────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        // Validation
        const errors: string[] = [];
        if (!productName.trim()) errors.push("Ürün Adı zorunludur");
        if (!mainPrice && !hasVariantPrices) errors.push("Fiyat zorunludur");
        if (!selectedCategoryId) errors.push("Kategori seçimi zorunludur");

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationModal(true);
            return;
        }

        setLoading(true);

        try {
            const formData = {
                name: productName,
                description,
                brandId: selectedBrandId || null,
                sku: baseSku,
                status,
                price: mainPrice,
                stock: mainStock,
                categoryId: selectedCategoryId,
                images,
                variants: variants.map(v => ({
                    id: v.id,
                    sku: v.sku || baseSku,
                    price: v.price,
                    stock: v.stock,
                    image: v.image,
                    attributeValueIds: Object.values(v.attributeValues).filter(Boolean),
                })),
            };

            let result;
            if (isEditMode) {
                result = await updateProduct(initialData.id, formData);
            } else {
                result = await createProduct(formData);
            }

            if (result.success) {
                router.push("/admin/urunler");
            } else {
                setValidationErrors([result.error || "Bir hata oluştu"]);
                setShowValidationModal(true);
            }
        } catch (error) {
            console.error(error);
            setValidationErrors(["Beklenmeyen bir hata oluştu"]);
            setShowValidationModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-12 relative">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />

            {/* Image Editor Modal */}
            {editingImageIndex !== null && images[editingImageIndex] && (
                <ImageEditor
                    imageSrc={images[editingImageIndex]}
                    onSave={handleEditorSave}
                    onCancel={() => setEditingImageIndex(null)}
                />
            )}

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onClick={() => setShowValidationModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-red-500 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#111827]">Eksik Alanlar</h3>
                                <p className="text-sm text-gray-500">Lütfen zorunlu alanları doldurun</p>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {validationErrors.map((err, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                    <span className="material-icons text-base">error</span>
                                    {err}
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() => setShowValidationModal(false)}
                            className="w-full py-2.5 bg-[#FF007F] text-white rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}

            {/* Variant Image Selection Modal */}
            {selectingForVariant !== null && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setSelectingForVariant(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-[#111827]">Varyasyon Görseli Seç</h3>
                            <button type="button" onClick={() => setSelectingForVariant(null)} className="material-icons text-gray-400 hover:text-gray-600 transition-colors">close</button>
                        </div>
                        {images.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-icons text-5xl text-gray-300 mb-3">image</span>
                                <p className="text-sm text-gray-500 mb-4">Henüz görsel yüklenmemiş</p>
                                <button
                                    type="button"
                                    onClick={() => { setSelectingForVariant(null); fileInputRef.current?.click(); }}
                                    className="px-6 py-2.5 bg-[#FF007F] text-white rounded-lg text-sm font-medium hover:bg-[#D6006B] transition-colors"
                                >
                                    Görsel Yükle
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-3">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => selectImageForVariant(img)}
                                            className="aspect-[3/4] relative cursor-pointer group rounded-xl overflow-hidden border-2 border-transparent hover:border-[#FF007F] transition-all"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} className="w-full h-full object-cover" alt="Selection" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectingForVariant(null); fileInputRef.current?.click(); }}
                                    className="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF007F] hover:text-[#FF007F] transition-colors"
                                >
                                    + Yeni Görsel Yükle
                                </button>
                            </>
                        )}
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
                    <Link href="/admin/urunler" className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-[#FF007F] hover:bg-[#D6006B] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#FF007F]/20">
                        {loading && <span className="material-icons animate-spin text-sm">refresh</span>}
                        {isEditMode ? "Güncelle" : "Kaydet"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* ─── Basic Info ──────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-[#FF007F] text-lg">info</span>
                            </span>
                            Temel Bilgiler
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ürün Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                placeholder="Örn: Sac de Jour Nano"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none resize-none"
                                placeholder="Ürün açıklaması..."
                            />
                        </div>
                    </div>

                    {/* ─── Media ───────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-blue-600 text-lg">image</span>
                            </span>
                            Görseller
                        </h2>
                        <div
                            onClick={() => !uploadingImages && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#FF007F]/50 transition-all cursor-pointer bg-gray-50/50 group ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploadingImages ? (
                                <>
                                    <span className="material-icons text-4xl text-[#FF007F] mb-2 animate-spin">refresh</span>
                                    <p className="text-sm text-gray-500">Görseller yükleniyor...</p>
                                </>
                            ) : (
                                <>
                                    <span className="material-icons text-4xl text-gray-300 mb-2 group-hover:text-[#FF007F]/50 transition-colors">cloud_upload</span>
                                    <p className="text-sm text-gray-500">Görsel yüklemek için tıklayın veya sürükleyin</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (maks. 5MB)</p>
                                </>
                            )}
                        </div>
                        {images.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} className="w-full h-full object-cover" alt="Uploaded" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button type="button" onClick={() => setEditingImageIndex(idx)} className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-[#FF007F] hover:text-white transition-colors">
                                                <span className="material-icons text-sm">edit</span>
                                            </button>
                                            <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                <span className="material-icons text-sm">delete</span>
                                            </button>
                                        </div>
                                        {idx === 0 && (
                                            <span className="absolute top-2 left-2 bg-[#FF007F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ana</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Variation Attribute Selection ───────── */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-purple-600 text-lg">tune</span>
                            </span>
                            Varyasyon Özellikleri
                        </h2>
                        <p className="text-sm text-gray-500">Ürün varyasyonları için en az 1 özellik seçin (2. özellik opsiyoneldir)</p>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomDropdown
                                label="1. Özellik *"
                                value={selectedAttr1}
                                options={attributes.filter(a => a.id !== selectedAttr2).map(a => ({ id: a.id, label: a.name }))}
                                onChange={setSelectedAttr1}
                                placeholder="Özellik seçin..."
                                required
                            />
                            <CustomDropdown
                                label="2. Özellik (Opsiyonel)"
                                value={selectedAttr2}
                                options={[{ id: "", label: "— Seçim yok —" }, ...attributes.filter(a => a.id !== selectedAttr1).map(a => ({ id: a.id, label: a.name }))]}
                                onChange={(val) => setSelectedAttr2(val)}
                                placeholder="Opsiyonel..."
                            />
                        </div>

                        {anyAttrSelected && (
                            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                                <span className="material-icons text-sm">check_circle</span>
                                <span>
                                    <strong>{attr1?.name}</strong>
                                    {attr2 ? <> ve <strong>{attr2.name}</strong></> : null}
                                    {" "}seçildi — artık varyasyon ekleyebilirsiniz
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ─── Variants ────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                <span className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-amber-600 text-lg">layers</span>
                                </span>
                                Varyasyonlar
                                {variants.length > 0 && (
                                    <span className="bg-[#FF007F]/10 text-[#FF007F] text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                        {variants.length}
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={autoGenerateVariants}
                                    disabled={!anyAttrSelected}
                                    className="text-sm text-purple-600 font-medium hover:underline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <span className="material-icons text-sm">auto_fix_high</span> Oluştur
                                </button>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    disabled={!anyAttrSelected}
                                    className="text-sm text-[#FF007F] font-medium hover:underline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <span className="material-icons text-sm">add</span> Tekli Ekle
                                </button>
                            </div>
                        </div>

                        {!anyAttrSelected && variants.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                                <span className="material-icons text-4xl text-gray-300 mb-2">layers</span>
                                <p className="text-sm text-gray-500">Varyasyon eklemek için yukarıdan en az 1 özellik seçin</p>
                                <p className="text-xs text-gray-400 mt-1">Varyasyon eklenmezse ürün tek SKU ile kaydedilir</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {variants.map((variant, vIdx) => (
                                <div
                                    key={variant.id}
                                    className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all group"
                                >
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => removeVariant(variant.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <span className="material-icons text-lg">delete</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{vIdx + 1}</span>
                                    </div>

                                    <div className="grid grid-cols-12 gap-3">
                                        {/* Variant Image */}
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Görsel</label>
                                            <div
                                                onClick={() => setSelectingForVariant(variant.id)}
                                                className="w-full aspect-[3/4] bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#FF007F] transition-all relative group/img overflow-hidden"
                                            >
                                                {variant.image ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={variant.image} className="w-full h-full object-cover rounded-xl" alt="Variant" />
                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                            <span className="material-icons text-white text-sm">edit</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="material-icons text-gray-300 text-xl">add_photo_alternate</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attribute dropdowns */}
                                        <div className={`col-span-10 grid ${attr2 ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
                                            {attr1 && (
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{attr1.name}</label>
                                                    <CustomDropdown
                                                        value={variant.attributeValues[attr1.id] || ""}
                                                        options={attr1.values.map(v => ({
                                                            id: v.id,
                                                            label: v.value,
                                                            colorCode: v.colorCode
                                                        }))}
                                                        onChange={val => updateVariantAttribute(variant.id, attr1.id, val)}
                                                        placeholder="Seçin..."
                                                    />
                                                </div>
                                            )}
                                            {attr2 && (
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{attr2.name}</label>
                                                    <CustomDropdown
                                                        value={variant.attributeValues[attr2.id] || ""}
                                                        options={attr2.values.map(v => ({
                                                            id: v.id,
                                                            label: v.value,
                                                            colorCode: v.colorCode
                                                        }))}
                                                        onChange={val => updateVariantAttribute(variant.id, attr2.id, val)}
                                                        placeholder="Seçin..."
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fiyat (Opsiyonel)</label>
                                                <input
                                                    type="number"
                                                    value={variant.price ?? ""}
                                                    onChange={e => updateVariantField(variant.id, "price", e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                                    placeholder="Ana Fiyat"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stok (Opsiyonel)</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock ?? ""}
                                                    onChange={e => updateVariantField(variant.id, "stock", e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                                    placeholder="Ana Stok"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── SIDEBAR ───────────────────────────────── */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-emerald-600 text-lg">toggle_on</span>
                            </span>
                            Durum
                        </h2>
                        <div className="space-y-2">
                            {(["Aktif", "Taslak", "Pasif"] as const).map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${status === s
                                        ? s === "Aktif" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                            : s === "Taslak" ? "border-gray-300 bg-gray-100 text-gray-700"
                                                : "border-red-300 bg-red-50 text-red-600"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                >
                                    <span>{s}</span>
                                    {status === s ? (
                                        <StatusBadge status={s} />
                                    ) : (
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-indigo-600 text-lg">category</span>
                            </span>
                            Kategori <span className="text-red-500 text-sm">*</span>
                        </h2>
                        <CustomDropdown
                            value={selectedCategoryId}
                            options={categories.map(c => ({ id: c.id, label: c.name }))}
                            onChange={setSelectedCategoryId}
                            placeholder="Kategori seçin..."
                            required
                        />
                    </div>

                    {/* Pricing */}
                    <div className={`bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4 transition-all ${hasVariantPrices ? "opacity-50 pointer-events-none relative" : ""}`}>
                        {hasVariantPrices && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                                <span className="bg-gray-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">Varyasyon fiyatları aktif</span>
                            </div>
                        )}
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-green-600 text-lg">payments</span>
                            </span>
                            Fiyatlandırma <span className="text-red-500 text-sm">*</span>
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (TL)</label>
                            <input
                                value={mainPrice}
                                onChange={e => setMainPrice(e.target.value)}
                                type="number"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div className={`bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4 transition-all ${hasVariantStocks ? "opacity-50 pointer-events-none relative" : ""}`}>
                        {hasVariantStocks && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                                <span className="bg-gray-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">Varyasyon stoğu aktif</span>
                            </div>
                        )}
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-orange-600 text-lg">inventory</span>
                            </span>
                            Stok Yönetimi
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                            <input
                                value={mainStock}
                                onChange={e => setMainStock(e.target.value)}
                                type="number"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-rose-600 text-lg">business</span>
                            </span>
                            Organizasyon
                        </h2>
                        <CustomDropdown
                            label="Marka"
                            value={selectedBrandId}
                            options={brands.map(b => ({ id: b.id, label: b.name }))}
                            onChange={setSelectedBrandId}
                            placeholder="Marka seçin..."
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                                value={baseSku}
                                onChange={e => setBaseSku(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                placeholder="Otomatik oluşturulur veya girin"
                            />
                            {!baseSku && (
                                <button
                                    type="button"
                                    onClick={() => setBaseSku(generateSku())}
                                    className="mt-1 text-xs text-[#FF007F] hover:underline"
                                >
                                    Otomatik Oluştur
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
