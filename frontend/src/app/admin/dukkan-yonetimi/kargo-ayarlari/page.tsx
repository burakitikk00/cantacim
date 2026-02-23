import KargoAyarlariClient from "./KargoAyarlariClient";
import { getStoreSettings } from "@/app/actions/settings";

export const metadata = {
    title: "Kargo Ayarları | Dükkan Yönetimi",
};

export default async function KargoAyarlariPage() {
    const res = await getStoreSettings();
    const settings = res.success ? res.data : null;

    return <KargoAyarlariClient settings={settings} />;
}
