import Link from "next/link";
import { getCustomers, getCustomerStats } from "./actions";

const levelColors: Record<string, string> = {
    VIP: "bg-[#FF007F]/10 text-[#FF007F]",
    Premium: "bg-purple-50 text-purple-700",
    Standart: "bg-gray-100 text-gray-500",
};

export default async function AdminCustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const [customers, stats] = await Promise.all([
        getCustomers(params.q),
        getCustomerStats(),
    ]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Müşteri Yönetimi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">{stats.totalCustomers} kayıtlı müşteri</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Toplam Müşteri", value: stats.totalCustomers.toLocaleString("tr-TR"), icon: "group" },
                    { label: "VIP Müşteri", value: String(stats.vipCustomers), icon: "star" },
                    { label: "Bu Ay Yeni", value: String(stats.newThisMonth), icon: "person_add" },
                    { label: "Ort. Sipariş Değeri", value: stats.avgOrderValue, icon: "analytics" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF007F]/10 rounded-xl flex items-center justify-center">
                            <span className="material-icons text-[#FF007F]">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#111827]">{s.value}</p>
                            <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB]">
                    <form className="flex items-center bg-[#F9FAFB] px-3 py-2 rounded-lg w-full max-w-md">
                        <span className="material-icons text-[#9CA3AF] text-xl mr-2">search</span>
                        <input
                            name="q"
                            defaultValue={params.q || ""}
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#9CA3AF] outline-none"
                            placeholder="Müşteri adı veya e-posta ara..."
                        />
                    </form>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#E5E7EB]">
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Müşteri</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Telefon</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Sipariş</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Harcama</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Son Sipariş</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Seviye</th>
                                <th className="text-right text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#9CA3AF]">
                                        Müşteri bulunamadı.
                                    </td>
                                </tr>
                            )}
                            {customers.map((c) => (
                                <tr key={c.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FF007F]/10 text-[#FF007F] rounded-full flex items-center justify-center text-sm font-bold">
                                                {c.name[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#111827]">{c.name}</p>
                                                <p className="text-xs text-[#9CA3AF]">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{c.phone}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{c.orders}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">{c.spent}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{c.lastOrder}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${levelColors[c.level] || ""}`}>{c.level}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/musteriler/${c.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-block">
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
