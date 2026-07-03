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
                className="fixed top-20 right-6 z-50 w-80 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="p-5 text-center border-b border-gray-200 dark:border-white/10 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-16 h-16 mx-auto bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-xl font-bold text-white dark:text-black mb-3 shadow-sm">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>

                <div className="p-2">
                    <button
                        onClick={onEditProfile}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                    >
                        <div className="w-7 h-7 rounded-md bg-gray-50 dark:bg-[#111] flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                            <Settings className="w-3.5 h-3.5" />
                        </div>
                        Edit Profile
                    </button>

                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors mt-1"
                    >
                        <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 border border-red-100 dark:border-red-900/30">
                            <LogOut className="w-3.5 h-3.5" />
                        </div>
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </>
    );
}
