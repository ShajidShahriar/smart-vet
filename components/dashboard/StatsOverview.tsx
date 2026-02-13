"use client";
import React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

// fadeUp variant logic
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
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
            className="flex rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
            <div className={`${color} w-[72px] flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 bg-[var(--card-bg)] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">{label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            </div>
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
            <StatCard icon={ScanText} color="bg-[var(--sidebar-bg)]" label="Total Scans" value={stats.totalScans.value} index={0} />
            <StatCard icon={CheckCircle2} color="bg-emerald-500" label="Shortlisted" value={stats.shortlisted.value} index={1} />
            <StatCard icon={XCircle} color="bg-red-500" label="Rejected" value={stats.rejected.value} index={2} />
            <StatCard icon={Sparkles} color="bg-blue-500" label="Credits" value={stats.credits.value} index={3} />
        </motion.div>
    );
}
