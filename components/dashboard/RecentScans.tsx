"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    Clock,
    ChevronRight,
    FileText,
    Trash2,
} from "lucide-react";
import { Scan } from "../../types";

interface RecentScansProps {
    scans: Scan[];
    onViewAll: () => void;
    onSelectScan: (scan: Scan) => void;
    onDeleteScan: (e: React.MouseEvent, id: string) => void;
}

function TableHeader() {
    return (
        <thead>
            <tr className="border-b border-gray-100">
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">File Name</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Category</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Date</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Score</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3">Status</th>
            </tr>
        </thead>
    );
}

export default function RecentScans({ scans, onViewAll, onSelectScan, onDeleteScan }: RecentScansProps) {
    return (
        // layoutId="scans-card" powers the expand transition
        <motion.div
            layoutId="scans-card"
            className="xl:col-span-3 bg-[var(--card-bg)] rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
        >
            <motion.div
                className="p-6 flex-1 flex flex-col"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Scans</h3>
                    </div>
                    <button
                        onClick={onViewAll}
                        className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1"
                    >
                        View All <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pl-4 w-[35%]">File Name</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2 w-[20%]">Category</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2 w-[15%]">Date</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2 w-[10%]">Score</th>
                                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pl-2 w-[15%]">Status</th>
                                <th className="pb-3 pr-4 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {scans.slice(0, 5).map((item) => (
                                <tr
                                    key={item._id}
                                    onClick={() => onSelectScan(item)}
                                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="py-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--body-bg)] flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.candidateName || "Unknown"}</p>
                                                <p className="text-xs text-[var(--text-secondary)] truncate">{item.filename}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="max-w-[120px] truncate">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--body-bg)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--card-border)] whitespace-nowrap">
                                                {item.category || "General"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-2 text-sm font-semibold text-[var(--text-primary)]">{item.score}%</td>
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.status === "Accepted" || item.status === "Pass" ? "bg-emerald-500" : item.status === "Pending" ? "bg-amber-400" : "bg-red-500"}`} />
                                            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{item.status}</span>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
