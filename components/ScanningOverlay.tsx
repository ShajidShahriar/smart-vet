"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit } from "lucide-react";

interface ScanningOverlayProps {
    isAnalyzing: boolean;
}

export default function ScanningOverlay({ isAnalyzing }: ScanningOverlayProps) {
    const [progress, setProgress] = useState(0);

    // simulate progress to 90% while analyzing
    useEffect(() => {
        if (isAnalyzing) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + (Math.random() * 5);
                    return next > 90 ? 90 : next;
                });
            }, 500);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => setProgress(0), 500);
            return () => clearTimeout(timeout);
        }
    }, [isAnalyzing]);

    // This overlay blocks interaction and provides visual feedback
    if (!isAnalyzing && progress === 0) return null;

    return (
        <AnimatePresence>
            {isAnalyzing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-auto cursor-wait"
                >
                    {/* 1. Interaction Blocker Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                    {/* 2. Ambient Border Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "inset 0 0 0px 0px rgba(128, 128, 128, 0)",
                                    "inset 0 0 40px 10px rgba(128, 128, 128, 0.2)",
                                    "inset 0 0 0px 0px rgba(128, 128, 128, 0)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 border-[4px] border-gray-400/20 dark:border-gray-500/20 rounded-none z-50"
                        />
                    </div>

                    {/* 3. Central Analysis Hub */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gray-200 dark:bg-white/10 z-50">
                        <motion.div
                            className="h-full bg-gray-900 dark:bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                        />
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
