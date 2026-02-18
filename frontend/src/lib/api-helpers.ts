import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { db } from "@/lib/db";

/* ─── Session Helpers ─────────────────────────────── */
export async function getSession() {
    return getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.user?.email) return null;
    return db.user.findUnique({ where: { email: session.user.email } });
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) throw new ApiError("Yetkilendirme gerekli", 401);
    return user;
}

export async function requireAdmin() {
    const user = await requireAuth();
    if (user.role !== "ADMIN") throw new ApiError("Yetkisiz erişim", 403);
    return user;
}

/* ─── API Error ───────────────────────────────────── */
export class ApiError extends Error {
    constructor(message: string, public status: number = 400) {
        super(message);
    }
}

/* ─── Safe API Handler ────────────────────────────── */
type Handler = (req: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

export function apiHandler(handler: Handler): Handler {
    return async (req, ctx) => {
        try {
            return await handler(req, ctx);
        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json({ error: error.message }, { status: error.status });
            }
            console.error("API Error:", error);
            return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
        }
    };
}

/* ─── Validate Body ───────────────────────────────── */
export async function validateBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
        const errors = result.error.issues.map((e) => e.message).join(", ");
        throw new ApiError(errors, 400);
    }
    return result.data;
}

/* ─── Audit Log ───────────────────────────────────── */
export async function auditLog(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    oldValue?: unknown,
    newValue?: unknown,
    ipAddress?: string
) {
    await db.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
            newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
            ipAddress,
        },
    });
}
