import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.id) {
            const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

            await db.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "LOGOUT",
                    entity: "User",
                    entityId: session.user.id,
                    ipAddress,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout audit error:", error);
        // Hata olsa bile çıkışı engelleme
        return NextResponse.json({ success: true });
    }
}
