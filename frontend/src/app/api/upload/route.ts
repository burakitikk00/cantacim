import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Dosya bulunamadı." },
                { status: 400 }
            );
        }

        // Tip kontrolü
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Geçersiz dosya tipi. Sadece JPEG, PNG ve WEBP desteklenir." },
                { status: 400 }
            );
        }

        // Boyut kontrolü
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Dosya boyutu 5MB'dan büyük olamaz." },
                { status: 400 }
            );
        }

        // Dosya buffer'ını al
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Benzersiz dosya adı oluştur
        const uniqueId = crypto.randomUUID();
        const timestamp = Date.now();
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const fileName = `${uniqueId}-${timestamp}.${ext}`;

        // Kayıt dizinini oluştur (yoksa)
        const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
        await mkdir(uploadDir, { recursive: true });

        // Dosyayı kaydet
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Göreceli URL döndür
        const url = `/uploads/products/${fileName}`;

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Dosya yüklenirken bir hata oluştu." },
            { status: 500 }
        );
    }
}
