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
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 flex flex-col min-h-[calc(100vh-8rem)] overflow-hidden"
        >
            <motion.div
                className="p-6 flex-1 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ delay: 0.15, duration: 0.3 }} // waits for card to settle first
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Scans</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{filteredScans.length} total results</p>
                        </div>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search scans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pl-4">File Name</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2">Category</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2">Date</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2">Score</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pl-2">Status</th>
                                <th className="pb-3 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScans.map((item, idx) => (
                                <motion.tr
                                    key={item._id}
                                    onClick={() => onSelectScan(item)}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                    className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <td className="py-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{item.candidateName || "Unknown"}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{item.filename}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-transparent text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/20 whitespace-nowrap">
                                            {item.category || "General"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white font-mono">{item.score}%</td>
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.status === "Accepted" || item.status === "Pass" ? "bg-gray-900 dark:bg-white" : item.status === "Pending" ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-right">
                                        <button
                                            onClick={(e) => onDeleteScan(e, item._id)}
                                            className="p-1.5 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
