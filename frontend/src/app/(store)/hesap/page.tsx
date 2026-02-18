import Link from "next/link";

const ACCOUNT_NAV = [
    { icon: "person", label: "Hesap Bilgileri", href: "/hesap" },
    { icon: "shopping_bag", label: "Siparişlerim", href: "/hesap/siparisler" },
    { icon: "location_on", label: "Adreslerim", href: "/hesap/adresler" },
    { icon: "favorite", label: "Favorilerim", href: "/hesap/favoriler" },
    { icon: "confirmation_number", label: "Kuponlarım", href: "/hesap/kuponlar" },
    { icon: "logout", label: "Çıkış Yap", href: "/auth/giris" },
];

export default function AccountPage() {
    return (
        <main className="max-w-[1200px] mx-auto px-6 pt-28 pb-24">
            <h1 className="text-3xl font-bold tracking-tight mb-12">Hesabım</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="space-y-1">
                        {ACCOUNT_NAV.map((item) => (
                            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-primary/70 hover:text-primary">
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <div className="lg:col-span-3">
                    {/* Welcome Card */}
                    <div className="bg-gray-50 rounded-xl p-8 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">A</div>
                            <div>
                                <h2 className="text-xl font-bold">Hoş geldiniz, Admin</h2>
                                <p className="text-sm text-primary/50">admin@linabutik.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { icon: "shopping_bag", title: "Siparişlerim", value: "3 Aktif", desc: "2 teslim edildi" },
                            { icon: "favorite", title: "Favorilerim", value: "8 Ürün", desc: "2 indirimde" },
                            { icon: "confirmation_number", title: "Kuponlarım", value: "2 Kupon", desc: "1 kullanılabilir" },
                        ].map((s) => (
                            <div key={s.title} className="border border-gray-100 rounded-xl p-6 space-y-2">
                                <span className="material-symbols-outlined text-primary/60">{s.icon}</span>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/60">{s.title}</h3>
                                <p className="text-xl font-bold">{s.value}</p>
                                <p className="text-xs text-primary/40">{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Profile Form */}
                    <div className="border border-gray-100 rounded-xl p-8">
                        <h3 className="text-lg font-bold mb-6">Kişisel Bilgiler</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Ad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" defaultValue="Admin" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Soyad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" defaultValue="User" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">E-posta</label>
                                <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" defaultValue="admin@linabutik.com" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Telefon</label>
                                <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary" placeholder="+90 5XX XXX XX XX" />
                            </div>
                            <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest hover:bg-black transition-colors">KAYDET</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
