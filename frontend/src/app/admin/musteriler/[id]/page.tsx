import Link from "next/link";
import { getCustomerDetail } from "../actions";
import { notFound } from "next/navigation";

const statusColors: Record<string, string> = {
    "Kargoda": "bg-blue-50 text-blue-700",
    "Hazırlanıyor": "bg-yellow-50 text-yellow-700",
    "Teslim Edildi": "bg-green-50 text-green-700",
    "İptal": "bg-red-50 text-red-700",
    "İade": "bg-purple-50 text-purple-700",
    "Bekliyor": "bg-gray-50 text-gray-700",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let customer;
    try {
        customer = await getCustomerDetail(id);
    } catch {
        notFound();
    }

    const initials = [customer.name?.[0], customer.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?";

    const fullName = [customer.name, customer.surname].filter(Boolean).join(" ") || "İsimsiz";

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/musteriler" className="text-sm text-gray-500 hover:text-[#FF007F] mb-2 inline-flex items-center gap-1 transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                        Müşterilere Dön
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF007F] rounded-full flex items-center justify-center text-white text-xl font-bold">{initials}</div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#111827]">{fullName}</h1>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <h2 className="font-bold text-[#111827]">Müşteri Bilgileri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50">{customer.name || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50">{customer.surname || "-"}</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50">{customer.email}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50">{customer.phone || "-"}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                            <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 min-h-[60px]">{customer.address}</div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <div className="p-6 border-b border-[#E5E7EB]">
                            <h2 className="font-bold text-[#111827]">Sipariş Geçmişi</h2>
                        </div>
                        {customer.orders.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400">Henüz sipariş yok.</div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Sipariş</th>
                                        <th className="px-6 py-3">Tarih</th>
                                        <th className="px-6 py-3">Tutar</th>
                                        <th className="px-6 py-3">Durum</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customer.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-[#FF007F]">{order.orderNumber}</td>
                                            <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                            <td className="px-6 py-4 font-medium">{order.total}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-50 text-gray-700"}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/admin/siparisler/${order.id}`} className="text-gray-400 hover:text-[#FF007F]">
                                                    <span className="material-icons text-lg">visibility</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                        <h2 className="font-bold text-[#111827]">Özet</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Toplam Harcama</span>
                                <span className="font-bold text-lg">{customer.totalSpent}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Sipariş Sayısı</span>
                                <span className="font-bold">{customer.orderCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Üyelik Tarihi</span>
                                <span className="font-medium text-sm">{customer.registeredAt}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                        <h2 className="font-bold text-[#111827]">Seviye</h2>
                        <div className="flex flex-wrap gap-2">
                            {customer.tier === "PLATINUM" && (
                                <span className="px-3 py-1 bg-[#FF007F]/10 text-[#FF007F] rounded-full text-xs font-bold">VIP</span>
                            )}
                            {customer.tier === "ELITE" && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">Premium</span>
                            )}
                            {customer.tier === "STANDARD" && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Standart</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
