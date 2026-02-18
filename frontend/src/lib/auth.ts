import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
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
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { email: credentials.email.toLowerCase().trim() },
                });

                if (!user || !user.hashedPassword || !user.isActive) return null;

                /* Hesap kilidi kontrolü */
                if (user.lockedUntil && user.lockedUntil > new Date()) return null;

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
                    return null;
                }

                /* Başarılı giriş — sayacı sıfırla */
                if (user.failedAttempts > 0) {
                    await db.user.update({
                        where: { id: user.id },
                        data: { failedAttempts: 0, lockedUntil: null },
                    });
                }

                return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
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
