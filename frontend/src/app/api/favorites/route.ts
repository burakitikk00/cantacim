import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ ids: [], count: 0 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ ids: [], count: 0 });
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        select: { productId: true }
    });

    const ids = favorites.map(f => f.productId);
    return NextResponse.json({ ids, count: ids.length });
}
