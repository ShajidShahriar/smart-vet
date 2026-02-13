"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, X, User } from "lucide-react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        role: string;
        image?: string;
    };
    onSignOut: () => void;
    onEditProfile: () => void;
}

export default function ProfileModal({
    isOpen,
    onClose,
    user,
    onSignOut,
    onEditProfile,
}: ProfileModalProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                layoutId="profile-modal"
                className="fixed top-20 right-6 z-50 w-80 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="p-6 text-center border-b border-[var(--card-border)] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-20 h-20 mx-auto bg-[var(--accent)] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-[var(--accent)]/20">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{user.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{user.role}</p>
                </div>

                <div className="p-2">
                    <button
                        onClick={onEditProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--body-bg)] rounded-xl transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[var(--body-bg)] flex items-center justify-center text-[var(--text-secondary)]">
                            <Settings className="w-4 h-4" />
                        </div>
                        Edit Profile
                    </button>

                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-light)]/10 rounded-xl transition-colors mt-1"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[var(--danger-light)]/20 flex items-center justify-center text-[var(--danger)]">
                            <LogOut className="w-4 h-4" />
                        </div>
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </>
    );
}
