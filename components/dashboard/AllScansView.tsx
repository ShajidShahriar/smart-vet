"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Trash2,
    Search,
} from "lucide-react";

import { Scan } from "../../types";

interface AllScansViewProps {
    scans: Scan[];
    onBack: () => void;
    onSelectScan: (scan: Scan) => void;
    onDeleteScan: (e: React.MouseEvent, id: string) => void;
}

export default function AllScansView({ scans, onBack, onSelectScan, onDeleteScan }: AllScansViewProps) {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredScans = React.useMemo(() => {
        if (!searchQuery) return scans;
        const lower = searchQuery.toLowerCase();
        return scans.filter(s =>
            (s.candidateName && s.candidateName.toLowerCase().includes(lower)) ||
            (s.filename && s.filename.toLowerCase().includes(lower)) ||
            (s.status && s.status.toLowerCase().includes(lower))
        );
    }, [scans, searchQuery]);

    return (
        /* shares layoutId with the card above for the expand animation */
        <motion.div
            key="all-scans-expanded"
            layoutId="scans-card"
            initial={{ opacity: 0, zIndex: 10 }}
            animate={{ opacity: 1, zIndex: 10 }}
            exit={{ opacity: 0, zIndex: 10, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className="bg-[var(--card-bg)] rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col min-h-[calc(100vh-8rem)] overflow-hidden"
        >
            <motion.div
                className="p-6 flex-1 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }} // waits for card to settle first
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-lg hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors"
                        >
                            <ArrowLeft className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                        </button>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">All Scans</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{filteredScans.length} total results</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search scans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[var(--body-bg)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-shadow w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pl-4">File Name</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2">Category</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2">Date</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2">Score</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pl-2">Status</th>
                                <th className="pb-3 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScans.map((item, idx) => (
                                <motion.tr
                                    key={item._id}
                                    onClick={() => onSelectScan(item)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.02) }}
                                    className="border-b border-gray-100 last:border-0 hover:bg-[var(--body-bg)] transition-colors cursor-pointer group"
                                >
                                    <td className="py-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--body-bg)] flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">{item.candidateName || "Unknown"}</p>
                                                <p className="text-xs text-[var(--text-secondary)] truncate max-w-[180px]">{item.filename}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--body-bg)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--card-border)] whitespace-nowrap">
                                            {item.category || "General"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">{item.score}%</td>
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.status === "Accepted" || item.status === "Pass" ? "bg-emerald-500" : item.status === "Pending" ? "bg-amber-400" : "bg-red-500"}`} />
                                            <span className="text-sm font-medium text-[var(--text-primary)]">{item.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-right">
                                        <button
                                            onClick={(e) => onDeleteScan(e, item._id)}
                                            className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Delete Scan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
