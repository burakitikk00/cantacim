import Link from "next/link";

const PRODUCTS = [
    { brand: "GUCCI", name: "Dionysus Mini Leather Bag", price: "24.500 TL", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwBQX8dRVkHZ2H1Gfv7OOzQm8AniVNCTWyGGjmrhY5nyRBLiBl1PMYRyFn-UfwsWbz-1WS38JCZpe53K_LGIheaxyU-6ariFK_I_u0UTgWpn_S_e7IwOhDjlu9GCdJ6DYkUSuevOvoPSFxdCmPqnd0Uyq1WoNC7fQHP5DbWraSxEpcP8hOTFIlsdQpKVT2YWG_ibtMmHgJiHJHVftQdvyCJMy4OZWaJsO6fITfMKWi1VYaU_cYYLso3ioFmpz13WEC5js5dR6KwW9g" },
    { brand: "PRADA", name: "Cleo Brushed Leather Bag", price: "32.200 TL", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoVYCq_L_oyrOJVM7ehReMLap1cIDDN-ddjp1hUKO1NHHKODVGlfrV8EoXN0FL6uCH4MEfrXiMHjIEU-8BSSDvF2Qce1gsMyrtBI0jRBSqamSuVd82GFPz7A0H4B7-PoNdK2nuLVt8VZ4F6b6e4oregePiUS83Q1M1JJoR0brou6AfHv54C5A6z_C47L7R9cEeimQsG7WaCN0fMBCw1BIy9O5ISMOJa0svkxl7GxCVtqJAJwk2ilQpE7d0apl8qTxslRS2j8FQx5e5" },
    { brand: "HERMES", name: "Carré 90 Silk Scarf", price: "12.800 TL", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApoaX37g9c3rJvioT88La0HMWzLAFoA1gm7Y4_BCkNh86jXKQF_Wctm4ckuJSCjNCmoHGp6apydz5IQsoc3TRYAY52bX5aI1iOTAXlUnPjlu32dzyiIPhM4sHBph7Zsb1IGinTg3nnvtbsoHs98f_WfVNAqe8kvTuQwKPyuM7COIRrNKuvcWIByaAt-9-Kmobl1UQP0hAp_gFl5018IZyzciAMT2NYL5fwzUv7WAggBTddVCIlHItDWVT8ZdU20gUNjOnUDJlS0yYL" },
    { brand: "SAINT LAURENT", name: "Loulou Medium Bag", price: "45.000 TL", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnUsTKCO1TbwzbHR1ulJ_-pFNwTB43brmxykrNtuP29ysJcpIN4oNyC8XfVNQA1seLX-hW4GlvW0s7I7gO0KzTlgzYJBVjIKtqaMTy-brSlFCrG5rlMLL2dVym3ILSH2uUjxa6Ht0Md_j23ePBCchKhAnjoQi3Jht-vuGIO_O6OmimVdZ0uQANWWTOHIrvguzwWWlkYYM0zTg-6eSuo9oRyC4nbASg1agoI2HCo7TY0A1gAiBij0eO66zEuglXXvaScCWn6CtJU7jn" },
];

const CATEGORIES = [
    { name: "Lüks Çantalar", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKWxe881n95ir27wFG0NfFT4TFlGz8ODP6YUcb0CsG05ufc8DO6TLs7vlhEudXNjomqf4EkW7c4jHmsj_muZYPBkMI7sZB-UeFhNaDJx_QNyiA9vpi9ZiiRCoq5XVBVDogwS6HSTVaXLeEjABcfhzPkVy_DcVTOqfPzrbiO0QsK7cmrwSZ23Yy782vjI72y4lWomYvDp0RIEzIKXTkAuT63CPcYpwi-TB_Qq_fIvJQXz05xzrgJ3a3BOYSpzzKAhdpoWExUJCLdyfV" },
    { name: "İpek Şallar", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEYBjQASbFdmvPOsld6PEC43ZEUy4fbcgE2hCiF1P2MfcB3FzPS80sbzAmtJY4jE2IDAY-CTNMw3SOqtG_N5_Gn0IlgWThGzbcYHZaBe7_7mxKh5ulg6pZ07ZyEyIH5q2bJsdxgA1WDMug-o3G2kmp1XjuEN-ZtZ9ziAbC2B7PCTq6dpNmoJg1NiqvEyQJWuWrRwHhBOCY26mVAMMFB1TXN_VSizEZad3KmxtHwYf-Qc3Gr-Sh_4odCNGN0mAmBvadLXsoYpM97hET" },
    { name: "Yeni Sezon", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuACmHZ1JYZV6qzxjmMjRPYyfmBa2WRFoMDk46Pa5aqylNq7LOL2OSAoNGYgww9kw3LYeSv44fGo211emZcaxlNK28s28keCgg6knz2LVgct4GjZ6BCCbU0lUilEPvpJDeNSU6s15M5fWG6jusvzJcKM2mYJ7OIeS-rcsM7I4tfdRXSeVRSanJARJc88YAvvITrqMdYS44COeB4A2CYseQZw0m5bVf16US2FeWCKVJy59-U6zOfi5BxZD1Wj3S4yHHD7xFnzlIDOZn-u" },
];

export default function HomePage() {
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
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href="/urunler" className="group cursor-pointer relative aspect-[3/4] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={cat.img} />
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
                        {PRODUCTS.map((p) => (
                            <div key={p.name} className="product-card min-w-[320px] group cursor-pointer">
                                <div className="relative aspect-[4/5] bg-white overflow-hidden mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img alt={p.name} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500" src={p.img} />
                                    <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-primary text-xs font-bold px-6 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                                        HIZLI EKLE
                                    </button>
                                </div>
                                <p className="text-xs text-primary/40 font-bold tracking-widest mb-1">{p.brand}</p>
                                <h3 className="font-medium mb-1">{p.name}</h3>
                                <p className="text-sm font-bold">{p.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promotion Banners */}
            <section className="max-w-[1440px] mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group h-[500px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Hermes Etkisi" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb17di4d60daPHp5D8RQL-TxFLukaIfl9TLn-JmqmApYutxSVokeEaojn9JAGz6fK0IRMf8dbYr7ax6kFZgldkCshn_j2zbfMOfDlx_VLQTQFj4x7ycKCiMD3AZrpRG1qcwQTxAwq8kslXhv58iyRk8-8fGfrirUO-0Ju3ThuENiCOuEOlITa9ZJHPA60JxwlEtTEMBnmIu07sLzxROzA4EhKyT0aeGZWDHHL2LH9hhRKQIaVA4SESTY5ssrl7woy43WHGEFkZsvtJ" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-12">
                            <h2 className="text-white text-4xl font-extrabold mb-6 uppercase tracking-tight">Yeni Sezon:<br />Hermes Etkisi</h2>
                            <Link href="/urunler" className="text-white border-b border-white pb-1 text-sm font-bold tracking-widest hover:text-white/70 transition-colors">İNCELE</Link>
                        </div>
                    </div>
                    <div className="relative group h-[500px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Özel İndirimler" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXIoLl2c9XNQsWVmvmNisaFD4XT8Lo2z6mTlgIxmfwq7Ch3r61Em6G-RUDjTz1e9G5xC55oZJAagmRne53C9t9uCI5uNAfVGfLkEdybK6J4x9nQGCyLQ3ixCb1S6DSUms53MV8iqnymviCTKabjKt74jv49MZ65Tk8GEuatZIALkqLN5HhUYnC9vQZ-VZFkwZ5bPQo5XZQ1s4IYqSM82CBLWN3MPCyFiU4-KyS_oyb515aY4-a6QIo_AsWqaSYpnda4JUf3vSFbg0H" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-12">
                            <h2 className="text-white text-4xl font-extrabold mb-6 uppercase tracking-tight">Özel İndirimler</h2>
                            <p className="text-white/90 mb-8 max-w-xs font-medium italic">Seçili ikonik modellerde %30&apos;a varan ayrıcalıklı fiyatlar.</p>
                            <Link href="/urunler" className="text-white border-b border-white pb-1 text-sm font-bold tracking-widest hover:text-white/70 transition-colors">ŞİMDİ AL</Link>
                        </div>
                    </div>
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
