"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, XCircle, FileText, CheckCircle2 } from "lucide-react";

interface ScanResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    scan: {
        _id: string;
        filename: string;
        candidateName: string;
        score: number;
        status: "Pass" | "Fail" | "Pending" | "Accepted" | "Rejected";
        summary: string;
        category: string;
    } | null;
    onUpdateStatus: (id: string, newStatus: "Pass" | "Fail" | "Accepted" | "Rejected") => void;
}

export default function ScanResultModal({ isOpen, onClose, scan, onUpdateStatus }: ScanResultModalProps) {
    if (!scan) return null;

    // determine colors based on score
    const isPassing = scan.score >= 60;
    const scoreColor = isPassing ? "text-emerald-600" : "text-rose-600";
    const ringColor = isPassing ? "stroke-emerald-500" : "stroke-rose-500";
    const bgColor = isPassing ? "bg-emerald-50" : "bg-rose-50";
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">

                            {/* Header with score breakdown */}
                            <div className={`relative p-6 flex flex-col items-center justify-center border-b border-gray-100 ${bgColor}`}>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
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
                                        <span className={`text-3xl font-bold ${scoreColor}`}>{scan.score}</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-gray-900">{scan.candidateName || "Unknown Candidate"}</h2>
                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full ${isPassing ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                            {statusText}
                                        </span>
                                        <span>•</span>
                                        <span>{scan.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Analysis Summary</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {scan.summary || "No summary available."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100">
                                        <FileText className="w-4 h-4" />
                                        <a
                                            href={`/uploads/${scan.filename}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
                                        >
                                            Source file: {scan.filename}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onUpdateStatus(scan._id, "Rejected")}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-[var(--card-bg)] border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(scan._id, "Accepted")}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all shadow-md"
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
