import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Oturum açmadınız" }, { status: 401 });
        }

        const email = session.user.email;

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: "E-posta zaten doğrulanmış" }, { status: 400 });
        }

        // Mevcut token'ları sil (varsa)
        await db.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // Yeni token oluştur
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        // E-posta gönder
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verifyUrl = `${appUrl}/auth/dogrula?token=${token}&email=${encodeURIComponent(email)}`;

        try {
            await sendEmail({
                to: email,
                subject: "E-posta Adresinizi Doğrulayın",
                html: getVerificationEmailHtml(verifyUrl),
            });
        } catch (emailError) {
            console.error("E-posta gönderme hatası:", emailError);
            if (process.env.NODE_ENV === "development") {
                console.log("🔑 Doğrulama linki:", verifyUrl);
            }
            return NextResponse.json(
                { error: "E-posta gönderimi başarısız oldu. SMTP ayarlarınızı kontrol edin." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Doğrulama bağlantısı e-posta adresinize başarıyla gönderildi.",
        });
    } catch (error) {
        console.error("E-posta doğrulama gönderme hatası:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
