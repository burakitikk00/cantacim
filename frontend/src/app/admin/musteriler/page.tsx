import Link from "next/link";

const CUSTOMERS = [
    { name: "Ayşe Yılmaz", email: "ayse@mail.com", phone: "+90 532 XXX XX XX", orders: 12, spent: "₺846.500", lastOrder: "16 Şub 2024", level: "VIP" },
    { name: "Mehmet Kara", email: "mehmet@mail.com", phone: "+90 535 XXX XX XX", orders: 8, spent: "₺425.200", lastOrder: "16 Şub 2024", level: "Premium" },
    { name: "Zeynep Çelik", email: "zeynep@mail.com", phone: "+90 541 XXX XX XX", orders: 5, spent: "₺312.000", lastOrder: "15 Şub 2024", level: "Premium" },
    { name: "Ali Demir", email: "ali@mail.com", phone: "+90 555 XXX XX XX", orders: 3, spent: "₺145.000", lastOrder: "15 Şub 2024", level: "Standart" },
    { name: "Fatma Öz", email: "fatma@mail.com", phone: "+90 544 XXX XX XX", orders: 2, spent: "₺104.000", lastOrder: "14 Şub 2024", level: "Standart" },
];

const levelColors: Record<string, string> = {
    "VIP": "bg-[#FF007F]/10 text-[#FF007F]",
    "Premium": "bg-purple-50 text-purple-700",
    "Standart": "bg-gray-100 text-gray-500",
};

export default function AdminCustomersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Müşteri Yönetimi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">{CUSTOMERS.length} kayıtlı müşteri</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] text-[#374151] px-5 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                        <span className="material-icons text-xl">file_download</span>
                        CSV İndir
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Toplam Müşteri", value: "1.247", icon: "group" },
                    { label: "VIP Müşteri", value: "89", icon: "star" },
                    { label: "Bu Ay Yeni", value: "43", icon: "person_add" },
                    { label: "Ort. Sipariş Değeri", value: "₺85.200", icon: "analytics" },
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
                    <div className="flex items-center bg-[#F9FAFB] px-3 py-2 rounded-lg w-full max-w-md">
                        <span className="material-icons text-[#9CA3AF] text-xl mr-2">search</span>
                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#9CA3AF]" placeholder="Müşteri adı veya e-posta ara..." />
                    </div>
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
                            {CUSTOMERS.map((c) => (
                                <tr key={c.email} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FF007F]/10 text-[#FF007F] rounded-full flex items-center justify-center text-sm font-bold">{c.name[0]}</div>
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
                                        <Link href="/admin/musteriler/1" className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-block">
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
