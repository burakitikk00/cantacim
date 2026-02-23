"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { approveReview, unapproveReview, deleteReview } from "./actions";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    createdAt: Date;
    product: {
        name: string;
        slug: string;
        images: string[];
    };
    user: {
        name: string | null;
        surname: string | null;
        email: string;
    };
    order: {
        orderNumber: string;
    };
}

interface ReviewManagementClientProps {
    initialReviews: Review[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function ReviewManagementClient({
    initialReviews,
    total,
    totalPages,
    currentPage
}: ReviewManagementClientProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");

    const handleApprove = async (id: string) => {
        setIsLoading(id);
        const result = await approveReview(id);
        if (result.success) {
            setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: true } : r));
        } else {
            alert(result.error);
        }
        setIsLoading(null);
    };

    const handleUnapprove = async (id: string) => {
        setIsLoading(id);
        const result = await unapproveReview(id);
        if (result.success) {
            setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: false } : r));
        } else {
            alert(result.error);
        }
        setIsLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setIsLoading(id);
        const result = await deleteReview(id);
        if (result.success) {
            setReviews(reviews.filter(r => r.id !== id));
        } else {
            alert(result.error);
        }
        setIsLoading(null);
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "APPROVED" && review.isApproved) ||
            (statusFilter === "PENDING" && !review.isApproved);

        return matchesSearch && matchesStatus;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${i < rating ? "fill-icon" : "text-gray-300"}`}>
                        star
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Ürün, müşteri veya yorum ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                        />
                    </div>
                </div>
                <div className="flex bg-gray-100/50 p-1 rounded-lg w-full sm:w-auto">
                    {[
                        { id: "ALL", label: "Tümü" },
                        { id: "PENDING", label: "Bekleyenler" },
                        { id: "APPROVED", label: "Onaylılar" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id as any)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === tab.id
                                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Ürün</th>
                                <th className="px-6 py-4">Müşteri / Sipariş</th>
                                <th className="px-6 py-4">Puan & Yorum</th>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-gray-300">speaker_notes_off</span>
                                            <p className="text-sm font-medium">Yorum bulunamadı</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={review.product.images[0]?.startsWith('http') ? review.product.images[0] : `/uploads/${review.product.images[0]}`}
                                                        alt={review.product.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={review.product.name}>{review.product.name}</span>
                                                    <span className="text-xs text-gray-500">{review.product.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{review.user.name} {review.user.surname}</span>
                                                <span className="text-xs text-gray-500">{review.user.email}</span>
                                                <span className="text-[10px] text-gray-400 mt-1 uppercase">Sipariş: #{review.order.orderNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm whitespace-normal">
                                            <div className="flex flex-col gap-1.5">
                                                {renderStars(review.rating)}
                                                {review.comment ? (
                                                    <p className="text-xs text-gray-600 line-clamp-2" title={review.comment}>{review.comment}</p>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Yorum yazılmamış</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(review.createdAt), "d MMM yyyy", { locale: tr })}</span>
                                                <span className="text-xs text-gray-400">{format(new Date(review.createdAt), "HH:mm")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${review.isApproved
                                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                                    : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${review.isApproved ? "bg-green-600" : "bg-amber-600"}`}></span>
                                                {review.isApproved ? "Onaylı" : "Beklemede"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {review.isApproved ? (
                                                    <button
                                                        onClick={() => handleUnapprove(review.id)}
                                                        disabled={isLoading === review.id}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors ring-1 ring-transparent hover:ring-amber-200 disabled:opacity-50"
                                                        title="Onayı Kaldır"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">unpublished</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={isLoading === review.id}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors ring-1 ring-transparent hover:ring-green-200 disabled:opacity-50"
                                                        title="Onayla"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    disabled={isLoading === review.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors ring-1 ring-transparent hover:ring-red-200 disabled:opacity-50"
                                                    title="Sil"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-auto px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
                        <span>Toplam {total} yorumdan {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, total)} arası gösteriliyor</span>
                        <div className="flex gap-1">
                            {/* Pagination would be implemented here with router.push */}
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">Sayfa {currentPage} / {totalPages}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
