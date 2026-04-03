"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    icon?: string;
}

export default function SuccessModal({ isOpen, onClose, title, message, icon = "check_circle" }: SuccessModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center transform animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold tracking-widest text-sm uppercase py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                    TAMAM
                </button>
            </div>
        </div>,
        document.body
    );
}
