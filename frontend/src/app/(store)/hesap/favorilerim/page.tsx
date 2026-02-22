import { getFavoritesWithProducts } from "@/actions/favorite";
import { getRecommendations } from "@/actions/recommendation";
import FavoritesClient from "./FavoritesClient";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
    const [favorites, recommendations] = await Promise.all([
        getFavoritesWithProducts(),
        getRecommendations(6),
    ]);

    return (
        <FavoritesClient
            favorites={favorites}
            recommendations={recommendations}
        />
    );
}
