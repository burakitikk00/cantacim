"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SuccessModal from "@/components/shared/SuccessModal";

const PASSWORD_RULES = [
    { regex: /.{8,}/, label: "En az 8 karakter" },
    { regex: /[A-Z]/, label: "En az bir büyük harf" },
    { regex: /[a-z]/, label: "En az bir küçük harf" },
    { regex: /[0-9]/, label: "En az bir rakam" },
    { regex: /[^A-Za-z0-9]/, label: "En az bir özel karakter" },
];

function ResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: "", message: "", icon: "check_circle" });

    const openModal = (title: string, message: string, icon = "check_circle") => {
        setModalConfig({ title, message, icon });
        setModalOpen(true);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu.");
                return;
            }

            setSuccess("Gönderildi");
            openModal("Bağlantı Gönderildi", data.message, "mark_email_read");
        } catch {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu.");
                return;
            }

            setSuccess("Tamamlandı");
            openModal("Şifre Değiştirildi", data.message, "lock_reset");
        } catch {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const showPasswordHints = password.length > 0;

    return (
        <main className="min-h-screen flex">
            <SuccessModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={modalConfig.title} 
                message={modalConfig.message} 
                icon={modalConfig.icon} 
            />
            {/* Left: Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img alt="Luxury Fashion" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8QtKVzT_HEqLRDxl73THujO_12fJIiRzxBsmD8c4v6ndLBbxcUU3UkXUjCSbNVUvXQsAI6gPshv5nV3avvfv_Igtrv9ZngT8uPcmzSVvYWzq1-DEIs8VeKTwiGZjLvifhdSTQHaJqmxEa_jqYiarOJu3DRCX8075umOnetJp8HqNDf-xFPkHf9Ysz_mdAyu3n6Ihhq5y2tVE2VUN-emUdapPRV9hyuEcZHQFcZTyMZs6-7K32S88MQ00BfvFUB81w2gQFglBe9OA6" />
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <div className="text-center text-white">
                        <span className="material-symbols-outlined text-5xl mb-4 block">diamond</span>
                        <h2 className="text-4xl font-extrabold tracking-tighter">L&apos;ELITE</h2>
                        <p className="text-white/70 mt-2 text-sm tracking-widest uppercase">Luxury Store</p>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tighter mb-8 lg:hidden">
                            <span className="material-symbols-outlined text-3xl">diamond</span>
                            L&apos;ELITE
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {token ? "Yeni Şifre Belirleyin" : "Şifremi Unuttum"}
                        </h1>
                        <p className="text-primary/50 mt-2 text-sm">
                            {token
                                ? "Yeni şifrenizi aşağıya girin"
                                : "E-posta adresinizi girin, size bir şifre sıfırlama linki gönderelim"
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm font-medium">
                            {success}
                        </div>
                    )}

                    {!token ? (
                        /* Aşama 1: E-posta gir */
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {loading ? "GÖNDERİLİYOR..." : "SIFIRLAMA LİNKİ GÖNDER"}
                            </button>
                        </form>
                    ) : (
                        /* Aşama 2: Yeni şifre gir */
                        !success && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">
                                        Yeni Şifre
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        placeholder="••••••••"
                                    />
                                    {showPasswordHints && (
                                        <div className="mt-2 space-y-1">
                                            {PASSWORD_RULES.map((rule) => {
                                                const passed = rule.regex.test(password);
                                                return (
                                                    <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? "text-green-600" : "text-primary/40"}`}>
                                                        <span className="material-symbols-outlined text-sm">{passed ? "check_circle" : "circle"}</span>
                                                        {rule.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 block mb-2">
                                        Şifre Tekrar
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? "GÜNCELLENİYOR..." : "ŞİFREMİ GÜNCELLE"}
                                </button>
                            </form>
                        )
                    )}

                    <p className="text-center text-sm text-primary/50">
                        <Link href="/auth/giris" className="font-bold text-primary hover:text-primary/60 transition-colors">
                            ← Giriş sayfasına dön
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function PasswordResetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span></div>}>
            <ResetForm />
        </Suspense>
    );
}
