"use client";

import React, { Suspense } from "react";
import { AddressForm } from "@/components/profile/AddressForm";

export default function NewAddressPage() {
    return (
        <Suspense>
            <AddressForm mode="create" />
        </Suspense>
    );
}
