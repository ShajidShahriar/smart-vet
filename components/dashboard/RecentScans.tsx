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

export default function RecentScans({ scans, onViewAll, onSelectScan, onDeleteScan }: RecentScansProps) {
    return (
        // layoutId="scans-card" powers the expand transition
        <motion.div
            layoutId="scans-card"
            className="xl:col-span-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden flex flex-col min-w-0"
        >
            <motion.div
                className="p-6 flex-1 flex flex-col"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Scans</h3>
                    </div>
                    <button
                        onClick={onViewAll}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline flex items-center gap-1"
                    >
                        View All <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pl-4 w-[35%]">File Name</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2 w-[20%]">Category</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2 w-[15%]">Date</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 px-2 w-[10%]">Score</th>
                                <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pl-2 w-[15%]">Status</th>
                                <th className="pb-3 pr-4 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {scans.slice(0, 5).map((item) => (
                                <tr
                                    key={item._id}
                                    onClick={() => onSelectScan(item)}
                                    className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <td className="py-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.candidateName || "Unknown"}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.filename}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="max-w-[120px] truncate">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-transparent text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/20 whitespace-nowrap">
                                                {item.category || "General"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white font-mono">{item.score}%</td>
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.status === "Accepted" || item.status === "Pass" ? "bg-gray-900 dark:bg-white" : item.status === "Pending" ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.status}</span>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
