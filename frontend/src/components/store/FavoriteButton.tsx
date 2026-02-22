"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toggleFavorite } from "@/actions/favorite";
import AuthSidebar from "../auth/AuthSidebar";

// ─── GLOBAL CACHE ─────────────────────────────────────
// Tüm FavoriteButton'lar tek bir API çağrısını paylaşır
let cachedFavoriteIds: string[] | null = null;
let fetchPromise: Promise<string[]> | null = null;

async function fetchFavoriteIds(): Promise<string[]> {
    // Zaten bir istek devam ediyorsa onu bekle (dedup)
    if (fetchPromise) return fetchPromise;

    // Cache geçerliyse kullan
    if (cachedFavoriteIds !== null) return cachedFavoriteIds;

    // Yeni istek başlat
    fetchPromise = fetch("/api/favorites")
        .then(res => {
            if (!res.ok) return [];
            return res.json();
        })
        .then(data => {
            cachedFavoriteIds = data.ids || [];
            fetchPromise = null;
            return cachedFavoriteIds!;
        })
        .catch(() => {
            fetchPromise = null;
            return [];
        });

    return fetchPromise;
}

/** Cache'i temizle (favori ekle/çıkar sonrası) */
function invalidateFavoriteCache() {
    cachedFavoriteIds = null;
    fetchPromise = null;
}
// ──────────────────────────────────────────────────────

interface FavoriteButtonProps {
    productId: string;
    className?: string;
    iconSize?: string;
    /** 
     * "overlay" = circular button on product card images
     * "detail" = square button on product detail page
     */
    variant?: "overlay" | "detail";
}

export default function FavoriteButton({
    productId,
    className,
    iconSize = "text-lg",
    variant = "overlay",
}: FavoriteButtonProps) {
    const { status } = useSession();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Load favorited state from global cache (tek API çağrısı)
    useEffect(() => {
        if (status === "authenticated") {
            fetchFavoriteIds().then(ids => {
                setIsFavorited(ids.includes(productId));
            });
        }
    }, [status, productId]);

    // favoriteChanged event'ını dinle → cache'i temizle ve yeniden çek
    useEffect(() => {
        const handler = () => {
            invalidateFavoriteCache();
            if (status === "authenticated") {
                fetchFavoriteIds().then(ids => {
                    setIsFavorited(ids.includes(productId));
                });
            }
        };
        window.addEventListener("favoriteChanged", handler);
        return () => window.removeEventListener("favoriteChanged", handler);
    }, [status, productId]);

    const handleClick = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (status === "unauthenticated") {
            setIsAuthOpen(true);
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        setIsAnimating(true);

        // Optimistic update
        const previousState = isFavorited;
        setIsFavorited(!isFavorited);

        try {
            const result = await toggleFavorite(productId);
            if (result.error) {
                setIsFavorited(previousState);
            }
            // Cache'i temizle ve event gönder
            invalidateFavoriteCache();
            window.dispatchEvent(new CustomEvent("favoriteChanged"));
        } catch {
            setIsFavorited(previousState);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [status, isLoading, isFavorited, productId]);

    const overlayClasses = `absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all duration-300 ${isFavorited
        ? "bg-red-50 text-red-500"
        : "bg-white/90 text-primary hover:bg-red-50 hover:text-red-500"
        } ${isAnimating ? "scale-125" : "scale-100"}`;

    const detailClasses = `size-14 md:size-16 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${isFavorited
        ? "border-red-200 bg-red-50 text-red-500"
        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
        } ${isAnimating ? "scale-110" : "scale-100"}`;

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={className || (variant === "overlay" ? overlayClasses : detailClasses)}
                title={isFavorited ? "Favorilerden kaldır" : "Favorilere ekle"}
            >
                <span className={`material-symbols-outlined ${isFavorited ? "fill" : ""} ${iconSize} transition-all duration-300`}>
                    favorite
                </span>
            </button>
            <AuthSidebar isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
