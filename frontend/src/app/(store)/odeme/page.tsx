import React from "react";
import PaymentClient from "./PaymentClient";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PaymentPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        redirect("/login");
    }

    const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" }
        ]
    });

    return <PaymentClient initialAddresses={addresses} />;
}
