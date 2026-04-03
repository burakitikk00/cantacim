import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { token, email } = await req.json();

        if (!token || !email) {
            return NextResponse.json(
                { error: "Token ve e-posta adresi gerekli" },
                { status: 400 }
            );
        }

        // Token doğrula
        const verificationToken = await db.verificationToken.findFirst({
            where: { token, identifier: email },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Geçersiz link." },
                { status: 400 }
            );
        }

        if (verificationToken.expires < new Date()) {
            await db.verificationToken.delete({ 
                where: { 
                    identifier_token: { identifier: email, token } 
                } 
            });
            return NextResponse.json(
                { error: "Bu bağlantının süresi dolmuş. Lütfen yeni bir istek oluşturun." },
                { status: 400 }
            );
        }

        // E-postayı doğrulanmış olarak işaretle
        await db.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
            },
        });

        // Token'ı sil  
        await db.verificationToken.delete({ 
            where: { 
                identifier_token: { identifier: email, token } 
            } 
        });

        return NextResponse.json({
            message: "E-posta adresiniz başarıyla doğrulandı.",
        });
    } catch (error) {
        console.error("E-posta doğrulama hatası:", error);
        return NextResponse.json(
            { error: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
