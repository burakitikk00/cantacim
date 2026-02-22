import React from "react";
import { AddressForm } from "@/components/profile/AddressForm";
import { notFound } from "next/navigation";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return notFound();
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return notFound();
    }

    const address = await prisma.address.findFirst({
        where: { id, userId: user.id }
    });

    if (!address) {
        return notFound();
    }

    return <AddressForm mode="edit" initialData={address} />;
}
