import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white pt-24 pb-12">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Kurumsal */}
                    <div>
                        <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Kurumsal</h4>
                        <ul className="space-y-4 text-sm text-primary/60">
                            <li><Link href="/hikayemiz" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Mağazalarımız</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Kariyer</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Sürdürülebilirlik</Link></li>
                        </ul>
                    </div>
                    {/* Müşteri Hizmetleri */}
                    <div>
                        <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Müşteri Hizmetleri</h4>
                        <ul className="space-y-4 text-sm text-primary/60">
                            <li><Link href="/iletisim" className="hover:text-primary transition-colors">Bize Ulaşın</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Sıkça Sorulan Sorular</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">İade ve Değişim</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Teslimat Bilgileri</Link></li>
                        </ul>
                    </div>
                    {/* Hızlı Linkler */}
                    <div>
                        <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Hızlı Linkler</h4>
                        <ul className="space-y-4 text-sm text-primary/60">
                            <li><Link href="/hesap" className="hover:text-primary transition-colors">Hesabım</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Sipariş Takibi</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Hediye Kartı</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Üyelik Programı</Link></li>
                        </ul>
                    </div>
                    {/* Takip Edin */}
                    <div>
                        <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Takip Edin</h4>
                        <div className="flex gap-4 mb-8">
                            <a href="#" className="w-10 h-10 border border-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-xl">camera</span>
                            </a>
                            <a href="#" className="w-10 h-10 border border-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-xl">music_note</span>
                            </a>
                            <a href="#" className="w-10 h-10 border border-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-xl">share</span>
                            </a>
                        </div>
                        <p className="text-sm text-primary/40 leading-relaxed">
                            Nişantaşı, Abdi İpekçi Cd. No:42<br />Şişli, İstanbul
                        </p>
                    </div>
                </div>

                <div className="border-t border-primary/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-xs text-primary/40">© 2024 L&apos;ELITE Luxury Retail. Tüm Hakları Saklıdır.</p>
                    <div className="flex gap-4 items-center opacity-40">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="material-symbols-outlined">credit_card</span>
                        <span className="font-bold italic text-xs tracking-tighter">VISA</span>
                        <span className="font-bold italic text-xs tracking-tighter">MASTERCARD</span>
                    </div>
                    <div className="flex gap-8 text-xs text-primary/40">
                        <Link href="#" className="hover:text-primary">Kullanım Koşulları</Link>
                        <Link href="#" className="hover:text-primary">KVKK</Link>
                        <Link href="#" className="hover:text-primary">Çerez Politikası</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
