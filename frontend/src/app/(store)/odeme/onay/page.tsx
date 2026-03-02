import React from "react";
import OnayClient from "./OnayClient";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreSettings } from "@/app/actions/settings";
import { StoreSettingsParams } from "@/utils/shipping";

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
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

    const shipping = typeof searchParams.shipping === 'string' ? searchParams.shipping : undefined;
    const addressId = typeof searchParams.address === 'string' ? searchParams.address : undefined;
    const last4 = typeof searchParams.last4 === 'string' ? searchParams.last4 : undefined;
    const bank = typeof searchParams.bank === 'string' ? searchParams.bank : undefined;
    const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;

    if (!addressId || !shipping) {
        redirect("/odeme"); // Missing necessary info
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
        where: { id: addressId }
    });

    if (!address || address.userId !== user.id) {
        redirect("/odeme"); // Not authorized
    }

    const settingsRes = await getStoreSettings();
    const settings = (settingsRes.success ? settingsRes.data : null) as StoreSettingsParams | null;

    return <OnayClient address={address} settings={settings} shippingMethod={shipping} last4={last4} bank={bank} brand={brand} />;
}
