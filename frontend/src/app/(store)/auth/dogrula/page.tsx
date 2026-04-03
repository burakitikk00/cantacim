"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Bağlantı kontrol ediliyor...");

    useEffect(() => {
        if (!token || !email) {
            setStatus("error");
            setMessage("Geçersiz doğrulama linki.");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch("/api/auth/verify-email/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, email }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Doğrulama başarısız.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Bir hata oluştu. Lütfen tekrar deneyiniz.");
            }
        };

        verifyToken();
    }, [token, email]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="mb-6 flex justify-center">
                    {status === "loading" && (
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    )}
                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                    )}
                </div>
                
                <h1 className="text-2xl font-bold mb-2">E-posta Doğrulama</h1>
                <p className={`text-sm mb-8 ${status === "success" ? "text-gray-600" : "text-gray-500"}`}>
                    {message}
                </p>

                {(status === "success" || status === "error") && (
                    <Link
                        href="/"
                        className="inline-block w-full bg-primary text-white py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors"
                    >
                        {status === "success" ? "Alışverişe Başla" : "Ana Sayfaya Dön"}
                    </Link>
                )}
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span></div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}
