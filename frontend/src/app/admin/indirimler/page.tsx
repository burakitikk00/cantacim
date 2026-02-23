"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon,
    getCategoriesForSelect,
    getProductsForSelect,
    getUsersForSelect,
} from "./actions";

/* ─── TYPES ──────────────────────────────────────────── */
interface CategoryOption { id: string; name: string }
interface ProductOption { id: string; name: string; price: number; image: string | null }
interface UserOption { id: string; name: string | null; surname: string | null; email: string; tier: string }
interface CouponRow {
    id: string; name: string; code: string; description: string | null;
    discountType: string; discountValue: number; discountMethod: string;
    scope: string; minOrderTotal: number | null; maxUses: number | null;
    usedCount: number; isActive: boolean; validFrom: string; validUntil: string | null;
    buyX: number | null; getY: number | null; targetTier: string | null;
    targetUserId: string | null; targetUser: { id: string; name: string | null; surname: string | null; email: string } | null;
    minRequirement: string | null; minReqValue: number | null;
    categories: { id: string; name: string }[]; products: { id: string; name: string }[];
    createdAt: string;
}

const DISCOUNT_METHODS = [
    { value: "AUTO", label: "Otomatik İndirim" },
    { value: "CODE", label: "İndirim Kodu" },
    { value: "TIER", label: "Müşteri Çeşidi Seçimi" },
    { value: "USER", label: "Müşteri Seçimi" },
];

const DISCOUNT_TYPES_MAP: Record<string, { value: string; label: string }[]> = {
    AUTO: [
        { value: "PERCENTAGE", label: "Yüzdesel İndirim" },
        { value: "FIXED", label: "Sabit Tutar İndirimi" },
        { value: "BUY_X_GET_Y", label: "X Al Y Edin" },
        { value: "FREE_SHIPPING", label: "Ücretsiz Kargo" },
    ],
    CODE: [
        { value: "PERCENTAGE", label: "Yüzdesel İndirim" },
        { value: "FIXED", label: "Sabit Tutar İndirimi" },
        { value: "FREE_SHIPPING", label: "Ücretsiz Kargo" },
    ],
    TIER: [
        { value: "PERCENTAGE", label: "Yüzdesel İndirim" },
        { value: "FIXED", label: "Sabit Tutar İndirimi" },
        { value: "BUY_X_GET_Y", label: "X Al Y Edin" },
        { value: "FREE_SHIPPING", label: "Ücretsiz Kargo" },
    ],
    USER: [
        { value: "PERCENTAGE", label: "Yüzdesel İndirim" },
        { value: "FIXED", label: "Sabit Tutar İndirimi" },
        { value: "BUY_X_GET_Y", label: "X Al Y Edin" },
        { value: "FREE_SHIPPING", label: "Ücretsiz Kargo" },
    ],
};

const TIER_LABELS: Record<string, string> = {
    STANDARD: "Standart",
    ELITE: "Elit",
    PLATINUM: "Platinum",
};

const SCOPE_OPTIONS = [
    { value: "ALL", label: "Tüm Ürünler" },
    { value: "CATEGORIES", label: "Belirli Kategoriler" },
    { value: "PRODUCTS", label: "Belirli Ürünler" },
    { value: "CATEGORIES_AND_PRODUCTS", label: "Belirli Kategori ve Ürünler" },
];

/* ─── DEFAULT FORM STATE ─────────────────────────────── */
const defaultForm = {
    name: "", code: "", description: "", discountType: "PERCENTAGE",
    discountValue: "", discountMethod: "AUTO", scope: "ALL",
    minOrderTotal: "", maxUses: "", validFrom: "", validUntil: "",
    isActive: true, buyX: "", getY: "", targetTier: "",
    targetUserId: "", minRequirement: "", minReqValue: "",
};

