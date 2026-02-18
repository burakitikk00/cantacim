"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db as prisma } from "../lib/db";
import { authOptions } from "../lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Tier thresholds
const TIER_THRESHOLDS = {
    STANDARD: 0,
    ELITE: 3000,
    PLATINUM: 5000,
    PREMIUM: 10000,
};

const userProfileSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    phone: z.string().optional(),
    birthday: z.string().optional(), // Expecting YYYY-MM-DD
});

export async function getUserProfile() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { id: (session.user as any).id || "missing-id" },
                { email: session.user.email || "missing-email" }
            ]
        },
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            birthday: true,
            tier: true,
            totalSpent: true,
            emailVerified: true,
            isActive: true,
            customerGroup: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    // Calculate next tier progress
    let nextTier = null;
    let amountForNextTier = 0;
    let progress = 0;

    const totalSpent = Number(user.totalSpent);

    if (user.tier === "STANDARD") {
        nextTier = "ELITE";
        amountForNextTier = Math.max(0, TIER_THRESHOLDS.ELITE - totalSpent);
        progress = Math.min(100, (totalSpent / TIER_THRESHOLDS.ELITE) * 100);
    } else if (user.tier === "ELITE") {
        nextTier = "PLATINUM";
        amountForNextTier = Math.max(0, TIER_THRESHOLDS.PLATINUM - totalSpent);
        progress = Math.min(100, (totalSpent / TIER_THRESHOLDS.PLATINUM) * 100);
    } else {
        // Already Platinum
        progress = 100;
    }

    // Convert Decimal to number for serialization
    const safeUser = {
        ...user,
        totalSpent: Number(user.totalSpent),
    };

    return {
        user: safeUser,
        nextTierLogic: {
            currentTier: user.tier,
            nextTier,
            amountForNextTier,
            progress,
            totalSpent,
        },
    };
}

export async function updateUserProfile(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const rawData = {
        name: formData.get("name"),
        surname: formData.get("surname"),
        phone: formData.get("phone"),
        birthday: formData.get("birthday"),
        email: formData.get("email"),
    };

    // Age Verification
    if (rawData.birthday) {
        const birthDate = new Date(rawData.birthday as string);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return { error: "Üye olabilmek için 18 yaşından büyük olmalısınız." };
        }
    }

    try {
        // Simple validation or use Zod
        // const validated = userProfileSchema.parse(rawData);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: (session.user as any).id || "missing-id" },
                    { email: session.user.email || "missing-email" }
                ]
            }
        });

        if (!user) return { error: "Kullanıcı bulunamadı" };

        const newEmail = (rawData.email as string)?.toLowerCase().trim();
        const emailChanged = newEmail && newEmail !== user.email;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: rawData.name as string,
                surname: rawData.surname as string,
                phone: rawData.phone as string,
                email: emailChanged ? newEmail : undefined,
                emailVerified: emailChanged ? null : undefined,
                birthday: rawData.birthday ? new Date(rawData.birthday as string) : null,
            },
        });

        revalidatePath("/hesap/bilgilerim");
        return { success: true, message: "Profil güncellendi" };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Güncelleme sırasında bir hata oluştu" };
    }
}

export async function changePassword(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Tüm alanları doldurunuz" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Yeni şifreler eşleşmiyor" };
    }

    if (newPassword.length < 6) {
        return { error: "Yeni şifre en az 6 karakter olmalıdır" };
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: (session.user as any).id || "missing-id" },
                    { email: session.user.email || "missing-email" }
                ]
            }
        });

        if (!user || !user.hashedPassword) {
            return { error: "Kullanıcı bulunamadı veya şifre belirlenmemiş (Google ile giriş yapıyorsanız şifre değiştiremezsiniz)" };
        }

        const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);

        if (!isValid) {
            return { error: "Mevcut şifre hatalı" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { hashedPassword },
        });

        return { success: true, message: "Şifreniz başarıyla güncellendi" };
    } catch (error) {
        console.error("Password change error:", error);
        return { error: "Şifre değiştirme sırasında bir hata oluştu" };
    }
}

export async function deactivateAccount() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: (session.user as any).id || "missing-id" },
                    { email: session.user.email || "missing-email" }
                ]
            }
        });

        if (!user) return { error: "Kullanıcı bulunamadı" };

        await prisma.user.update({
            where: { id: user.id },
            data: { isActive: false },
        });

        // In a real app, you would also sign the user out here
        return { success: true, message: "Hesabınız başarıyla donduruldu." };
    } catch (error) {
        console.error("Account deactivation error:", error);
        return { error: "Hesap dondurma sırasında bir hata oluştu" };
    }
}

export async function verifyEmail() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: (session.user as any).id || "missing-id" },
                    { email: session.user.email || "missing-email" }
                ]
            }
        });

        if (!user) return { error: "Kullanıcı bulunamadı" };

        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
        });

        revalidatePath("/hesap/bilgilerim");
        return { success: true, message: "E-posta adresiniz doğrulandı." };
    } catch (error) {
        console.error("Email verification error:", error);
        return { error: "E-posta doğrulanırken bir hata oluştu" };
    }
}
