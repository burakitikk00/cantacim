export default function ProductDetailLoading() {
    return (
        <main className="max-w-7xl mx-auto px-6 pt-28 md:pt-32 pb-16 relative">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6 md:mb-12">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="h-3 w-24 bg-primary/10 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
                {/* Left Column: Image Gallery Skeleton */}
                <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 h-fit lg:top-28">
                    {/* Thumbnails */}
                    <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full md:w-16 shrink-0 no-scrollbar overflow-x-auto md:overflow-y-auto snap-x max-h-none md:max-h-[500px]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={`thumb-${i}`} className="aspect-[3/4] w-[4.5rem] md:w-full shrink-0 snap-start bg-gray-100 rounded-lg animate-pulse border border-primary/5" />
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 aspect-[3/4] max-h-[600px] w-full bg-primary/5 rounded-xl animate-pulse flex items-center justify-center border border-primary/5">
                        <span className="material-symbols-outlined text-primary/20 text-6xl">diamond</span>
                    </div>
                </div>

                {/* Right Column: Info Skeleton */}
                <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4">
                        {/* Category */}
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                        {/* Title */}
                        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-1/2 bg-gray-100 rounded animate-pulse hidden md:block"></div>
                        
                        {/* Stars & Stock */}
                        <div className="flex gap-4 items-center pt-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={`star-${i}`} className="size-4 md:size-5 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <div className="h-4 w-16 bg-primary/20 rounded animate-pulse"></div>
                        </div>

                        {/* Price */}
                        <div className="pt-4 flex items-center gap-4">
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Variations Skeleton */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                        <div className="flex gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={`var-${i}`} className="size-10 bg-gray-100 rounded-full animate-pulse border-2 border-primary/5"></div>
                            ))}
                        </div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-3 md:gap-4 pt-4">
                        <div className="flex-1 h-14 md:h-16 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">shopping_bag</span>
                        </div>
                        <div className="size-14 md:size-16 bg-gray-100 rounded-lg animate-pulse border border-primary/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-300">favorite</span>
                        </div>
                    </div>

                    {/* Accordions Skeleton */}
                    <div className="pt-8 space-y-0">
                        <div className="flex justify-between items-center py-6 border-t border-gray-100">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <span className="material-symbols-outlined text-gray-300 animate-pulse">expand_more</span>
                        </div>
                        <div className="flex justify-between items-center py-6 border-t border-gray-100">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <span className="material-symbols-outlined text-gray-300 animate-pulse">expand_more</span>
                        </div>
                        <div className="flex justify-between items-center py-6 border-t border-b border-gray-100">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <span className="material-symbols-outlined text-gray-300 animate-pulse">expand_more</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
