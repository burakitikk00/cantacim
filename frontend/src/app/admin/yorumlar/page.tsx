import { Metadata } from "next";
import { getReviews } from "./actions";
import ReviewManagementClient from "./ReviewManagementClient";

export const metadata: Metadata = {
    title: "Yorum Yönetimi | Admin",
    description: "Cantam Butik yorum yönetimi paneli",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;

    const result = await getReviews(page, 20);

    if (!result.success || !result.data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <p>{result.error || "Yorumlar yüklenemedi."}</p>
                </div>
            </div>
        );
    }

    const { reviews, total, totalPages, currentPage } = result.data;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Yorum Yönetimi</h1>
                    <p className="text-sm text-gray-500 mt-1">Müşteri ürün değerlendirmelerini görüntüleyin ve onaylayın.</p>
                </div>
            </div>

            <ReviewManagementClient
                initialReviews={reviews as any}
                total={total}
                totalPages={totalPages}
                currentPage={currentPage}
            />
        </div>
    );
}
