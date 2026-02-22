"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    createAttributeValue,
    deleteAttributeValue,
    updateAttributeValueColor,
} from "./actions";

interface AttributeValueItem {
    id: string;
    value: string;
    slug: string;
    colorCode?: string | null;
    productCount: number;
}

interface AttributeItem {
    id: string;
    name: string;
    slug: string;
    hasColor: boolean;
    sortOrder: number;
    values: AttributeValueItem[];
    productCount: number;
}

export default function VaryasyonAyarlariPage() {
    const [attributes, setAttributes] = useState<AttributeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Create attribute
    const [showNewForm, setShowNewForm] = useState(false);
    const [newAttributeName, setNewAttributeName] = useState("");
    const [newAttributeHasColor, setNewAttributeHasColor] = useState(false);

    // Edit attribute
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editHasColor, setHasColor] = useState(false);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Add value input per attribute
    const [addingValueForId, setAddingValueForId] = useState<string | null>(null);
    const [newValueText, setNewValueText] = useState("");

    // Delete value confirmation
    const [deleteValueConfirm, setDeleteValueConfirm] = useState<{
        id: string;
        value: string;
        productCount: number;
    } | null>(null);

    // Toast
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ─── DATA FETCHING ─────────────────────────────

    const fetchAttributes = useCallback(async () => {
        setLoading(true);
        const result = await getAttributes();
        if (result.success && result.data) {
            setAttributes(result.data);
            // Auto-expand first attribute
            if (result.data.length > 0 && !expandedId) {
                setExpandedId(result.data[0].id);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    // ─── HANDLERS ──────────────────────────────────

    const handleCreateAttribute = async () => {
        if (!newAttributeName.trim() || saving) return;
        setSaving(true);
        const result = await createAttribute(newAttributeName, newAttributeHasColor);
        if (result.success) {
            showToast("Özellik başarıyla eklendi!", "success");
            setNewAttributeName("");
            setNewAttributeHasColor(false);
            setShowNewForm(false);
            await fetchAttributes();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleStartEdit = (attr: AttributeItem) => {
        setEditingId(attr.id);
        setEditName(attr.name);
        setHasColor(attr.hasColor);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim() || saving) return;
        setSaving(true);
        const result = await updateAttribute(id, editName, editHasColor);
        if (result.success) {
            showToast("Özellik başarıyla güncellendi!", "success");
            setEditingId(null);
            setEditName("");
            setHasColor(false);
            await fetchAttributes();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setHasColor(false);
    };

    const handleDeleteAttribute = async (id: string) => {
        setSaving(true);
        const result = await deleteAttribute(id);
        if (result.success) {
            showToast("Özellik başarıyla silindi!", "success");
            setDeleteConfirmId(null);
            await fetchAttributes();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleAddValue = async (attributeId: string) => {
        if (!newValueText.trim() || saving) return;
        setSaving(true);
        const result = await createAttributeValue(attributeId, newValueText);
        if (result.success) {
            showToast("Değer başarıyla eklendi!", "success");
            setNewValueText("");
            setAddingValueForId(null);
            await fetchAttributes();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleDeleteValue = async (id: string) => {
        setSaving(true);
        const result = await deleteAttributeValue(id);
        if (result.success) {
            showToast("Değer başarıyla silindi!", "success");
            setDeleteValueConfirm(null);
            await fetchAttributes();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleUpdateColor = async (id: string, colorCode: string) => {
        const result = await updateAttributeValueColor(id, colorCode);
        if (result.success) {
            // Updating without loading overlay to make the picker feel responsive
            const newAttrs = await getAttributes();
            if (newAttrs.success && newAttrs.data) {
                setAttributes(newAttrs.data);
            }
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
    };

    // Stats
    const totalValues = attributes.reduce((s, a) => s + a.values.length, 0);
    const totalProductUsage = attributes.reduce((s, a) => s + a.productCount, 0);

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-[fadeIn_0.2s_ease] ${toast.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    <span className="material-icons text-lg">
                        {toast.type === "success" ? "check_circle" : "error"}
                    </span>
                    {toast.message}
                </div>
            )}

            {/* Delete Attribute Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-red-500 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#111827]">Özellik Sil</h3>
                                <p className="text-sm text-[#6B7280]">Bu işlem geri alınamaz</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#6B7280]">
                            Bu özelliği ve tüm değerlerini silmek istediğinize emin misiniz?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleDeleteAttribute(deleteConfirmId)}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Value Confirmation Modal */}
            {deleteValueConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-red-500 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#111827]">Değer Sil</h3>
                                <p className="text-sm text-[#6B7280]">
                                    &ldquo;{deleteValueConfirm.value}&rdquo; silinecek
                                </p>
                            </div>
                        </div>
                        {deleteValueConfirm.productCount > 0 && (
                            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                ⚠️ Bu değer {deleteValueConfirm.productCount} üründe kullanılıyor. Önce ürünlerden kaldırmanız gerekiyor.
                            </p>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteValueConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleDeleteValue(deleteValueConfirm.id)}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <span>Dükkan Yönetimi</span>
                <span className="material-icons text-sm">chevron_right</span>
                <span className="text-[#111827] font-medium">Varyasyon Ayarları</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Varyasyon Ayarları</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Ürün özelliklerini ve varyasyon değerlerini yönetin</p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 bg-[#FF007F] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors"
                >
                    <span className="material-icons text-xl">add</span>
                    Yeni Özellik
                </button>
            </div>

            {/* New Attribute Form */}
            {showNewForm && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                            <span className="material-icons text-[#FF007F] text-xl">add_circle</span>
                        </div>
                        <h2 className="text-lg font-bold text-[#111827]">Yeni Özellik Oluştur</h2>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newAttributeName}
                            onChange={(e) => setNewAttributeName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateAttribute()}
                            placeholder="Örn: Renk, Beden, Materyal..."
                            className="flex-1 border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateAttribute}
                            disabled={!newAttributeName.trim() || saving}
                            className="flex items-center gap-2 bg-[#FF007F] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-icons text-xl">add</span>
                            {saving ? "Ekleniyor..." : "Ekle"}
                        </button>
                        <button
                            onClick={() => {
                                setShowNewForm(false);
                                setNewAttributeName("");
                            }}
                            className="px-4 py-3 text-sm font-medium text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Toplam Özellik", value: attributes.length.toString(), icon: "tune", color: "bg-[#FF007F]/10 text-[#FF007F]" },
                    { label: "Toplam Değer", value: totalValues.toString(), icon: "label", color: "bg-blue-50 text-blue-600" },
                    { label: "Kullanılan Ürün", value: totalProductUsage.toString(), icon: "inventory_2", color: "bg-green-50 text-green-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                            <span className="material-icons">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#111827]">{s.value}</p>
                            <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attribute Cards */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[#FF007F] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#9CA3AF]">Yükleniyor...</p>
                    </div>
                ) : attributes.length === 0 ? (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 flex flex-col items-center gap-2">
                        <span className="material-icons text-4xl text-[#D1D5DB]">tune</span>
                        <p className="text-sm text-[#9CA3AF]">Henüz özellik eklenmemiş</p>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="mt-2 text-sm text-[#FF007F] font-medium hover:underline"
                        >
                            İlk özelliğinizi ekleyin →
                        </button>
                    </div>
                ) : (
                    attributes.map((attr) => (
                        <div key={attr.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                            <button
                                onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-[#F9FAFB] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                                        <span className="material-icons text-[#FF007F] text-xl">tune</span>
                                    </div>
                                    <div className="text-left">
                                        {editingId === attr.id ? (
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSaveEdit(attr.id);
                                                        if (e.key === "Escape") handleCancelEdit();
                                                    }}
                                                    className="border border-[#FF007F] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 outline-none"
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-1.5 ml-2">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-[#D1D5DB] text-[#FF007F] focus:ring-[#FF007F]"
                                                        checked={editHasColor}
                                                        onChange={(e) => setHasColor(e.target.checked)}
                                                    />
                                                    <label className="text-sm shrink-0">Renk paleti etkinleştir</label>
                                                </div>
                                                <button
                                                    onClick={() => handleSaveEdit(attr.id)}
                                                    disabled={saving}
                                                    className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <span className="material-icons text-green-600 text-xl">check</span>
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <span className="material-icons text-[#6B7280] text-xl">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-sm font-bold text-[#111827]">{attr.name}</h3>
                                                <p className="text-xs text-[#9CA3AF]">
                                                    {attr.values.length} değer · {attr.productCount} üründe kullanılıyor
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {editingId !== attr.id && (
                                        <>
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEdit(attr);
                                                }}
                                            >
                                                <span className="material-icons text-[#6B7280] text-xl">edit</span>
                                            </button>
                                            <button
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmId(attr.id);
                                                }}
                                            >
                                                <span className="material-icons text-red-400 text-xl">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <span className={`material-icons text-[#9CA3AF] transition-transform ${expandedId === attr.id ? "rotate-180" : ""}`}>expand_more</span>
                                </div>
                            </button>
                            {expandedId === attr.id && (
                                <div className="px-6 pb-6 border-t border-[#F3F4F6]">
                                    <div className="pt-4 flex flex-wrap gap-2 items-center">
                                        {attr.values.map((v) => (
                                            <div key={v.id} className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] text-sm pl-4 pr-2 py-1.5 rounded-full">
                                                {attr.hasColor && (
                                                    <div className="relative size-5 rounded-full border border-gray-300 overflow-hidden cursor-pointer mr-2 shrink-0">
                                                        <input
                                                            type="color"
                                                            value={v.colorCode || "#CCCCCC"}
                                                            onChange={(e) => handleUpdateColor(v.id, e.target.value)}
                                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] cursor-pointer"
                                                        />
                                                    </div>
                                                )}
                                                <span>{v.value}</span>
                                                {v.productCount > 0 && (
                                                    <span className="text-xs text-[#9CA3AF] ml-1">({v.productCount})</span>
                                                )}
                                                <button
                                                    className="ml-1 text-[#9CA3AF] hover:text-red-500 transition-colors p-1"
                                                    onClick={() =>
                                                        setDeleteValueConfirm({
                                                            id: v.id,
                                                            value: v.value,
                                                            productCount: v.productCount,
                                                        })
                                                    }
                                                >
                                                    <span className="material-icons text-[16px] block">close</span>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add value inline */}
                                        {addingValueForId === attr.id ? (
                                            <div className="inline-flex items-center gap-1 border border-[#FF007F] rounded-full px-3 py-1">
                                                <input
                                                    type="text"
                                                    value={newValueText}
                                                    onChange={(e) => setNewValueText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAddValue(attr.id);
                                                        if (e.key === "Escape") {
                                                            setAddingValueForId(null);
                                                            setNewValueText("");
                                                        }
                                                    }}
                                                    placeholder="Yeni değer..."
                                                    className="text-sm border-none outline-none bg-transparent w-24"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleAddValue(attr.id)}
                                                    disabled={!newValueText.trim() || saving}
                                                    className="text-[#FF007F] hover:text-[#D6006B] disabled:opacity-50"
                                                >
                                                    <span className="material-icons text-sm">check</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAddingValueForId(null);
                                                        setNewValueText("");
                                                    }}
                                                    className="text-[#9CA3AF] hover:text-[#6B7280]"
                                                >
                                                    <span className="material-icons text-sm">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setAddingValueForId(attr.id);
                                                    setNewValueText("");
                                                }}
                                                className="inline-flex items-center gap-1 border border-dashed border-[#D1D5DB] text-[#9CA3AF] text-sm px-4 py-2 rounded-full hover:border-[#FF007F] hover:text-[#FF007F] transition-colors"
                                            >
                                                <span className="material-icons text-sm">add</span>
                                                Değer Ekle
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
