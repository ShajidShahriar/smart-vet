"use client";
import React from "react";
import {
    LayoutGrid,
    Briefcase,
    Settings,
    Menu,
    X,
    type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavSection = { label: string; items: { name: string; icon: LucideIcon; active?: boolean; badge?: string | number }[] };
const NAV_SECTIONS: NavSection[] = [
    {
        label: "Menu", 
        items: [
            { name: "Dashboard", icon: LayoutGrid },
        ],
    },
    {
        label: "Configuration", 
        items: [
            { name: "Active Jobs", icon: Briefcase },
            { name: "Settings & API", icon: Settings },
        ],
    },
];

interface TopbarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    setShowAllScans: (show: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    user: { name: string; role: string; image?: string };
    badges?: {
        dashboard?: number;
        activeJobs?: number;
    };
    children?: React.ReactNode; // For passing theme toggle and profile
}

export default function Topbar({
    activeView,
    setActiveView,
    setShowAllScans,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    badges,
    children
}: TopbarProps) {
    const getBadge = (itemName: string) => {
        if (itemName === "Dashboard" && badges?.dashboard) return badges.dashboard;
        if (itemName === "Active Jobs" && badges?.activeJobs) return badges.activeJobs;
        return null;
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full h-14 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">
                <div className="flex items-center h-full">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                    >
                        <Menu className="w-4 h-4 text-gray-500" />
                    </button>

                    <div
                        onClick={() => { setActiveView("Dashboard"); setShowAllScans(false); }}
                        className="flex items-center gap-3 cursor-pointer mr-8"
                    >
                        <img src="/smartvet-dark.png" alt="Smart-Vet" className="w-6 h-6 dark:hidden block" />
                        <img src="/smartvet-light.png" alt="Smart-Vet" className="w-6 h-6 hidden dark:block" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">Smart-Vet</span>
                    </div>

                    <nav className="hidden lg:flex items-center h-full gap-1">
                        {NAV_SECTIONS.flatMap(s => s.items).map((item) => {
                            const badgeCount = getBadge(item.name);
                            const isActive = activeView === item.name;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => { setActiveView(item.name); setShowAllScans(false); }}
                                    className={`relative flex items-center gap-2 px-3 h-full text-sm font-medium transition-all duration-200 border-b-2
                                        ${isActive
                                            ? "text-gray-900 dark:text-white border-gray-900 dark:border-white"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent hover:border-gray-900 dark:hover:border-white"
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`} />
                                    <span>{item.name}</span>
                                    {badgeCount ? (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-transparent border ml-1 ${isActive
                                            ? "border-gray-400 dark:border-white/30 text-gray-900 dark:text-white"
                                            : "border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400"
                                            }`}>
                                            {badgeCount}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    {children}
                </div>
            </header>

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
                            className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl text-gray-900 dark:text-white rounded-b-lg shadow-lg border-b border-gray-200 dark:border-white/10 lg:hidden"
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-white/10">
                                <div
                                    onClick={() => { setActiveView("Dashboard"); setShowAllScans(false); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <img src="/smartvet-dark.png" alt="Smart-Vet" className="w-7 h-7 dark:hidden block" />
                                    <img src="/smartvet-light.png" alt="Smart-Vet" className="w-7 h-7 hidden dark:block" />
                                    <span className="text-sm font-bold tracking-tight">Smart-Vet</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                                {NAV_SECTIONS.map((section) => (
                                    <div key={section.label}>
                                        <ul className="space-y-1">
                                            {section.items.map((item) => {
                                                const badgeCount = getBadge(item.name);
                                                return (
                                                    <li key={item.name}>
                                                        <button
                                                            onClick={() => { setActiveView(item.name); setShowAllScans(false); setMobileMenuOpen(false); }}
                                                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${activeView === item.name
                                                                ? "bg-gray-200 dark:bg-[#111] text-gray-900 dark:text-white font-medium"
                                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                                                }`}
                                                        >
                                                            <item.icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${activeView === item.name ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`} />
                                                            <span className="flex-1 text-left truncate">{item.name}</span>
                                                            {badgeCount ? (
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-transparent border ${activeView === item.name
                                                                    ? "border-gray-400 dark:border-white/30 text-gray-900 dark:text-white"
                                                                    : "border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400"
                                                                    }`}>
                                                                    {badgeCount}
                                                                </span>
                                                            ) : null}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </nav>

                            <div className="px-4 py-4 border-t border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 px-2 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white overflow-hidden shrink-0">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
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
