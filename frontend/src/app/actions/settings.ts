"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStoreSettings() {
    try {
        let settings = await prisma.storeSettings.findUnique({
            where: { id: "default" }
        });

        if (!settings) {
            settings = await prisma.storeSettings.create({
                data: {
                    id: "default",
                    shippingFee: 90.00,
                    applyToFree: false,
                    calcMethod: "single",
                    freeShippingActive: false,
                    internationalActive: false,
                    firstPlusExtra: 0.00,
                    thresholdValue: 500.00,
                    belowThresholdFee: 90.00,
                    aboveThresholdFee: 0.00,
                    deliveryMethods: [{ id: 1, name: "Yurtiçi Kargo", fee: "0,00", isDefault: true }]
                }
            });
        }

        return {
            success: true,
            data: {
                ...settings,
                shippingFee: Number(settings.shippingFee),
                firstPlusExtra: Number(settings.firstPlusExtra),
                thresholdValue: Number(settings.thresholdValue),
                belowThresholdFee: Number(settings.belowThresholdFee),
                aboveThresholdFee: Number(settings.aboveThresholdFee)
            }
        };

    } catch (error) {
        console.error("Store ayarlari cekilirken hata:", error);
        return { success: false, error: "Ayarlar alınırken bir hata oluştu" };
    }
}

export async function updateStoreSettings(data: any) {
    try {
        const updated = await prisma.storeSettings.upsert({
            where: { id: "default" },
            update: {
                shippingFee: data.shippingFee,
                applyToFree: data.applyToFree,
                calcMethod: data.calcMethod,
                freeShippingActive: data.freeShippingActive,
                internationalActive: false, // Daima kapali (istege bagli)
                firstPlusExtra: data.firstPlusExtra,
                thresholdValue: data.thresholdValue,
                belowThresholdFee: data.belowThresholdFee,
                aboveThresholdFee: data.aboveThresholdFee,
                deliveryMethods: data.deliveryMethods ?? undefined
            },
            create: {
                id: "default",
                shippingFee: data.shippingFee,
                applyToFree: data.applyToFree,
                calcMethod: data.calcMethod,
                freeShippingActive: data.freeShippingActive,
                internationalActive: false, // Daima kapali
                firstPlusExtra: data.firstPlusExtra,
                thresholdValue: data.thresholdValue,
                belowThresholdFee: data.belowThresholdFee,
                aboveThresholdFee: data.aboveThresholdFee,
                deliveryMethods: data.deliveryMethods ?? undefined
            }
        });

        revalidatePath("/", "layout");

        return { success: true, message: "Ayarlar başarıyla güncellendi!" };
    } catch (error) {
        console.error("Store ayarlari güncellenirken hata:", error);
        return { success: false, error: "Değişiklikler kaydedilemedi." };
    }
}
