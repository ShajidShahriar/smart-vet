"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Upload, CheckCircle } from "lucide-react";

interface FirstTimeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FirstTimeGuideModal({ isOpen, onClose }: FirstTimeGuideModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    
                    <motion.div
                        className="pointer-events-auto relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-gray-900 dark:text-white" />
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Welcome to Smart-Vet!</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Get started with AI-powered resume screening in just a few steps:
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">1</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Create a Job</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Go to "Active Jobs" and create a job posting with its requirements. This helps our AI know what to look for.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Upload Resumes</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Select your job role on the dashboard and drag-and-drop a candidate's resume (PDF).
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">3</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Review Analysis</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Our AI will instantly grade the resume, matching it against your job description and giving you an actionable summary.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-5 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111]/50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
