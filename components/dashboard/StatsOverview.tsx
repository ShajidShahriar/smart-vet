"use client";
import React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// fadeUp variant logic
const fadeUp = {
    hidden: { opacity: 0, y: -30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

function StatCard({
    icon: Icon,
    color,
    label,
    value,
    index,
}: {
    icon: LucideIcon;
    color: string;
    label: string;
    value: string;
    index: number;
}) {
    return (
        <motion.div
            custom={index}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col hover:border-gray-300 dark:hover:border-white/30 transition-colors"
        >
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white font-mono mt-1">{value}</p>
        </motion.div>
    );
}

interface StatsOverviewProps {
    stats: {
        totalScans: { value: string; change: string; up: boolean };
        shortlisted: { value: string; change: string; up: boolean };
        rejected: { value: string; change: string; up: boolean };
        credits: { value: string; change: string; up: boolean };
    };
    icons: {
        ScanText: LucideIcon;
        CheckCircle2: LucideIcon;
        XCircle: LucideIcon;
        Sparkles: LucideIcon;
    }
}

export default function StatsOverview({ stats, icons }: StatsOverviewProps) {
    const { ScanText, CheckCircle2, XCircle, Sparkles } = icons;

    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <StatCard icon={ScanText} color="text-gray-600 dark:text-gray-300" label="Total Scans" value={stats.totalScans.value} index={0} />
            <StatCard icon={CheckCircle2} color="text-gray-600 dark:text-gray-300" label="Shortlisted" value={stats.shortlisted.value} index={1} />
            <StatCard icon={XCircle} color="text-gray-600 dark:text-gray-300" label="Rejected" value={stats.rejected.value} index={2} />
            <StatCard icon={Sparkles} color="text-gray-600 dark:text-gray-300" label="Credits" value={stats.credits.value} index={3} />
        </motion.div>
    );
}
