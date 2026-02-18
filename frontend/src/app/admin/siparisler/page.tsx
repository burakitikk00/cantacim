import Link from "next/link";

const ORDERS = [
    { id: "#ORD-2024-001", customer: "Ayşe Yılmaz", email: "ayse@mail.com", date: "16 Şub 2024", items: 2, total: "₺146.700", payment: "Kredi Kartı", status: "Kargoda" },
    { id: "#ORD-2024-002", customer: "Mehmet Kara", email: "mehmet@mail.com", date: "16 Şub 2024", items: 1, total: "₺62.200", payment: "Havale", status: "Hazırlanıyor" },
    { id: "#ORD-2024-003", customer: "Zeynep Çelik", email: "zeynep@mail.com", date: "15 Şub 2024", items: 3, total: "₺196.750", payment: "Kredi Kartı", status: "Teslim Edildi" },
    { id: "#ORD-2024-004", customer: "Ali Demir", email: "ali@mail.com", date: "15 Şub 2024", items: 1, total: "₺45.000", payment: "Kredi Kartı", status: "Teslim Edildi" },
    { id: "#ORD-2024-005", customer: "Fatma Öz", email: "fatma@mail.com", date: "14 Şub 2024", items: 1, total: "₺104.000", payment: "Havale", status: "İptal" },
    { id: "#ORD-2024-006", customer: "Can Yıldız", email: "can@mail.com", date: "14 Şub 2024", items: 2, total: "₺89.900", payment: "Kredi Kartı", status: "İade" },
];

const statusColors: Record<string, string> = {
    "Kargoda": "bg-blue-50 text-blue-700",
    "Hazırlanıyor": "bg-yellow-50 text-yellow-700",
    "Teslim Edildi": "bg-green-50 text-green-700",
    "İptal": "bg-red-50 text-red-700",
    "İade": "bg-purple-50 text-purple-700",
};

export default function AdminOrdersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Sipariş Yönetimi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">{ORDERS.length} sipariş</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] text-[#374151] px-5 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                    <span className="material-icons text-xl">file_download</span>
                    Dışa Aktar
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 bg-white rounded-xl border border-[#E5E7EB] p-2">
                {["Tümü", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal", "İade"].map((t, i) => (
                    <button key={t} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? "bg-[#FF007F] text-white" : "text-[#6B7280] hover:bg-gray-50"}`}>
                        {t}
                    </button>
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
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Ödeme</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Durum</th>
                                <th className="text-right text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ORDERS.map((o) => (
                                <tr key={o.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-[#FF007F]">{o.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-[#111827]">{o.customer}</p>
                                        <p className="text-xs text-[#9CA3AF]">{o.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{o.date}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{o.items} ürün</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">{o.total}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{o.payment}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/siparisler/${o.id.replace("#", "")}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-block">
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
