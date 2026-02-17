"use client";

import { useState } from "react";

const ATTRIBUTES = [
    { id: 1, name: "Renk", values: ["Siyah", "Beyaz", "Kırmızı", "Kahverengi", "Tan", "Bordo", "Krem"], productCount: 42 },
    { id: 2, name: "Beden", values: ["Nano", "Baby", "Small", "Medium", "Large"], productCount: 38 },
    { id: 3, name: "Materyal", values: ["Deri", "Canvas", "İpek", "Süet", "Nylon"], productCount: 35 },
    { id: 4, name: "Marka", values: ["Gucci", "Prada", "Saint Laurent", "Bottega Veneta", "Loewe", "Céline", "Hermes"], productCount: 48 },
];

export default function AdminAttributesPage() {
    const [expandedId, setExpandedId] = useState<number | null>(1);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Özellik Yönetimi</h1>
                    <p className="text-sm text-[#6B7280] mt-1">Ürün özelliklerini ve değerlerini yönetin</p>
                </div>
                <button className="flex items-center gap-2 bg-[#FF007F] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#D6006B] transition-colors">
                    <span className="material-icons text-xl">add</span>
                    Yeni Özellik
                </button>
            </div>

            {/* Attribute Cards */}
            <div className="space-y-4">
                {ATTRIBUTES.map((attr) => (
                    <div key={attr.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        <button
                            onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                            className="w-full flex items-center justify-between p-6 hover:bg-[#F9FAFB] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#FF007F]/10 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-[#FF007F] text-xl">tune</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-[#111827]">{attr.name}</h3>
                                    <p className="text-xs text-[#9CA3AF]">{attr.values.length} değer · {attr.productCount} üründe kullanılıyor</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <span className="material-icons text-[#6B7280] text-xl">edit</span>
                                </button>
                                <span className={`material-icons text-[#9CA3AF] transition-transform ${expandedId === attr.id ? "rotate-180" : ""}`}>expand_more</span>
                            </div>
                        </button>
                        {expandedId === attr.id && (
                            <div className="px-6 pb-6 border-t border-[#F3F4F6]">
                                <div className="pt-4 flex flex-wrap gap-2">
                                    {attr.values.map((v) => (
                                        <span key={v} className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] text-sm px-4 py-2 rounded-full">
                                            {v}
                                            <button className="ml-1 text-[#9CA3AF] hover:text-red-500 transition-colors">
                                                <span className="material-icons text-sm">close</span>
                                            </button>
                                        </span>
                                    ))}
                                    <button className="inline-flex items-center gap-1 border border-dashed border-[#D1D5DB] text-[#9CA3AF] text-sm px-4 py-2 rounded-full hover:border-[#FF007F] hover:text-[#FF007F] transition-colors">
                                        <span className="material-icons text-sm">add</span>
                                        Değer Ekle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
