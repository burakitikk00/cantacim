import { getFavoritesWithProducts } from "@/actions/favorite";
import FavoritesClient from "./FavoritesClient";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
    const favorites = await getFavoritesWithProducts();

    return <FavoritesClient favorites={favorites} />;
}
