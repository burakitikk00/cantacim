export default function ContactPage() {
    return (
        <main className="pt-20">
            {/* Hero */}
            <section className="bg-background-alt py-24">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <span className="text-primary/40 text-xs font-bold tracking-[0.4em] uppercase block mb-4">İletişim & Concierge</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Size Nasıl Yardımcı Olabiliriz?</h1>
                    <p className="text-primary/60 max-w-xl mx-auto">Kişisel alışveriş deneyiminiz için concierge ekibimiz hizmetinizde.</p>
                </div>
            </section>

            <section className="max-w-[1200px] mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold mb-8">Mesaj Gönderin</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Ad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Adınız" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Soyad</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Soyadınız" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">E-posta</label>
                                <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="ornek@email.com" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Konu</label>
                                <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                                    <option>Sipariş Hakkında</option>
                                    <option>Ürün Bilgisi</option>
                                    <option>İade & Değişim</option>
                                    <option>Genel Soru</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">Mesaj</label>
                                <textarea rows={5} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none" placeholder="Mesajınızı yazın..." />
                            </div>
                            <button className="bg-primary text-white px-12 py-4 font-bold text-sm tracking-widest hover:bg-black transition-colors rounded">
                                GÖNDER
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-8">İletişim Bilgileri</h2>
                            <div className="space-y-6">
                                {[
                                    { icon: "location_on", title: "Adres", detail: "Nişantaşı, Abdi İpekçi Cd. No:42\nŞişli, İstanbul" },
                                    { icon: "call", title: "Telefon", detail: "+90 212 555 00 42" },
                                    { icon: "mail", title: "E-posta", detail: "concierge@lelite.com.tr" },
                                    { icon: "schedule", title: "Çalışma Saatleri", detail: "Pazartesi - Cumartesi: 10:00 - 20:00\nPazar: 12:00 - 18:00" },
                                ].map((c) => (
                                    <div key={c.title} className="flex gap-4 items-start">
                                        <div className="w-12 h-12 bg-background-alt rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-xl">{c.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">{c.title}</h4>
                                            <p className="text-sm text-primary/60 whitespace-pre-line">{c.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
