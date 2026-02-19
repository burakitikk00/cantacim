"use client";

import React, { use } from "react";
import { AddressForm } from "@/components/profile/AddressForm";
import { notFound } from "next/navigation";

// Mock Data Source - matching the display in the main list
const MOCK_ADDRESSES = {
    "1": {
        id: "1",
        title: "Ev Adresim",
        fullName: "Ahmet Yılmaz",
        phone: "+90 532 123 45 67",
        city: "istanbul",
        district: "bakirkoy",
        neighborhood: "Zeytinlik Mah. Halkalı Cad.",
        fullAddress: "No:45 Daire:12"
    },
    "2": {
        id: "2",
        title: "İş Yeri",
        fullName: "Ahmet Yılmaz - L'Elite Office",
        phone: "+90 212 987 65 43",
        city: "istanbul",
        district: "levent",
        neighborhood: "Büyükdere Cad.",
        fullAddress: "No:193 K:14"
    },
    "3": {
        id: "3",
        title: "Yazlık",
        fullName: "Ahmet Yılmaz",
        phone: "+90 532 123 45 67",
        city: "izmir",
        district: "cesme",
        neighborhood: "Alaçatı Mah. 13002 Sok.",
        fullAddress: "No:5"
    }
};

export default function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const address = MOCK_ADDRESSES[id as keyof typeof MOCK_ADDRESSES];

    if (!address) {
        notFound();
    }

    return <AddressForm mode="edit" initialData={address} />;
}
