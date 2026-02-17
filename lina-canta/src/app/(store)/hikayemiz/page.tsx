import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="pt-20">
            {/* Hero */}
            <section className="relative h-[60vh] overflow-hidden">
                <div className="absolute inset-0 bg-primary/30 z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Our Story" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBukMJrg8RFeExwrpeZtec1Ig-Ej7b0dS0CdFF3SKOO3fG8JLSn3cVSK0NBni0JxTpoALfKJ8f4B1DstZvLEopEJGkvRroaLgk_YgRU04feQudX6vLkcvIbtmSSaa5zk0ZAz62ryVLUsUQQDhlDd07u29VZ5Pc7EhmPHR9lCLq1W4po8d5fq0GSpUhk2NcbyS0jV1wc1bpFWiyB7Hz-P4KZfTFJh42SpqYYUlGI3ev8obk2lGStsKJ55r42GoFuiuWTQt6YK9CL_ND" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-white/60 text-xs font-bold tracking-[0.4em] uppercase mb-6">Hikayemiz</span>
                    <h1 className="text-white text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl">Zarafetin ve Kalitenin Buluştuğu Nokta</h1>
                </div>
            </section>

            {/* Story */}
            <section className="max-w-[1000px] mx-auto px-6 py-24">
                <div className="space-y-8 text-primary/70 leading-relaxed text-lg">
                    <p>
                        L&apos;ELITE olarak, modanın sadece giyinmek değil, bir yaşam tarzı ve sanatsal bir ifade olduğuna inanıyoruz. 2010 yılında İstanbul&apos;un kalbinde, Nişantaşı&apos;nda başlayan yolculuğumuzda, dünyanın en saygın moda evlerinden özenle seçtiğimiz çantalar ve akseuarlarla stilinize elit bir dokunuş katıyoruz.
                    </p>
                    <p>
                        Her bir parçanın arkasındaki ustalığı, mirası ve tutkuyu sizinle buluştururken; kusursuz müşteri deneyimi ve güvenilir alışverişin garantisini veriyoruz.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="bg-background-alt py-24">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl font-extrabold tracking-tight text-center mb-16">Değerlerimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: "diamond", title: "Kalite", desc: "Sadece en kaliteli, orijinal ürünleri sunarız. Her parça titizlikle seçilir ve doğrulanır." },
                            { icon: "verified", title: "Güvenilirlik", desc: "Güvenli ödeme, hızlı teslimat ve %100 orijinallik garantisi ile alışverişinizi koruyoruz." },
                            { icon: "favorite", title: "Tutku", desc: "Moda ve zarafet tutkumuzu sizlerle paylaşıyoruz. Her sezon trend ve klasikleri bir araya getiriyoruz." },
                        ].map((v) => (
                            <div key={v.title} className="text-center space-y-4">
                                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-2xl">{v.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold">{v.title}</h3>
                                <p className="text-primary/60 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="max-w-[600px] mx-auto px-6">
                    <h2 className="text-3xl font-extrabold tracking-tight mb-6">Keşfetmeye Başlayın</h2>
                    <p className="text-primary/60 mb-10">Dünyaca ünlü markaların en yeni koleksiyonlarını inceleyin.</p>
                    <Link href="/urunler" className="bg-primary text-white px-12 py-4 font-bold text-sm tracking-widest hover:opacity-90 transition-opacity rounded inline-block">
                        KOLEKSİYONA GÖZ AT
                    </Link>
                </div>
            </section>
        </main>
    );
}
