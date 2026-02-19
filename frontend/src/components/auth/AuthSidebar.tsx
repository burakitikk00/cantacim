"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "./AuthForm";

interface AuthSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthSidebar({ isOpen, onClose }: AuthSidebarProps) {
    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop (Left side essentially) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Sidebar (Right side) */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-primary z-[61] shadow-2xl overflow-y-auto"
                    >
                        <div className="p-6 sm:p-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold tracking-widest uppercase">Hesabım</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <AuthForm onSuccess={onClose} isModal />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
