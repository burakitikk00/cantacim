import { z } from "zod";
import { sanitizeString } from "./sanitize";

/* ─── Güvenli URL doğrulayıcı ──────────────────────── */
const safeUrlRule = z.string().url().refine(
    (url) => url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/uploads/"),
    { message: "URL sadece https://, http:// veya /uploads/ ile başlayabilir" }
);

/* ─── AUTH ──────────────────────────────────────────── */
const passwordRule = z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "En az bir büyük harf gerekli")
    .regex(/[a-z]/, "En az bir küçük harf gerekli")
    .regex(/[0-9]/, "En az bir rakam gerekli")
    .regex(/[^A-Za-z0-9]/, "En az bir özel karakter gerekli");

export const registerSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter"),
    surname: z.string().min(2, "Soyisim en az 2 karakter"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: passwordRule,
});

export const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(1, "Şifre gerekli"),
});

/* ─── PRODUCT ───────────────────────────────────────── */
export const productSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().optional(),
    categoryId: z.string().cuid(),
    basePrice: z.number().positive("Fiyat pozitif olmalı"),
    images: z.array(safeUrlRule).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

export const variantSchema = z.object({
    sku: z.string().min(3).max(50),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    image: safeUrlRule.optional().nullable(),
    isActive: z.boolean().optional(),
    attributeValueIds: z.array(z.string().cuid()),
});

/* ─── ADDRESS ───────────────────────────────────────── */
export const addressSchema = z.object({
    title: z.string().min(2).max(50).transform(sanitizeString),
    fullName: z.string().min(3).max(100).transform(sanitizeString),
    phone: z.string().min(10).max(15),
    city: z.string().min(2).transform(sanitizeString),
    district: z.string().min(2).transform(sanitizeString),
    address: z.string().min(5).max(500).transform(sanitizeString),
    zipCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

/* ─── ORDER ─────────────────────────────────────────── */
export const orderSchema = z.object({
    addressId: z.string().cuid(),
    couponCode: z.string().optional(),
    customerNote: z.string().max(500).optional().transform((v) => v ? sanitizeString(v) : v),
    idempotencyKey: z.string().uuid(),
});

export const orderStatusSchema = z.object({
    status: z.enum(["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

/* ─── COUPON ────────────────────────────────────────── */
export const couponSchema = z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(2).max(30).toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y", "FREE_SHIPPING"]),
    discountValue: z.number().min(0).max(100_000, "İndirim değeri çok yüksek"),
    discountMethod: z.enum(["AUTO", "CODE", "TIER", "USER"]),
    scope: z.enum(["ALL", "CATEGORIES", "PRODUCTS", "CATEGORIES_AND_PRODUCTS"]),
    minOrderTotal: z.number().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    buyX: z.number().int().min(1).optional(),
    getY: z.number().int().min(1).optional(),
    targetTier: z.enum(["STANDARD", "ELITE", "PLATINUM"]).optional(),
    targetUserId: z.string().optional(),
    minRequirement: z.enum(["MIN_TOTAL", "MIN_QUANTITY"]).optional(),
    minReqValue: z.number().min(0).optional(),
}).refine(
    (data) => {
        // Yüzdesel indirim %100'den fazla olamaz
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            return false;
        }
        return true;
    },
    { message: "Yüzdesel indirim %100'den fazla olamaz", path: ["discountValue"] }
);

/* ─── ATTRIBUTE ─────────────────────────────────────── */
export const attributeSchema = z.object({
    name: z.string().min(2).max(50),
});

export const attributeValueSchema = z.object({
    value: z.string().min(1).max(50),
});

