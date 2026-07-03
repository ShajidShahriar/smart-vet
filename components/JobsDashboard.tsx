"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Pencil } from "lucide-react";
import AddJobModal from "./AddJobModal";

import { Job } from "../types";

const cardVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Active Jobs</h2>
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
                        className="group w-full min-h-[180px] rounded-lg border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 cursor-pointer relative"
                    >
                        <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center transition-colors duration-300 border border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:group-hover:border-white/40">
                            <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                            Create New Role
                        </span>
                        <span className="absolute bottom-4 right-4 text-[10px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
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
                            className={`bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 flex flex-col h-full min-h-[180px] ${!isActive ? "opacity-60 grayscale hover:grayscale-0" : ""
                                }`}
                        >
                                <div className="p-5 flex-1 flex flex-col">

                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                            {job.title}
                                        </h3>
                                        <div className="shrink-0 flex items-center gap-2">
                                            <span
                                                className={`text-[10px] uppercase font-semibold tracking-wider transition-colors duration-300 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                                                    }`}
                                            >
                                                {isActive ? "Accepting" : "Paused"}
                                            </span>
                                            <button
                                                onClick={() => toggleStatus(job._id)}
                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${isActive ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                                                    }`}
                                            aria-label={`Toggle ${job.title} status`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-all duration-300 ${isActive ? "translate-x-5 bg-white dark:bg-black" : "translate-x-0 bg-white"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>


                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                        <span className="font-medium">{job.candidates} Candidates</span>
                                        <span className="w-px h-3.5 bg-gray-200 dark:bg-white/10" />
                                        <span className="font-medium">{job.shortlisted} Shortlisted</span>
                                    </div>
                                </div>


                                <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] flex items-center gap-2">
                                    <button
                                        onClick={() => onView?.(job._id)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        View
                                    </button>
                                    <button
                                        onClick={() => onEdit?.(job)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
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
