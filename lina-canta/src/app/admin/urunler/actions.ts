"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
    try {
        await db.product.delete({
            where: { id },
        });
        revalidatePath("/admin/urunler");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Ürün silinirken bir hata oluştu." };
    }
}
