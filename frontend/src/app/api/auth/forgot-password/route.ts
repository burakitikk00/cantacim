import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "E-posta adresi gerekli" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Her zaman başarılı dön (e-posta mevcudiyetini açığa verme)
        const successResponse = NextResponse.json({
            message: "Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama linki gönderildi.",
        });

        const user = await db.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user || !user.isActive) {
            return successResponse;
        }

        // Google hesabı ile kaydolmuş ve şifresi yoksa
        if (!user.hashedPassword) {
            return successResponse;
        }

        // Mevcut token'ları sil
        await db.passwordResetToken.deleteMany({
            where: { email: normalizedEmail },
        });

        // Yeni token oluştur
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

        await db.passwordResetToken.create({
            data: {
                email: normalizedEmail,
                token,
                expires,
            },
        });

        // E-posta gönder
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetUrl = `${appUrl}/auth/sifre-sifirla?token=${token}`;

        try {
            await sendEmail({
                to: normalizedEmail,
                subject: "Şifre Sıfırlama",
                html: getPasswordResetEmailHtml(resetUrl),
            });
        } catch (emailError) {
            console.error("E-posta gönderme hatası:", emailError);
            // E-posta gönderilemese bile güvenlik için aynı yanıtı ver
            // Dev modunda token'ı konsola yaz
            if (process.env.NODE_ENV === "development") {
                console.log("🔑 Şifre sıfırlama linki:", resetUrl);
            }
        }

        return successResponse;
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
