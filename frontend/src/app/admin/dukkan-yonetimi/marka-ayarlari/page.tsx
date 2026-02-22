"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "./actions";

interface Brand {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    productCount: number;
    createdAt: string;
}

export default function MarkaAyarlariPage() {
    const [activeTab, setActiveTab] = useState<"ekle" | "mevcut">("ekle");
    const [brandName, setBrandName] = useState("");
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);

    // Search
    const [searchTerm, setSearchTerm] = useState("");

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        const result = await getBrands(searchTerm || undefined);
        if (result.success && result.data) {
            setBrands(result.data);
        }
        setLoading(false);
    }, [searchTerm]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBrands();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchBrands]);

    // ─── HANDLERS ──────────────────────────────────

    const handleAddBrand = async () => {
        if (!brandName.trim() || saving) return;
        setSaving(true);
        const result = await createBrand(brandName);
        if (result.success) {
            showToast("Marka başarıyla eklendi!", "success");
            setBrandName("");
            await fetchBrands();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleDeleteBrand = async (id: string) => {
        setSaving(true);
        const result = await deleteBrand(id);
        if (result.success) {
            showToast("Marka başarıyla silindi!", "success");
            setDeleteConfirmId(null);
            await fetchBrands();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleStartEdit = (brand: Brand) => {
        setEditingId(brand.id);
        setEditName(brand.name);
        setEditIsActive(brand.isActive);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim() || saving) return;
        setSaving(true);
        const result = await updateBrand(id, editName, editIsActive);
        if (result.success) {
            showToast("Marka başarıyla güncellendi!", "success");
            setEditingId(null);
            setEditName("");
            await fetchBrands();
        } else {
            showToast(result.error || "Hata oluştu", "error");
        }
        setSaving(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditIsActive(true);
    };

    // Stats
    const totalProducts = brands.reduce((s, c) => s + c.productCount, 0);
    const activeBrands = brands.filter((c) => c.isActive).length;

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

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-red-500 text-2xl">
                                    warning
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#111827]">
                                    Marka Sil
                                </h3>
                                <p className="text-sm text-[#6B7280]">
                                    Bu işlem geri alınamaz
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-[#6B7280]">
                            Bu markayı silmek istediğinize emin misiniz? Markaya ait
                            ürünlerden marka bilgisi kaldırılacaktır.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleDeleteBrand(deleteConfirmId)}
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
                <span className="text-[#111827] font-medium">Marka Ayarları</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#111827]">Marka Ayarları</h1>
                <p className="text-sm text-[#6B7280] mt-1">
                    Ürünlerinize ait markaları yönetin
                </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab("ekle")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "ekle"
                        ? "bg-white text-[#FF007F] shadow-sm"
                        : "text-[#6B7280] hover:text-[#374151]"
                        }`}
                >
                    <span className="material-icons text-lg">add_circle</span>
                    Marka Ekleme
                </button>
                <button
                    onClick={() => setActiveTab("mevcut")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "mevcut"
                        ? "bg-white text-[#FF007F] shadow-sm"
                        : "text-[#6B7280] hover:text-[#374151]"
                        }`}
                >
                    <span className="material-icons text-lg">list</span>
                    Mevcut Markalar
                    <span className="bg-[#FF007F]/10 text-[#FF007F] text-xs font-bold px-2 py-0.5 rounded-full">
                        {brands.length}
                    </span>
                </button>
            </div>

            {/* MARKA EKLEME TAB */}
            {activeTab === "ekle" && (
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-[#FFF1F7] to-[#FFF8FB] rounded-xl border border-[#FFD6E8] p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#FF007F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-icons text-[#FF007F] text-2xl">
                                    info
                                </span>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-[#111827]">
                                    Marka Ekleme
                                </h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Dükkanınızda satışa sunduğunuz ürünlerinize ait markaları bu bölümden tanımlayabilirsiniz.
                                </p>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Dilediğiniz sayıda marka tanımlayabilirsiniz ve bir ürünü sadece bir markaya bağlayabilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add Brand Form */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-[#FF007F] text-xl">
                                    loyalty
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-[#111827]">
                                Yeni Marka Oluştur
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#374151]">
                                Marka Adı
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddBrand()
                                    }
                                    placeholder="Örn: Gucci, Prada, Zara..."
                                    className="flex-1 border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] transition-all outline-none"
                                />
                                <button
                                    onClick={handleAddBrand}
                                    disabled={!brandName.trim() || saving}
                                    className="flex items-center gap-2 bg-[#FF007F] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-icons text-xl">add</span>
                                    {saving ? "Ekleniyor..." : "Ekle"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MEVCUT MARKALAR TAB */}
            {activeTab === "mevcut" && (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FF007F]/10 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-[#FF007F]">
                                    loyalty
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#111827]">
                                    {brands.length}
                                </p>
                                <p className="text-xs text-[#9CA3AF]">Toplam Marka</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-green-600">
                                    inventory_2
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#111827]">
                                    {totalProducts}
                                </p>
                                <p className="text-xs text-[#9CA3AF]">Markalı Ürün</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-blue-600">
                                    trending_up
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#111827]">
                                    {activeBrands}
                                </p>
                                <p className="text-xs text-[#9CA3AF]">Aktif Marka</p>
                            </div>
                        </div>
                    </div>

                    {/* Brand List */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
                            <div className="flex items-center bg-[#F9FAFB] px-3 py-2 rounded-lg flex-1 max-w-xs">
                                <span className="material-icons text-[#9CA3AF] text-xl mr-2">
                                    search
                                </span>
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#9CA3AF] outline-none"
                                    placeholder="Marka ara..."
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#E5E7EB]">
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">
                                            Marka Adı
                                        </th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">
                                            Ürün Sayısı
                                        </th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">
                                            Oluşturulma Tarihi
                                        </th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">
                                            Durum
                                        </th>
                                        <th className="text-right text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">
                                            İşlem
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 border-2 border-[#FF007F] border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-sm text-[#9CA3AF]">
                                                        Yükleniyor...
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : brands.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <span className="material-icons text-4xl text-[#D1D5DB] mb-2">
                                                    loyalty
                                                </span>
                                                <p className="text-sm text-[#9CA3AF]">
                                                    {searchTerm
                                                        ? "Arama sonucu bulunamadı"
                                                        : "Henüz marka eklenmemiş"}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        brands.map((brand) => (
                                            <tr
                                                key={brand.id}
                                                className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                                            >
                                                {/* Brand Name */}
                                                <td className="px-6 py-4">
                                                    {editingId === brand.id ? (
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) =>
                                                                setEditName(e.target.value)
                                                            }
                                                            onKeyDown={(e) =>
                                                                e.key === "Enter" &&
                                                                handleSaveEdit(brand.id)
                                                            }
                                                            className="border border-[#FF007F] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#FF007F]/20 outline-none"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                                                                <span className="material-icons text-[#FF007F] text-sm">
                                                                    loyalty
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-[#111827]">
                                                                {brand.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Product Count */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#6B7280]">
                                                        {brand.productCount} ürün
                                                    </span>
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#6B7280]">
                                                        {brand.createdAt}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {editingId === brand.id ? (
                                                        <button
                                                            onClick={() =>
                                                                setEditIsActive(!editIsActive)
                                                            }
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsActive
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsActive
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                                    }`}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className={`text-xs font-bold px-3 py-1 rounded-full ${brand.isActive
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-600"
                                                                }`}
                                                        >
                                                            {brand.isActive
                                                                ? "Aktif"
                                                                : "Pasif"}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {editingId === brand.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleSaveEdit(brand.id)
                                                                    }
                                                                    disabled={saving}
                                                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-icons text-green-600 text-xl">
                                                                        check
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-icons text-[#6B7280] text-xl">
                                                                        close
                                                                    </span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleStartEdit(brand)
                                                                    }
                                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-icons text-[#6B7280] text-xl">
                                                                        edit
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteConfirmId(
                                                                            brand.id
                                                                        )
                                                                    }
                                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-icons text-red-400 text-xl">
                                                                        delete
                                                                    </span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
