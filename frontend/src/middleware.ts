import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/* ─── RATE LIMIT (in-memory, basit) ───────────────── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (record.count >= limit) return false;
    record.count++;
    return true;
}

/* ─── SECURITY HEADERS ────────────────────────────── */
function addSecurityHeaders(response: NextResponse) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    /* ── Rate Limit ── */
    if (pathname.startsWith("/api/auth") && request.method === "POST") {
        if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
            return addSecurityHeaders(NextResponse.json({ error: "Çok fazla deneme. 15 dakika bekleyin." }, { status: 429 }));
        }
    } else if (pathname.startsWith("/api/")) {
        if (!rateLimit(ip, 100, 60 * 1000)) {
            return addSecurityHeaders(NextResponse.json({ error: "İstek limiti aşıldı." }, { status: 429 }));
        }
    }

    /* ── Auth-Protected Routes ── */
    const protectedRoutes = ["/hesap", "/sepet", "/odeme", "/siparis-onay"];
    const adminRoutes = ["/admin", "/api/admin"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));

    if (isProtected || isAdmin) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            if (pathname.startsWith("/api/")) {
                return addSecurityHeaders(NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 }));
            }
            const url = request.nextUrl.clone();
            url.pathname = "/auth/giris";
            url.searchParams.set("callbackUrl", pathname);
            return addSecurityHeaders(NextResponse.redirect(url));
        }

        if (isAdmin && token.role !== "ADMIN") {
            if (pathname.startsWith("/api/")) {
                return addSecurityHeaders(NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 }));
            }
            return addSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
        }
    }

    /* ── Auth page: redirect if logged in ── */
    if (pathname.startsWith("/auth/")) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
            return addSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
        }
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
    ],
};
