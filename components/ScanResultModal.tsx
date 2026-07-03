"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, XCircle, FileText, CheckCircle2 } from "lucide-react";
import { Scan } from "../types";

interface ScanResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    scan: Scan | null;
    onUpdateStatus: (id: string, newStatus: "Pass" | "Fail" | "Accepted" | "Rejected") => void;
}

export default function ScanResultModal({ isOpen, onClose, scan, onUpdateStatus }: ScanResultModalProps) {
    if (!scan) return null;

    // determine colors based on score
    const isPassing = scan.score >= 60;
    const scoreColor = isPassing ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500";
    const ringColor = isPassing ? "stroke-gray-900 dark:stroke-white" : "stroke-gray-300 dark:stroke-gray-600";
    // used opacity for backgrounds so they look good in both modes
    const bgClass = isPassing ? "bg-gray-50 dark:bg-[#111]" : "bg-gray-50 dark:bg-[#111]";
    const statusText = isPassing ? "Strong Match" : "Needs Improvement";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
                    />

                    {/* modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-white/10">

                            {/* Header with score breakdown */}
                            <div className={`relative p-6 flex flex-col items-center justify-center border-b border-gray-200 dark:border-white/10 ${bgClass}`}>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>

                                <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-white/10" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray="283"
                                            strokeDashoffset={283 - (283 * scan.score) / 100}
                                            strokeLinecap="round"
                                            className={`${ringColor} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className={`text-3xl font-bold font-mono ${scoreColor}`}>{scan.score}</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{scan.candidateName || "Unknown Candidate"}</h2>
                                    <div className="flex items-center justify-center gap-2 text-xs font-medium mt-1">
                                        <span className={`px-2 py-0.5 rounded ${isPassing ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                                            {statusText}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">•</span>
                                        <span className="text-gray-500 dark:text-gray-400">{scan.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Analysis Summary</h3>
                                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-[#111] p-4 rounded-lg border border-gray-200 dark:border-white/10">
                                            {scan.summary || "No summary available."}
                                        </p>
                                    </div>

                                    {scan.breakdown?.security?.flagged && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-1">
                                                <XCircle className="w-4 h-4" />
                                                Security Alert: Prompt Injection Detected
                                            </h4>
                                            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                                                {scan.breakdown.security.comment}
                                            </p>
                                        </div>
                                    )}

                                    {scan.breakdown && (
                                        <div>
                                            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Score Breakdown</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "Skills & Relevance", data: scan.breakdown.skillsMatch },
                                                    { label: "Experience & Impact", data: scan.breakdown.experience },
                                                    { label: "Projects & Links", data: scan.breakdown.projectsLinks }
                                                ].map((category, i) => category.data && (
                                                    <div key={i} className="bg-gray-50 dark:bg-[#111] p-3 rounded-lg border border-gray-200 dark:border-white/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-medium text-gray-900 dark:text-white">{category.label}</span>
                                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white font-mono">{category.data.score} / {category.data.max}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mb-3 overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gray-900 dark:bg-white rounded-full" 
                                                                style={{ width: `${(category.data.score / category.data.max) * 100}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                                            {category.data.comment}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-white/10">
                                        <FileText className="w-3.5 h-3.5" />
                                        <a
                                            href={scan.fileUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors cursor-pointer font-mono truncate"
                                        >
                                            Source file: {scan.filename}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onUpdateStatus(scan._id, "Rejected")}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm border border-red-700"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(scan._id, "Accepted")}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Shortlist Candidate
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
