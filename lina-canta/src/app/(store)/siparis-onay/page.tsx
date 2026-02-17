import Link from "next/link";

export default function OrderConfirmationPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-24">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Siparişiniz Alındı!</h1>
                <p className="text-primary/60 mb-8">Teşekkürler, siparişiniz başarıyla oluşturuldu.</p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-primary/60">Sipariş No:</span>
                        <span className="font-bold font-mono">#ORD-2024-001</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-primary/60">Tarih:</span>
                        <span className="font-medium">16 Şub 2024</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-primary/60">Toplam Tutar:</span>
                        <span className="font-bold">₺146.700</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-primary/60">Ödeme Yöntemi:</span>
                        <span className="font-medium">Kredi Kartı (**** 4242)</span>
                    </div>
                </div>

                <p className="text-xs text-primary/40 mb-8">
                    Sipariş detaylarınız ve takip numarası e-posta adresinize gönderilecektir.
                </p>

                <div className="space-y-4">
                    <Link href="/hesap/siparisler" className="block w-full bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                        Sipariş Takibi
                    </Link>
                    <Link href="/" className="block w-full bg-white border border-gray-200 text-primary py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors">
                        Alışverişe Dön
                    </Link>
                </div>
            </div>
        </main>
    );
}
