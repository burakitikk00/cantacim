import { z } from "zod";

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
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

export const variantSchema = z.object({
    sku: z.string().min(3).max(50),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    image: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
    attributeValueIds: z.array(z.string().cuid()),
});

/* ─── ADDRESS ───────────────────────────────────────── */
export const addressSchema = z.object({
    title: z.string().min(2).max(50),
    fullName: z.string().min(3).max(100),
    phone: z.string().min(10).max(15),
    city: z.string().min(2),
    district: z.string().min(2),
    address: z.string().min(5).max(500),
    zipCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

/* ─── ORDER ─────────────────────────────────────────── */
export const orderSchema = z.object({
    addressId: z.string().cuid(),
    couponCode: z.string().optional(),
    customerNote: z.string().max(500).optional(),
    idempotencyKey: z.string().uuid(),
});

export const orderStatusSchema = z.object({
    status: z.enum(["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

/* ─── COUPON ────────────────────────────────────────── */
export const couponSchema = z.object({
    code: z.string().min(3).max(30).toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive(),
    minOrderTotal: z.number().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
});

/* ─── ATTRIBUTE ─────────────────────────────────────── */
export const attributeSchema = z.object({
    name: z.string().min(2).max(50),
});

export const attributeValueSchema = z.object({
    value: z.string().min(1).max(50),
});
