"use client";
import React from "react";
import {
    LayoutGrid,
    Briefcase,
    Settings,
    ShieldCheck,
    Sparkles,
    X,
    type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// names must match activeView values in the main dashboard state
type NavSection = { label: string; items: { name: string; icon: LucideIcon; active?: boolean; badge?: string }[] };
const NAV_SECTIONS: NavSection[] = [
    {
        label: "Menu", // kept for key but hidden in UI
        items: [
            { name: "Dashboard", icon: LayoutGrid, badge: "5" },
        ],
    },
    {
        label: "Configuration", // kept for key but hidden in UI
        items: [
            { name: "Active Jobs", icon: Briefcase, badge: "New" },
            { name: "Settings & API", icon: Settings },
        ],
    },
];

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    setShowAllScans: (show: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    user: { name: string; role: string };
}

export default function Sidebar({
    activeView,
    setActiveView,
    setShowAllScans,
    mobileMenuOpen,
    setMobileMenuOpen,
    user
}: SidebarProps) {
    return (
        <>
            <aside className="hidden lg:flex flex-col w-60 bg-[var(--sidebar-bg)] text-white fixed inset-y-0 left-0 z-40">
                <div
                    onClick={() => { setActiveView("Dashboard"); setShowAllScans(false); }}
                    className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors"
                >
                    <img src="/smart-vet-logo.svg" alt="Smart-Vet" className="w-8 h-8" />
                    <span className="text-lg font-bold tracking-tight">Smart-Vet</span>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            {/* Section label removed per request */}
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.name}>
                                        <button
                                            onClick={() => { setActiveView(item.name); setShowAllScans(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] transition-all duration-200 ${activeView === item.name
                                                ? "bg-emerald-500 text-white font-semibold"
                                                : "text-slate-400 font-medium hover:text-slate-200 hover:bg-white/[0.05]"
                                                }`}
                                        >
                                            <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${activeView === item.name ? "text-white" : ""}`} />
                                            <span className="flex-1 text-left">{item.name}</span>
                                            {item.badge && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeView === item.name
                                                    ? "bg-white/20 text-white"
                                                    : "bg-slate-700 text-slate-300"
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-[var(--sidebar-text)] truncate">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        <motion.div
                            className="fixed top-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] text-white rounded-b-2xl shadow-2xl lg:hidden"
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
                                <div
                                    onClick={() => { setActiveView("Dashboard"); setShowAllScans(false); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <img src="/smart-vet-logo.svg" alt="Smart-Vet" className="w-8 h-8" />
                                    <span className="text-lg font-bold tracking-tight">Smart-Vet</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                                {NAV_SECTIONS.map((section) => (
                                    <div key={section.label}>
                                        {/* Section label removed */}
                                        <ul className="space-y-1">
                                            {section.items.map((item) => (
                                                <li key={item.name}>
                                                    <button
                                                        onClick={() => { setActiveView(item.name); setShowAllScans(false); setMobileMenuOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] transition-all duration-200 ${activeView === item.name
                                                            ? "bg-emerald-500 text-white font-semibold"
                                                            : "text-slate-400 font-medium hover:text-slate-200 hover:bg-white/[0.05]"
                                                            }`}
                                                    >
                                                        <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${activeView === item.name ? "text-white" : ""}`} />
                                                        <span className="flex-1 text-left">{item.name}</span>
                                                        {item.badge && (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeView === item.name
                                                                ? "bg-white/20 text-white"
                                                                : "bg-slate-700 text-slate-300"
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>

                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                                        <p className="text-[10px] text-[var(--sidebar-text)] truncate">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
