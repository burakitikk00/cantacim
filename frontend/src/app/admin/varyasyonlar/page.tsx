export default function AdminVariationsPage() {
    const variations = [
        { sku: "SL-SDJ-001-BLK-N", product: "Sac de Jour Nano", color: "Siyah", size: "Nano", price: "₺84.500", stock: 5, status: "Aktif" },
        { sku: "SL-SDJ-001-TAN-N", product: "Sac de Jour Nano", color: "Tan", size: "Nano", price: "₺84.500", stock: 7, status: "Aktif" },
        { sku: "SL-SDJ-001-RED-N", product: "Sac de Jour Nano", color: "Bordo", size: "Nano", price: "₺86.000", stock: 2, status: "Düşük Stok" },
        { sku: "GC-GGM-002-BLK-S", product: "GG Marmont Shoulder", color: "Siyah", size: "Small", price: "₺62.200", stock: 4, status: "Aktif" },
        { sku: "GC-GGM-002-PNK-S", product: "GG Marmont Shoulder", color: "Pembe", size: "Small", price: "₺62.200", stock: 0, status: "Tükendi" },
        { sku: "BV-TPC-003-WHT-M", product: "The Pouch Clutch", color: "Beyaz", size: "Medium", price: "₺96.750", stock: 3, status: "Düşük Stok" },
    ];

    const statusColors: Record<string, string> = {
        "Aktif": "bg-green-50 text-green-700",
        "Düşük Stok": "bg-yellow-50 text-yellow-700",
        "Tükendi": "bg-red-50 text-red-700",
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Varyasyon & Stok Matrisi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Tüm ürün varyasyonları ve stok durumları</p>
                </div>
                <button className="flex items-center gap-2 bg-[#FF007F] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors">
                    <span className="material-icons text-xl">add</span>
                    Varyasyon Ekle
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Toplam Varyasyon", value: "142", icon: "grid_view", color: "bg-blue-50 text-blue-600" },
                    { label: "Düşük Stok", value: "18", icon: "warning", color: "bg-yellow-50 text-yellow-600" },
                    { label: "Tükendi", value: "7", icon: "error", color: "bg-red-50 text-red-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                            <span className="material-icons">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#111827]">{s.value}</p>
                            <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Variations Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] flex flex-wrap gap-4 items-center">
                    <div className="flex items-center bg-[#F9FAFB] px-3 py-2 rounded-lg flex-1 min-w-[200px]">
                        <span className="material-icons text-[#9CA3AF] text-xl mr-2">search</span>
                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#9CA3AF]" placeholder="SKU ile ara..." />
                    </div>
                    <select className="border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm">
                        <option>Tüm Ürünler</option>
                    </select>
                    <select className="border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm">
                        <option>Tüm Durumlar</option>
                        <option>Aktif</option>
                        <option>Düşük Stok</option>
                        <option>Tükendi</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#E5E7EB]">
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">SKU</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Ürün</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Renk</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Beden</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Fiyat</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Stok</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">Durum</th>
                                <th className="text-right text-xs font-bold uppercase tracking-widest text-[#9CA3AF] px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variations.map((v) => (
                                <tr key={v.sku} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">{v.sku}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">{v.product}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{v.color}</td>
                                    <td className="px-6 py-4 text-sm text-[#6B7280]">{v.size}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">{v.price}</td>
                                    <td className="px-6 py-4">
                                        <input type="number" defaultValue={v.stock} className="w-20 border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm text-center focus:ring-1 focus:ring-[#FF007F] focus:border-[#FF007F]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[v.status] || ""}`}>{v.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <span className="material-icons text-[#6B7280] text-xl">edit</span>
                                        </button>
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
