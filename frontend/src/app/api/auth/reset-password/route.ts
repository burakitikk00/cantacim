import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token ve yeni şifre gerekli" },
                { status: 400 }
            );
        }

        // Şifre kuralları kontrolü
        if (password.length < 8) {
            return NextResponse.json({ error: "Şifre en az 8 karakter olmalı" }, { status: 400 });
        }
        if (!/[A-Z]/.test(password)) {
            return NextResponse.json({ error: "En az bir büyük harf gerekli" }, { status: 400 });
        }
        if (!/[a-z]/.test(password)) {
            return NextResponse.json({ error: "En az bir küçük harf gerekli" }, { status: 400 });
        }
        if (!/[0-9]/.test(password)) {
            return NextResponse.json({ error: "En az bir rakam gerekli" }, { status: 400 });
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return NextResponse.json({ error: "En az bir özel karakter gerekli" }, { status: 400 });
        }

        // Token doğrula
        const resetToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Geçersiz veya süresi dolmuş link" },
                { status: 400 }
            );
        }

        if (resetToken.expires < new Date()) {
            // Süresi dolmuş token'ı sil
            await db.passwordResetToken.delete({ where: { id: resetToken.id } });
            return NextResponse.json(
                { error: "Şifre sıfırlama linkinin süresi dolmuş. Lütfen yeni bir istek oluşturun." },
                { status: 400 }
            );
        }

        // Şifreyi güncelle
        const hashedPassword = await bcrypt.hash(password, 12);

        await db.user.update({
            where: { email: resetToken.email },
            data: {
                hashedPassword,
                failedAttempts: 0,
                lockedUntil: null,
            },
        });

        // Token'ı sil  
        await db.passwordResetToken.delete({ where: { id: resetToken.id } });

        return NextResponse.json({
            message: "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.",
        });
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
