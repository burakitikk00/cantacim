export default function Loading() {
    return (
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-24 relative animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
                <div className="space-y-4 w-full md:w-1/2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="h-3 w-4 bg-gray-200 rounded"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 w-3/4 max-w-sm bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-12 w-28 bg-gray-200 rounded"></div>
                    <div className="h-12 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5">
                        <div className="relative aspect-[4/5] bg-gray-100"></div>
                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 space-y-2">
                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-primary/5 flex items-center justify-between">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
