import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { cat, page } = await searchParams;
    const categorySlug = typeof cat === "string" ? cat : undefined;
    const currentPage = typeof page === "string" ? parseInt(page) : 1;
    const itemsPerPage = 25;

    const where: any = { isActive: true };
    if (categorySlug) {
        where.category = { slug: categorySlug };
    }

    const totalItems = await db.product.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const products = await db.product.findMany({
        where,
        include: {
            category: true,
            variants: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
    });

    const categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
    });

    return (
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 pb-24">
            {/* Breadcrumb & Title Section */}
            <div className="mb-12">
                <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary/40 mb-4">
                    <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-primary font-medium">
                        {categorySlug
                            ? categories.find((c) => c.slug === categorySlug)?.name || "Kategori"
                            : "Tüm Koleksiyon"}
                    </span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-primary">
                            {categorySlug
                                ? categories.find((c) => c.slug === categorySlug)?.name
                                : "Özel Koleksiyon"}
                        </h2>
                        <p className="text-primary/40 mt-2 text-sm">
                            Toplam {totalItems} içerisinden {products.length} ürün listeleniyor.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-widest text-primary/60">Sırala:</span>
                            <select className="border-none bg-transparent focus:ring-0 text-sm font-semibold p-0 cursor-pointer hover:text-primary/60 outline-none">
                                <option>Önerilenler</option>
                                <option>En Yeniler</option>
                                <option>Fiyat: Artan</option>
                                <option>Fiyat: Azalan</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Sidebar: Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 border-r border-primary/5 pr-8 hidden lg:block">
                    {/* Filter Group: Kategoriler */}
                    <div>
                        <button className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-widest border-b border-primary/10">
                            KATEGORİLER
                            <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <Link
                                href="/urunler"
                                className={`flex items-center gap-3 cursor-pointer group ${!categorySlug ? "text-primary font-bold" : "text-primary/60"
                                    }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                <span className="text-sm transition-colors">Tümü</span>
                            </Link>
                            {categories.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/urunler?cat=${c.slug}`}
                                    className={`flex items-center gap-3 cursor-pointer group ${categorySlug === c.slug ? "text-primary font-bold" : "text-primary/60"
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-opacity ${categorySlug === c.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></span>
                                    <span className="text-sm transition-colors">{c.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Filter Group: Fiyat */}
                    <div>
                        <button className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-widest border-b border-primary/10">
                            FİYAT
                            <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <div className="mt-6 px-2">
                            <input className="w-full h-1 bg-primary/10 appearance-none cursor-pointer accent-primary rounded-lg" type="range" />
                            <div className="flex justify-between mt-3 text-[11px] font-medium text-primary/60">
                                <span>0 TL</span>
                                <span>50.000 TL+</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full bg-primary text-white py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all rounded">
                            Filtreleri Uygula
                        </button>
                    </div>
                </aside>

                {/* Product Grid */}
                <section className="flex-1">
                    {products.length === 0 ? (
                        <div className="text-center py-20 bg-background-light rounded-lg">
                            <span className="material-symbols-outlined text-6xl text-primary/20 mb-4">inventory_2</span>
                            <h3 className="text-xl font-light text-primary">Ürün Bulunamadı</h3>
                            <p className="text-primary/40 mt-2 text-sm">Bu kategoride henüz ürün bulunmuyor.</p>
                            <Link
                                href="/urunler"
                                className="inline-block mt-6 text-[11px] font-bold uppercase tracking-widest border-b border-primary pb-1 hover:text-primary/60"
                            >
                                Tüm Koleksiyona Dön
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                                {products.map((product) => {
                                    // Use main image or fallback to any variant's image
                                    const displayImage = product.images[0] || product.variants.find(v => v.image)?.image;

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/urunler/${product.slug}`}
                                            className="product-card group cursor-pointer block"
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden bg-background-light rounded-lg">
                                                {displayImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={displayImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary/20 bg-gray-50">
                                                        <span className="material-symbols-outlined text-4xl">image</span>
                                                    </div>
                                                )}
                                                <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100">
                                                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                                                </button>
                                                <div className="quick-view absolute inset-x-4 bottom-4 opacity-0 transform translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                                    <button className="w-full bg-white py-3 text-[11px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all rounded">
                                                        Hızlı Bakış
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-6 space-y-1.5 text-center px-2">
                                                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50">
                                                    {product.category.name}
                                                </h3>
                                                <p className="text-[15px] font-normal text-primary line-clamp-1">
                                                    {product.name}
                                                </p>
                                                <p className="text-[16px] font-bold text-primary">
                                                    {formatPrice(Number(product.basePrice))}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex justify-center items-center gap-2">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/urunler?${new URLSearchParams({
                                                ...(categorySlug ? { cat: categorySlug } : {}),
                                                page: (currentPage - 1).toString(),
                                            })}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </Link>
                                    )}

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                        // Simple pagination logic: show all for now, or could limit if many pages
                                        // For now showing all pages up to a reasonable amount or simple logic
                                        if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                                            if (Math.abs(p - currentPage) === 3) return <span key={p} className="text-primary/40">...</span>;
                                            return null;
                                        }

                                        return (
                                            <Link
                                                key={p}
                                                href={`/urunler?${new URLSearchParams({
                                                    ...(categorySlug ? { cat: categorySlug } : {}),
                                                    page: p.toString(),
                                                })}`}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${currentPage === p
                                                    ? "bg-primary text-white border border-primary"
                                                    : "border border-primary/20 text-primary hover:bg-primary/5"
                                                    }`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    })}

                                    {currentPage < totalPages && (
                                        <Link
                                            href={`/urunler?${new URLSearchParams({
                                                ...(categorySlug ? { cat: categorySlug } : {}),
                                                page: (currentPage + 1).toString(),
                                            })}`}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