export default function DiscountsPage() {
    // ── Data State
    const [coupons, setCoupons] = useState<CouponRow[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Form State
    const [form, setForm] = useState(defaultForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Table State
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PASSIVE">("ALL");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // ── Fetch Data
    const loadData = useCallback(async () => {
        setLoading(true);
        const [cRes, catRes, prodRes, userRes] = await Promise.all([
            getCoupons(),
            getCategoriesForSelect(),
            getProductsForSelect(),
            getUsersForSelect(),
        ]);
        if (cRes.success) setCoupons(cRes.data as CouponRow[]);
        if (catRes.success) setCategories(catRes.data as CategoryOption[]);
        if (prodRes.success) setProducts(prodRes.data as ProductOption[]);
        if (userRes.success) setUsers(userRes.data as UserOption[]);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Product search
    useEffect(() => {
        const t = setTimeout(async () => {
            const res = await getProductsForSelect(productSearch || undefined);
            if (res.success) setProducts(res.data as ProductOption[]);
        }, 300);
        return () => clearTimeout(t);
    }, [productSearch]);

    // ── User search
    useEffect(() => {
        const t = setTimeout(async () => {
            const res = await getUsersForSelect(userSearch || undefined);
            if (res.success) setUsers(res.data as UserOption[]);
        }, 300);
        return () => clearTimeout(t);
    }, [userSearch]);

    // ── Form Helpers
    const updateField = (field: string, value: string | boolean) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            // Reset type when method changes
            if (field === "discountMethod") {
                const types = DISCOUNT_TYPES_MAP[value as string] || [];
                next.discountType = types[0]?.value || "PERCENTAGE";
                if (value !== "TIER") next.targetTier = "";
                if (value !== "USER") next.targetUserId = "";
            }
            // Reset BUY_X_GET_Y fields when type changes
            if (field === "discountType") {
                if (value !== "BUY_X_GET_Y") { next.buyX = ""; next.getY = ""; }
                if (value === "FREE_SHIPPING" || value === "BUY_X_GET_Y") next.discountValue = "";
            }
            if (field === "scope") {
                if (value === "ALL") { setSelectedCategories([]); setSelectedProducts([]); }
            }
            return next;
        });
    };

    const resetForm = () => {
        setForm(defaultForm);
        setEditId(null);
        setSelectedCategories([]);
        setSelectedProducts([]);
        setMessage(null);
    };

    const loadEdit = (c: CouponRow) => {
        setEditId(c.id);
        setForm({
            name: c.name, code: c.code, description: c.description || "",
            discountType: c.discountType, discountValue: c.discountValue ? String(c.discountValue) : "",
            discountMethod: c.discountMethod, scope: c.scope,
            minOrderTotal: c.minOrderTotal ? String(c.minOrderTotal) : "",
            maxUses: c.maxUses ? String(c.maxUses) : "",
            validFrom: c.validFrom ? c.validFrom.slice(0, 16) : "",
            validUntil: c.validUntil ? c.validUntil.slice(0, 16) : "",
            isActive: c.isActive,
            buyX: c.buyX ? String(c.buyX) : "", getY: c.getY ? String(c.getY) : "",
            targetTier: c.targetTier || "", targetUserId: c.targetUserId || "",
            minRequirement: c.minRequirement || "", minReqValue: c.minReqValue ? String(c.minReqValue) : "",
        });
        setSelectedCategories(c.categories.map((x) => x.id));
        setSelectedProducts(c.products.map((x) => x.id));
        setOpenMenuId(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Submit
    const handleSubmit = async () => {
        setSubmitting(true);
        setMessage(null);
        const payload = {
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description || undefined,
            discountType: form.discountType as "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y" | "FREE_SHIPPING",
            discountValue: form.discountValue ? Number(form.discountValue) : 0,
            discountMethod: form.discountMethod as "AUTO" | "CODE" | "TIER" | "USER",
            scope: form.scope as "ALL" | "CATEGORIES" | "PRODUCTS" | "CATEGORIES_AND_PRODUCTS",
            minOrderTotal: form.minOrderTotal ? Number(form.minOrderTotal) : null,
            maxUses: form.maxUses ? Number(form.maxUses) : null,
            validFrom: form.validFrom || undefined,
            validUntil: form.validUntil || null,
            isActive: form.isActive,
            buyX: form.buyX ? Number(form.buyX) : null,
            getY: form.getY ? Number(form.getY) : null,
            targetTier: (form.targetTier || null) as "STANDARD" | "ELITE" | "PLATINUM" | null,
            targetUserId: form.targetUserId || null,
            minRequirement: (form.minRequirement || null) as "MIN_TOTAL" | "MIN_QUANTITY" | null,
            minReqValue: form.minReqValue ? Number(form.minReqValue) : null,
            categoryIds: selectedCategories,
            productIds: selectedProducts,
        };

        const res = editId
            ? await updateCoupon(editId, payload)
            : await createCoupon(payload);

        if (res.success) {
            setMessage({ type: "success", text: editId ? "Kupon güncellendi!" : "Kupon oluşturuldu!" });
            resetForm();
            await loadData();
        } else {
            setMessage({ type: "error", text: res.error || "Bir hata oluştu." });
        }
        setSubmitting(false);
    };

    // ── Toggle / Delete
    const handleToggle = async (id: string) => {
        const res = await toggleCouponStatus(id);
        if (res.success) await loadData();
        setOpenMenuId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
        const res = await deleteCoupon(id);
        if (res.success) {
            await loadData();
        } else {
            setMessage({ type: "error", text: res.error || "Silinemedi." });
        }
        setOpenMenuId(null);
    };

    // ── Derived
    const typeOptions = DISCOUNT_TYPES_MAP[form.discountMethod] || [];
    const showCodeInput = form.discountMethod === "CODE";
    const showAmountInput = form.discountType === "PERCENTAGE" || form.discountType === "FIXED";
    const showBuyXGetY = form.discountType === "BUY_X_GET_Y";
    const showTierSelect = form.discountMethod === "TIER";
    const showUserSelect = form.discountMethod === "USER";
    const showCategorySelection = form.scope === "CATEGORIES" || form.scope === "CATEGORIES_AND_PRODUCTS";
    const showProductSelection = form.scope === "PRODUCTS" || form.scope === "CATEGORIES_AND_PRODUCTS";
    const showMinReqValue = form.minRequirement !== "" && form.minRequirement !== null;

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredCoupons = coupons.filter((c) => {
        if (filter === "ACTIVE") return c.isActive;
        if (filter === "PASSIVE") return !c.isActive;
        return true;
    });

    const toggleCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };
    const toggleProduct = (id: string) => {
        setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const fmtDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const discountLabel = (c: CouponRow) => {
        if (c.discountType === "BUY_X_GET_Y") return `${c.buyX} Al ${c.getY} Edin`;
        if (c.discountType === "FREE_SHIPPING") return "Ücretsiz Kargo";
        if (c.discountType === "PERCENTAGE") return `%${c.discountValue} İndirim`;
        return `₺${c.discountValue} İndirim`;
    };

    const methodLabel = (m: string) => DISCOUNT_METHODS.find((dm) => dm.value === m)?.label || m;

    /* ═══════════════════════════════════════════════════ */
    /*                      RENDER                       */
    /* ═══════════════════════════════════════════════════ */

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#FF007F] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">İndirimler</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Kampanya ve indirim kuponlarını buradan yönetebilirsiniz.</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    <span className="material-icons text-lg">{message.type === "success" ? "check_circle" : "error"}</span>
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left: Form ── */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-[#111827]">
                                {editId ? "İndirim Düzenle" : "İndirim Tanımla"}
                            </h2>
                            {editId && (
                                <button onClick={resetForm} className="text-sm text-[#6B7280] hover:text-[#FF007F] flex items-center gap-1 transition-colors">
                                    <span className="material-icons text-sm">add</span>
                                    Yeni Oluştur
                                </button>
                            )}
                        </div>

                        {/* İndirim Adı */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Adı</label>
                            <input
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                placeholder="Örn: Yaz Kampanyası 2024"
                            />
                        </div>

                        {/* Method & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Yöntemi</label>
                                <select
                                    value={form.discountMethod}
                                    onChange={(e) => updateField("discountMethod", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {DISCOUNT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {form.discountMethod === "AUTO" && "Müşterilerin sepetine otomatik uygulanır."}
                                    {form.discountMethod === "CODE" && "Müşteriler ödeme ekranında kodu girmelidir."}
                                    {form.discountMethod === "TIER" && "Belirli müşteri seviyesine özel uygulanır."}
                                    {form.discountMethod === "USER" && "Seçilen müşteriye özel uygulanır."}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Tipi</label>
                                <select
                                    value={form.discountType}
                                    onChange={(e) => updateField("discountType", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {typeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tier Selection */}
                        {showTierSelect && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Müşteri Seviyesi</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["STANDARD", "ELITE", "PLATINUM"] as const).map((tier) => (
                                        <div
                                            key={tier}
                                            onClick={() => updateField("targetTier", tier)}
                                            className={`cursor-pointer px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${form.targetTier === tier
                                                ? "bg-[#FF007F] text-white border-[#FF007F] shadow-lg shadow-pink-200"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-[#FF007F] hover:text-[#FF007F]"
                                                }`}
                                        >
                                            <span className="material-icons text-sm">
                                                {tier === "STANDARD" ? "person" : tier === "ELITE" ? "star" : "diamond"}
                                            </span>
                                            {TIER_LABELS[tier]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Sadece seçili seviyedeki müşteriler bu indirimi görecek.
                                </p>
                            </div>
                        )}

                        {/* User Selection */}
                        {showUserSelect && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Müşteri Seçin</label>
                                <div className="relative mb-3">
                                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Müşteri ara (isim, e-posta)..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {users.map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => updateField("targetUserId", u.id)}
                                            className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3 ${form.targetUserId === u.id
                                                ? "bg-white border-[#FF007F] ring-2 ring-[#FF007F]/20"
                                                : "bg-white border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${form.targetUserId === u.id ? "bg-[#FF007F] text-white" : "bg-gray-100 text-gray-500"}`}>
                                                {(u.name || u.email)[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {u.name} {u.surname}
                                                </p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.tier === "ELITE" ? "bg-[#FF007F]/10 text-[#FF007F]" : u.tier === "PLATINUM" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                                                {TIER_LABELS[u.tier] || u.tier}
                                            </span>
                                        </div>
                                    ))}
                                    {users.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">Müşteri bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Code Input */}
                        {showCodeInput && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Kodu</label>
                                <input
                                    value={form.code}
                                    onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono uppercase tracking-wider bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                    placeholder="Örn: YAZ2024"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateField("code", "CODE-" + Math.random().toString(36).substring(2, 8).toUpperCase())}
                                    className="text-xs text-[#FF007F] mt-2 font-medium hover:underline"
                                >
                                    Rastgele Kod Oluştur
                                </button>
                            </div>
                        )}

                        {/* Auto-generate code for non-CODE methods */}
                        {!showCodeInput && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kupon Kodu</label>
                                <div className="flex gap-2">
                                    <input
                                        value={form.code}
                                        onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono uppercase tracking-wider bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                        placeholder="Otomatik oluştur veya gir"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateField("code", "AUTO-" + Math.random().toString(36).substring(2, 8).toUpperCase())}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                                    >
                                        Otomatik
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Amount Input */}
                        {showAmountInput && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Değeri</label>
                                <div className="relative">
                                    <input
                                        value={form.discountValue}
                                        onChange={(e) => updateField("discountValue", e.target.value)}
                                        type="number"
                                        min="0"
                                        max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all pr-12"
                                        placeholder={form.discountType === "PERCENTAGE" ? "Örn: 20" : "Örn: 100"}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold text-sm">
                                            {form.discountType === "PERCENTAGE" ? "%" : "TL"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BUY X GET Y */}
                        {showBuyXGetY && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">X Al Y Edin</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">X (Al)</label>
                                        <input
                                            value={form.buyX}
                                            onChange={(e) => updateField("buyX", e.target.value)}
                                            type="number"
                                            min="2"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                            placeholder="Örn: 3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Y (Öde)</label>
                                        <input
                                            value={form.getY}
                                            onChange={(e) => updateField("getY", e.target.value)}
                                            type="number"
                                            min="1"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                            placeholder="Örn: 2"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {form.buyX && form.getY
                                        ? `Müşteri ${form.buyX} ürün alınca ${form.getY} ürün öder, ${Number(form.buyX) - Number(form.getY)} ürün hediye!`
                                        : "Adet değerlerini girin."}
                                </p>
                            </div>
                        )}

                        {/* Kupon Adeti */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kupon Adeti (Kullanım Limiti)</label>
                            <input
                                value={form.maxUses}
                                onChange={(e) => updateField("maxUses", e.target.value)}
                                type="number"
                                min="1"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                placeholder="Boş bırakırsanız sınırsız"
                            />
                            <p className="text-xs text-gray-400 mt-1">Toplam kaç kez kullanılabilir.</p>
                        </div>

                        {/* Scope */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Uygulanacak Ürünler</label>
                            <select
                                value={form.scope}
                                onChange={(e) => updateField("scope", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all appearance-none cursor-pointer"
                            >
                                {SCOPE_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Selection */}
                        {showCategorySelection && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Kategorileri Seçin</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`cursor-pointer px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-between ${selectedCategories.includes(cat.id)
                                                ? "bg-[#FF007F] text-white border-[#FF007F]"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-[#FF007F]"
                                                }`}
                                        >
                                            {cat.name}
                                            {selectedCategories.includes(cat.id) && <span className="material-icons text-sm">check</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Selection */}
                        {showProductSelection && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Ürünleri Seçin</label>
                                <div className="relative mb-4">
                                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Ürün ara..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                    />
                                </div>
                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-4 ${selectedProducts.includes(product.id)
                                                ? "bg-white border-[#FF007F] ring-2 ring-[#FF007F]/20"
                                                : "bg-white border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedProducts.includes(product.id) ? "bg-[#FF007F] border-[#FF007F]" : "border-gray-300"}`}>
                                                {selectedProducts.includes(product.id) && <span className="material-icons text-white text-xs">check</span>}
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {product.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.price.toLocaleString("tr-TR")} TL</p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">Ürün bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Minimum Requirements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Koşul</label>
                                <select
                                    value={form.minRequirement}
                                    onChange={(e) => updateField("minRequirement", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Yok</option>
                                    <option value="MIN_TOTAL">Minimum Alışveriş Tutarı</option>
                                    <option value="MIN_QUANTITY">Minimum Ürün Adedi</option>
                                </select>
                            </div>
                            {showMinReqValue && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Koşul Değeri</label>
                                    <input
                                        value={form.minReqValue}
                                        onChange={(e) => updateField("minReqValue", e.target.value)}
                                        type="number"
                                        min="0"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                        placeholder={form.minRequirement === "MIN_TOTAL" ? "TL Tutar" : "Adet"}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Dates & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Başlangıç Tarihi</label>
                                <input
                                    type="datetime-local"
                                    value={form.validFrom}
                                    onChange={(e) => updateField("validFrom", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bitiş Tarihi</label>
                                <input
                                    type="datetime-local"
                                    value={form.validUntil}
                                    onChange={(e) => updateField("validUntil", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#FF007F]/20 focus:border-[#FF007F] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateField("isActive", !form.isActive)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#FF007F]" : "bg-gray-300"}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isActive ? "left-[26px]" : "left-0.5"}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">{form.isActive ? "Aktif" : "Pasif"}</span>
                            </div>

                            <div className="flex gap-3">
                                {editId && (
                                    <button onClick={resetForm} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                                        İptal
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-[#FF007F] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#D6006B] transition-colors shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                                    {editId ? "GÜNCELLE" : "İNDİRİM TANIMLA"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Summary Card ── */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-4 mb-4">İNDİRİM DETAYI</h2>
                        <div className="space-y-4 text-sm">
                            {form.name && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Ad</span>
                                    <div className="font-bold text-gray-900">{form.name}</div>
                                </div>
                            )}
                            {form.code && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kod</span>
                                    <span className="font-mono font-bold text-lg text-[#FF007F] bg-[#FF007F]/10 px-2 py-1 rounded">{form.code}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Yöntem / Tip</span>
                                <div className="font-medium text-gray-800">{methodLabel(form.discountMethod)}</div>
                                <div className="text-gray-600">{typeOptions.find((t) => t.value === form.discountType)?.label}</div>
                            </div>
                            {showAmountInput && form.discountValue && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Değer</span>
                                    <div className="font-bold text-xl text-gray-900">
                                        {form.discountType === "PERCENTAGE" ? `%${form.discountValue}` : `₺${form.discountValue}`}
                                    </div>
                                </div>
                            )}
                            {showBuyXGetY && form.buyX && form.getY && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kampanya</span>
                                    <div className="font-bold text-xl text-gray-900">{form.buyX} Al {form.getY} Öde</div>
                                </div>
                            )}
                            {showTierSelect && form.targetTier && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Hedef Müşteri</span>
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-[#FF007F] text-sm">
                                            {form.targetTier === "STANDARD" ? "person" : form.targetTier === "ELITE" ? "star" : "diamond"}
                                        </span>
                                        <span className="font-medium text-gray-800">{TIER_LABELS[form.targetTier]}</span>
                                    </div>
                                </div>
                            )}
                            {showUserSelect && form.targetUserId && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Hedef Müşteri</span>
                                    <div className="text-gray-800 font-medium">
                                        {users.find((u) => u.id === form.targetUserId)?.email || "Seçili müşteri"}
                                    </div>
                                </div>
                            )}
                            {form.maxUses && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kupon Adeti</span>
                                    <div className="text-gray-800">{form.maxUses} kullanım</div>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Kapsam</span>
                                <div className="text-gray-800">{SCOPE_OPTIONS.find((s) => s.value === form.scope)?.label}</div>
                                {selectedCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedCategories.map((cid) => (
                                            <span key={cid} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {categories.find((c) => c.id === cid)?.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {selectedProducts.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">{selectedProducts.length} ürün seçildi</div>
                                )}
                            </div>
                            {showMinReqValue && form.minReqValue && (
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Koşul</span>
                                    <div className="text-gray-800">
                                        {form.minRequirement === "MIN_TOTAL" ? `Minimum ${form.minReqValue} TL` : `Minimum ${form.minReqValue} Adet`}
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="material-icons text-sm">info</span>
                                    Bu indirim diğer kampanyalarla birleştirilemez.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Existing Discounts Table ── */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mt-12">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#111827]">MEVCUT İNDİRİMLER</h2>
                    <div className="flex gap-2">
                        {(["ALL", "ACTIVE", "PASSIVE"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f
                                    ? "bg-[#FF007F] text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {f === "ALL" ? "Tümü" : f === "ACTIVE" ? "Aktif" : "Pasif"}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredCoupons.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <span className="material-icons text-4xl text-gray-300 mb-3 block">local_offer</span>
                        <p className="text-gray-500 text-sm">Henüz indirim tanımlanmamış.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-3">İndirim Adı</th>
                                    <th className="px-6 py-3">Durum</th>
                                    <th className="px-6 py-3">Yöntem</th>
                                    <th className="px-6 py-3">Tip</th>
                                    <th className="px-6 py-3">Dönem</th>
                                    <th className="px-6 py-3">Kullanılan</th>
                                    <th className="px-6 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCoupons.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#111827]">{c.name || c.code}</div>
                                            <div className="text-xs text-gray-400 font-mono">{c.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {c.isActive ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{methodLabel(c.discountMethod)}</td>
                                        <td className="px-6 py-4 text-gray-600">{discountLabel(c)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {fmtDate(c.validFrom)}
                                            {c.validUntil ? ` - ${fmtDate(c.validUntil)}` : " - ∞"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""} Adet
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                                                    className="px-3 py-1.5 bg-[#FF007F] text-white text-xs font-bold rounded hover:bg-[#D6006B] transition-colors"
                                                >
                                                    İŞLEMLER
                                                </button>
                                                {openMenuId === c.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                                            <button
                                                                onClick={() => loadEdit(c)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                            >
                                                                <span className="material-icons text-sm text-gray-400">edit</span>
                                                                Düzenle
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggle(c.id)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                            >
                                                                <span className="material-icons text-sm text-gray-400">
                                                                    {c.isActive ? "pause_circle" : "play_circle"}
                                                                </span>
                                                                {c.isActive ? "Pasife Çek" : "Aktife Çek"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(c.id)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                                                            >
                                                                <span className="material-icons text-sm">delete</span>
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ddd;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ccc;
                }
            `}</style>
        </div>
    );
}
