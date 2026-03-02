import Link from "next/link";
import { getOrders } from "./actions";

const statusColors: Record<string, string> = {
    "Kargoda": "bg-blue-50 text-blue-700",
    "Hazırlanıyor": "bg-yellow-50 text-yellow-700",
    "Teslim Edildi": "bg-green-50 text-green-700",
    "İptal": "bg-red-50 text-red-700",
    "İade": "bg-purple-50 text-purple-700",
    "Bekliyor": "bg-gray-50 text-gray-700",
};

const TABS = ["Tümü", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal", "İade"];

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const params = await searchParams;
    const activeTab = params.status || "Tümü";
    const orders = await getOrders(activeTab);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Sipariş Yönetimi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">{orders.length} sipariş</p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 bg-white rounded-xl border border-[#E5E7EB] p-2 flex-wrap">
                {TABS.map((t) => (
                    <Link
                        key={t}
                        href={t === "Tümü" ? "/admin/siparisler" : `/admin/siparisler?status=${encodeURIComponent(t)}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t
                                ? "bg-[#FF007F] text-white"
                                : "text-[#6B7280] hover:bg-gray-50"
                            }`}
                    >
                        {t}
                    </Link>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#E5E7EB]">
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Sipariş No</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Müşteri</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Tarih</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Ürün</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Tutar</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Durum</th>
                                <th className="text-right text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                                        Sipariş bulunamadı.
                                    </td>
                                </tr>
                            )}
                            {orders.map((o) => (
                                <tr key={o.dbId} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-[#FF007F]">{o.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-[#111827]">{o.customer}</p>
                                        <p className="text-xs text-[#9CA3AF]">{o.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{o.date}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{o.items} ürün</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">{o.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/siparisler/${o.dbId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-block">
                                            <span className="material-icons text-[#6B7280] text-xl">visibility</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
