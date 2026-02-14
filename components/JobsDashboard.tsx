"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Pencil } from "lucide-react";
import AddJobModal from "./AddJobModal";

import { Job } from "../types";

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.02, duration: 0.15, ease: "easeOut" as const },
    }),
};

interface JobsDashboardProps {
    jobs: Job[];
    onView?: (jobId: string) => void;
    onEdit?: (job: Job) => void;
    onRefresh?: () => void;
}

export default function JobsDashboard({ jobs, onView, onEdit, onRefresh }: JobsDashboardProps) {
    const [showModal, setShowModal] = useState(false);
    const [jobStatuses, setJobStatuses] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(jobs.map((j) => [j._id, j.status === "Active"]))
    );

    // keep local toggle state in sync when jobs prop changes
    React.useEffect(() => {
        setJobStatuses(Object.fromEntries(jobs.map((j) => [j._id, j.status === "Active"])));
    }, [jobs]);

    const toggleStatus = async (id: string) => {
        const currentlyActive = jobStatuses[id];
        // optimistic update
        setJobStatuses((prev) => ({ ...prev, [id]: !prev[id] }));

        try {
            await fetch(`/api/jobs/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: currentlyActive ? "Closed" : "Active" }),
            });
            onRefresh?.();
        } catch {
            // revert on failure
            setJobStatuses((prev) => ({ ...prev, [id]: currentlyActive }));
        }
    };

    // press 'c' anywhere to create a new job
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // skip if user is typing somewhere
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA" ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }
            if (e.key === "c" || e.key === "C") setShowModal(true);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSave = async (jobData: { title: string; department: string; description: string }) => {
        try {
            await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobData),
            });
            onRefresh?.();
        } catch (error) {
            console.error("failed to create job:", error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Active Jobs</h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* the dashed card that opens the create modal */}
                {!showModal ? (
                    <motion.button
                        layoutId="create-job-card"
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ type: "spring", stiffness: 550, damping: 38, mass: 0.8 }}
                        onClick={() => setShowModal(true)}
                        className="group w-full min-h-[180px] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-transparent hover:bg-emerald-50/60 hover:border-emerald-300 transition-all duration-300 cursor-pointer relative"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-300">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 group-hover:text-emerald-600 transition-colors duration-300">
                            Create New Role
                        </span>
                        <span className="absolute bottom-4 right-4 text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 group-hover:border-emerald-200 group-hover:text-emerald-600 group-hover:bg-[var(--card-bg)] transition-colors duration-300">
                            C
                        </span>
                    </motion.button>
                ) : (
                    <div className="w-full h-full min-h-[180px] rounded-lg border border-transparent" />
                )}

                {jobs.map((job, i) => {
                    const isActive = jobStatuses[job._id];
                    return (
                        <motion.div
                            key={job._id}
                            layout
                            custom={i + 1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className={`bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full min-h-[180px] ${!isActive ? "opacity-60" : ""
                                }`}
                        >
                            <div className="p-5 flex-1 flex flex-col">

                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                                        {job.title}
                                    </h3>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span
                                            className={`text-[11px] font-semibold transition-colors duration-300 ${isActive ? "text-emerald-600" : "text-gray-400"
                                                }`}
                                        >
                                            {isActive ? "Accepting" : "Paused"}
                                        </span>
                                        <button
                                            onClick={() => toggleStatus(job._id)}
                                            className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${isActive ? "bg-emerald-500" : "bg-slate-200"
                                                }`}
                                            aria-label={`Toggle ${job.title} status`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${isActive ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>


                                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-auto">
                                    <span className="font-medium">{job.candidates} Candidates</span>
                                    <span className="w-px h-3.5 bg-[var(--card-border)]" />
                                    <span className="font-medium">{job.shortlisted} Shortlisted</span>
                                </div>
                            </div>


                            <div className="px-5 py-3 border-t border-[var(--card-border)] bg-[var(--body-bg)]/50 flex items-center gap-2">
                                <button
                                    onClick={() => onView?.(job._id)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                </button>
                                <button
                                    onClick={() => onEdit?.(job)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>


            <AddJobModal isOpen={showModal} onClose={() => setShowModal(false)} layoutId="create-job-card" onSave={handleSave} />
        </>
    );
}
