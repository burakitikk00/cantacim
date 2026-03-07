"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Sayıları Güncelle"
        >
            <span className="material-icons text-sm">refresh</span>
        </button>
    );
}
