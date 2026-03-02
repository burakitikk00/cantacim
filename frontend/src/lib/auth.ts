import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/* ─── Token Süreleri ───────────────────────────────── */
const SHORT_SESSION_MAX_AGE = 2 * 60 * 60;       // 2 saat (beni hatırla kapalı)
const LONG_SESSION_MAX_AGE = 30 * 24 * 60 * 60;   // 30 gün (beni hatırla açık)

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
    session: { strategy: "jwt", maxAge: LONG_SESSION_MAX_AGE },
    pages: { signIn: "/auth/giris", error: "/auth/giris" },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "E-posta", type: "email" },
                password: { label: "Şifre", type: "password" },
                rememberMe: { label: "Beni Hatırla", type: "text" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email.toLowerCase().trim();
                const ipAddress = (req?.headers && 'x-forwarded-for' in req.headers)
                    ? (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown'
                    : 'unknown';

                const user = await db.user.findUnique({
                    where: { email },
                });

                /* ── Kullanıcı bulunamadı ── */
                if (!user || !user.hashedPassword || !user.isActive) {
                    await db.loginAttempt.create({
                        data: {
                            userId: user?.id || null,
                            email,
                            ipAddress,
                            success: false,
                        },
                    });
                    return null;
                }

                /* ── Hesap kilidi kontrolü ── */
                if (user.lockedUntil && user.lockedUntil > new Date()) {
                    await db.loginAttempt.create({
                        data: {
                            userId: user.id,
                            email,
                            ipAddress,
                            success: false,
                        },
                    });
                    return null;
                }

                const valid = await bcrypt.compare(credentials.password, user.hashedPassword);

                if (!valid) {
                    const attempts = user.failedAttempts + 1;
                    await db.user.update({
                        where: { id: user.id },
                        data: {
                            failedAttempts: attempts,
                            ...(attempts >= 5 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {}),
                        },
                    });

                    await db.loginAttempt.create({
                        data: {
                            userId: user.id,
                            email,
                            ipAddress,
                            success: false,
                        },
                    });
                    return null;
                }

                /* ── Başarılı giriş — sayacı sıfırla ── */
                if (user.failedAttempts > 0) {
                    await db.user.update({
                        where: { id: user.id },
                        data: { failedAttempts: 0, lockedUntil: null },
                    });
                }

                /* ── LoginAttempt kaydı (başarılı) ── */
                await db.loginAttempt.create({
                    data: {
                        userId: user.id,
                        email,
                        ipAddress,
                        success: true,
                    },
                });

                /* ── AuditLog kaydı (başarılı giriş) ── */
                await db.auditLog.create({
                    data: {
                        userId: user.id,
                        action: "LOGIN",
                        entity: "User",
                        entityId: user.id,
                        ipAddress,
                    },
                });

                const rememberMe = credentials.rememberMe === "true";

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    rememberMe,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore - rememberMe gelen kullanıcıdan
                token.rememberMe = user.rememberMe ?? false;
                // Token oluşturma zamanı
                token.iat = Math.floor(Date.now() / 1000);
            }

            /* ── Token süre kontrolü ── */
            const maxAge = token.rememberMe ? LONG_SESSION_MAX_AGE : SHORT_SESSION_MAX_AGE;
            const issuedAt = (token.iat as number) || Math.floor(Date.now() / 1000);
            const now = Math.floor(Date.now() / 1000);

            if (now - issuedAt > maxAge) {
                // Token süresi dolmuş, null döndürerek oturum sonlandır
                return { ...token, expired: true };
            }

            return token;
        },
        async session({ session, token }) {
            // Süresi dolmuş token kontrolü
            if (token.expired) {
                return { ...session, user: undefined as any, expires: new Date(0).toISOString() };
            }

            if (session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
};
