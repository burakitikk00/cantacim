import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { getImageSrc } from "@/lib/image-helpers";
import { getActiveCampaigns, getBestDiscountForProduct } from "@/lib/discounts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    // Fetch categories from DB
    const categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
    });

    // Find "cantalar" category slug for the banner link
    const bagCategory = categories.find(c => c.slug === "cantalar");
    const bagCatSlug = bagCategory?.slug || "cantalar";

    // Best Sellers: group OrderItems by productId (via variant), count total sold
    const bestSellerData = await db.orderItem.groupBy({
        by: ["variantId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 20,
    });

    const bestSellerVariantIds = bestSellerData.map(d => d.variantId);

    // Get products for those variants
    const bestSellerVariants = await db.productVariant.findMany({
        where: { id: { in: bestSellerVariantIds } },
        include: {
            product: {
                include: {
                    category: true,
                    brand: true,
                    variants: {
                        where: { image: { not: null } },
                        take: 1,
                        select: { image: true },
                    },
                }
            }
        }
    });

    // Deduplicate by product id and build best sellers list
    const seenProductIds = new Set<string>();
    const bestSellers: Array<{
        id: string;
        name: string;
        slug: string;
        brand: string;
        price: string;
        oldPrice?: string;
        img: string;
        discount?: string;
    }> = [];

    const activeCampaigns = await getActiveCampaigns();

    for (const variantId of bestSellerVariantIds) {
        const variant = bestSellerVariants.find(v => v.id === variantId);
        if (!variant || !variant.product.isActive) continue;
        if (seenProductIds.has(variant.product.id)) continue;
        seenProductIds.add(variant.product.id);

        const p = variant.product;
        
        const discountData = getBestDiscountForProduct(p, activeCampaigns);
        let discountText = discountData.discountText;
        let discountedPrice = discountData.discountedPrice;

        bestSellers.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            brand: p.brand?.name || p.category.name,
            price: discountedPrice ? formatPrice(discountedPrice) : formatPrice(Number(p.basePrice)),
            oldPrice: discountedPrice ? formatPrice(Number(p.basePrice)) : undefined,
            img: getImageSrc(p.images[0] || p.variants?.find((v: { image: string | null }) => v.image)?.image || null),
            discount: discountText,
        });

        if (bestSellers.length >= 8) break;
    }

    // If not enough best sellers from orders, fill with featured/recent products
    if (bestSellers.length < 4) {
        const fillerProducts = await db.product.findMany({
            where: {
                isActive: true,
                id: { notIn: Array.from(seenProductIds) },
            },
            include: {
                category: true,
                brand: true,
                variants: {
                    where: { image: { not: null } },
                    take: 1,
                    select: { image: true },
                },
            },
            orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            take: 8 - bestSellers.length,
        });

        for (const p of fillerProducts) {
            const discountData = getBestDiscountForProduct(p, activeCampaigns);
            let discountText = discountData.discountText;
            let discountedPrice = discountData.discountedPrice;

            bestSellers.push({
                id: p.id,
                name: p.name,
                slug: p.slug,
                brand: p.brand?.name || p.category.name,
                price: discountedPrice ? formatPrice(discountedPrice) : formatPrice(Number(p.basePrice)),
                oldPrice: discountedPrice ? formatPrice(Number(p.basePrice)) : undefined,
                img: getImageSrc(p.images[0] || null),
                discount: discountText,
            });
        }
    }

    return (
        <main className="pt-20">
            {/* Hero Section */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt="Luxury designer leather handbag"
                    className="w-full h-full object-cover object-center"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8QtKVzT_HEqLRDxl73THujO_12fJIiRzxBsmD8c4v6ndLBbxcUU3UkXUjCSbNVUvXQsAI6gPshv5nV3avvfv_Igtrv9ZngT8uPcmzSVvYWzq1-DEIs8VeKTwiGZjLvifhdSTQHaJqmxEa_jqYiarOJu3DRCX8075umOnetJp8HqNDf-xFPkHf9Ysz_mdAyu3n6Ihhq5y2tVE2VUN-emUdapPRV9hyuEcZHQFcZTyMZs6-7K32S88MQ00BfvFUB81w2gQFglBe9OA6"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
                        ZAMANSIZ ŞIKLIK,<br />ELİT DOKUNUŞLAR
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl">
                        Dünyaca ünlü markaların en seçkin çanta ve şal koleksiyonlarını keşfedin.
                    </p>
                    <Link href="/urunler" className="bg-white text-primary px-10 py-4 font-bold tracking-wide rounded hover:bg-primary hover:text-white transition-all duration-300">
                        KOLEKSİYONU İNCELE
                    </Link>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="max-w-[1440px] mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.slice(0, 3).map((cat) => (
                        <Link key={cat.id} href={`/urunler?cat=${cat.slug}`} className="group cursor-pointer relative aspect-[3/4] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={getImageSrc(cat.image)} />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                            <div className="absolute bottom-8 left-8">
                                <h3 className="text-white text-2xl font-bold mb-2">{cat.name}</h3>
                                <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Keşfet</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Best Sellers */}
            <section className="bg-background-alt py-24">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight mb-2">En Çok Satanlar</h2>
                            <p className="text-primary/60">Sezonun en sevilen, ikonik parçaları.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8">
                        {bestSellers.map((p) => (
                            <Link key={p.id} href={`/urunler/${p.slug}`} className="min-w-[320px]">
                                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md cursor-pointer h-full">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={p.img} />
                                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 duration-300">
                                            <span className="material-symbols-outlined fill text-lg">favorite</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="mb-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-gray-400">{p.brand}</p>
                                            <h3 className="text-sm font-semibold text-primary line-clamp-1">{p.name}</h3>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-gray-900">{p.price}</span>
                                                {p.oldPrice && (
                                                    <span className="text-xs text-gray-400 line-through">{p.oldPrice}</span>
                                                )}
                                            </div>
                                            {p.discount && (
                                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
                                                    {p.discount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promotion Banners */}
            <section className="max-w-[1440px] mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href={`/urunler?cat=${bagCatSlug}`} className="relative group h-[500px] overflow-hidden block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Yeni Sezon Çantalar" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb17di4d60daPHp5D8RQL-TxFLukaIfl9TLn-JmqmApYutxSVokeEaojn9JAGz6fK0IRMf8dbYr7ax6kFZgldkCshn_j2zbfMOfDlx_VLQTQFj4x7ycKCiMD3AZrpRG1qcwQTxAwq8kslXhv58iyRk8-8fGfrirUO-0Ju3ThuENiCOuEOlITa9ZJHPA60JxwlEtTEMBnmIu07sLzxROzA4EhKyT0aeGZWDHHL2LH9hhRKQIaVA4SESTY5ssrl7woy43WHGEFkZsvtJ" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-12">
                            <h2 className="text-white text-4xl font-extrabold mb-6 uppercase tracking-tight">Yeni Sezon:<br />Çantalar</h2>
                            <span className="text-white border-b border-white pb-1 text-sm font-bold tracking-widest hover:text-white/70 transition-colors">İNCELE</span>
                        </div>
                    </Link>
                    <Link href="/urunler?sort=discount_desc" className="relative group h-[500px] overflow-hidden block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Özel İndirimler" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXIoLl2c9XNQsWVmvmNisaFD4XT8Lo2z6mTlgIxmfwq7Ch3r61Em6G-RUDjTz1e9G5xC55oZJAagmRne53C9t9uCI5uNAfVGfLkEdybK6J4x9nQGCyLQ3ixCb1S6DSUms53MV8iqnymviCTKabjKt74jv49MZ65Tk8GEuatZIALkqLN5HhUYnC9vQZ-VZFkwZ5bPQo5XZQ1s4IYqSM82CBLWN3MPCyFiU4-KyS_oyb515aY4-a6QIo_AsWqaSYpnda4JUf3vSFbg0H" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-12">
                            <h2 className="text-white text-4xl font-extrabold mb-6 uppercase tracking-tight">Özel İndirimler</h2>
                            <p className="text-white/90 mb-8 max-w-xs font-medium italic">Seçili ikonik modellerde %30&apos;a varan ayrıcalıklı fiyatlar.</p>
                            <span className="text-white border-b border-white pb-1 text-sm font-bold tracking-widest hover:text-white/70 transition-colors">ŞİMDİ AL</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Brand Story */}
            <section className="py-24 bg-white">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                    <div className="w-full md:w-1/2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Brand Story" className="w-full rounded shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBukMJrg8RFeExwrpeZtec1Ig-Ej7b0dS0CdFF3SKOO3fG8JLSn3cVSK0NBni0JxTpoALfKJ8f4B1DstZvLEopEJGkvRroaLgk_YgRU04feQudX6vLkcvIbtmSSaa5zk0ZAz62ryVLUsUQQDhlDd07u29VZ5Pc7EhmPHR9lCLq1W4po8d5fq0GSpUhk2NcbyS0jV1wc1bpFWiyB7Hz-P4KZfTFJh42SpqYYUlGI3ev8obk2lGStsKJ55r42GoFuiuWTQt6YK9CL_ND" />
                    </div>
                    <div className="w-full md:w-1/2">
                        <span className="text-primary/40 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">L&apos;ELITE MİRASI</span>
                        <h2 className="text-4xl font-extrabold mb-8 tracking-tight">Zarafetin ve Kalitenin Buluştuğu Nokta</h2>
                        <p className="text-primary/70 leading-relaxed mb-8">
                            L&apos;ELITE olarak, modanın sadece giyinmek değil, bir yaşam tarzı ve sanatsal bir ifade olduğuna inanıyoruz. Dünyanın en saygın moda evlerinden özenle seçtiğimiz çantalar ve %100 saf ipek şallar ile stilinize elit bir dokunuş katıyoruz.
                        </p>
                        <p className="text-primary/70 leading-relaxed mb-10">
                            Her bir parçanın arkasındaki ustalığı, mirası ve tutkuyu sizinle buluştururken; kusursuz müşteri deneyimi ve güvenilir alışverişin garantisini veriyoruz.
                        </p>
                        <Link href="/hikayemiz" className="border-b-2 border-primary pb-1 font-bold text-sm tracking-widest hover:text-primary/60 transition-colors">
                            HİKAYEMİZİ KEŞFEDİN
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="border-y border-primary/5 py-24">
                <div className="max-w-[1440px] mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">L&apos;ELITE Privé&apos;ye Katılın</h2>
                    <p className="text-primary/60 mb-10 max-w-lg mx-auto">Yeni koleksiyonlar, özel etkinlikler ve kişiselleştirilmiş tekliflerden ilk siz haberdar olun.</p>
                    <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto justify-center">
                        <input className="flex-1 bg-background-alt border-none focus:ring-1 focus:ring-primary px-6 py-4 rounded text-sm" placeholder="E-posta adresiniz" type="email" />
                        <button className="bg-primary text-white px-12 py-4 font-bold text-sm tracking-widest hover:opacity-90 transition-opacity rounded">
                            ABONE OL
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
