"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db as prisma } from "../lib/db";
import { authOptions } from "../lib/auth";

export async function createAddress(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    try {
        const title = formData.get("title") as string;
        const fullName = formData.get("fullName") as string;
        const phone = (formData.get("phone") as string || "").replace(/\s+/g, "");
        const city = formData.get("city") as string;
        const district = formData.get("district") as string;
        const neighborhood = formData.get("neighborhood") as string;
        const fullAddress = formData.get("fullAddress") as string;
        let isDefault = formData.get("isDefault") === "on";

        const addressCount = await prisma.address.count({
            where: { userId: user.id }
        });

        if (addressCount === 0) {
            isDefault = true;
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: user.id,
                title,
                fullName,
                phone,
                city,
                district,
                neighborhood,
                fullAddress,
                isDefault
            }
        });

        revalidatePath("/hesap/adreslerim");
        return { success: true, message: "Adres başarıyla eklendi", addressId: newAddress.id };
    } catch (error) {
        console.error("Create address error:", error);
        return { error: "Adres eklenirken bir hata oluştu" };
    }
}

export async function updateAddress(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    try {
        const existingAddress = await prisma.address.findFirst({
            where: { id, userId: user.id }
        });

        if (!existingAddress) {
            return { error: "Adres bulunamadı veya yetkiniz yok" };
        }

        const title = formData.get("title") as string;
        const fullName = formData.get("fullName") as string;
        const phone = (formData.get("phone") as string || "").replace(/\s+/g, "");
        const city = formData.get("city") as string;
        const district = formData.get("district") as string;
        const neighborhood = formData.get("neighborhood") as string;
        const fullAddress = formData.get("fullAddress") as string;
        const isDefault = formData.get("isDefault") === "on";

        if (isDefault && !existingAddress.isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id },
                data: { isDefault: false }
            });
        }

        await prisma.address.update({
            where: { id },
            data: {
                title,
                fullName,
                phone,
                city,
                district,
                neighborhood,
                fullAddress,
                isDefault
            }
        });

        revalidatePath("/hesap/adreslerim");
        revalidatePath(`/hesap/adreslerim/${id}`);
        return { success: true, message: "Adres başarıyla güncellendi" };
    } catch (error) {
        console.error("Update address error:", error);
        return { error: "Adres güncellenirken bir hata oluştu" };
    }
}

export async function deleteAddress(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    try {
        const existingAddress = await prisma.address.findFirst({
            where: { id, userId: user.id }
        });

        if (!existingAddress) {
            return { error: "Adres bulunamadı veya yetkiniz yok" };
        }

        await prisma.address.delete({
            where: { id }
        });

        revalidatePath("/hesap/adreslerim");
        return { success: true, message: "Adres başarıyla silindi" };
    } catch (error) {
        console.error("Delete address error:", error);
        return { error: "Adres silinirken bir hata oluştu" };
    }
}

export async function setDefaultAddress(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Oturum açmanız gerekiyor" };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: "Kullanıcı bulunamadı" };
    }

    try {
        const existingAddress = await prisma.address.findFirst({
            where: { id, userId: user.id }
        });

        if (!existingAddress) {
            return { error: "Adres bulunamadı veya yetkiniz yok" };
        }

        await prisma.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false }
        });

        await prisma.address.update({
            where: { id },
            data: { isDefault: true }
        });

        revalidatePath("/hesap/adreslerim");
        return { success: true, message: "Varsayılan adres güncellendi" };
    } catch (error) {
        console.error("Set default address error:", error);
        return { error: "Varsayılan adres güncellenirken bir hata oluştu" };
    }
}
