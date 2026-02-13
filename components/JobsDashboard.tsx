"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Pencil } from "lucide-react";
import AddJobModal from "./AddJobModal";

// static data, gets swapped for api calls later
export const DUMMY_JOBS = [
    { id: 1, title: "Senior React Developer", status: "Active" as const, candidates: 12, shortlisted: 3 },
    { id: 2, title: "UX Designer", status: "Active" as const, candidates: 8, shortlisted: 2 },
    { id: 3, title: "Backend Engineer (Node.js)", status: "Active" as const, candidates: 19, shortlisted: 5 },
    { id: 4, title: "Marketing Manager", status: "Closed" as const, candidates: 24, shortlisted: 6 },
    { id: 5, title: "DevOps Engineer", status: "Active" as const, candidates: 7, shortlisted: 1 },
    { id: 6, title: "Product Designer", status: "Closed" as const, candidates: 15, shortlisted: 4 },
];

export type Job = typeof DUMMY_JOBS[number];


const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
    }),
};


interface JobsDashboardProps {
    onView?: (jobId: number) => void;
    onEdit?: (job: Job) => void;
}

export default function JobsDashboard({ onView, onEdit }: JobsDashboardProps) {
    const [showModal, setShowModal] = useState(false);
    const [jobStatuses, setJobStatuses] = useState<Record<number, boolean>>(() =>
        Object.fromEntries(DUMMY_JOBS.map((j) => [j.id, j.status === "Active"]))
    );

    const toggleStatus = (id: number) => {
        setJobStatuses((prev) => ({ ...prev, [id]: !prev[id] }));
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
            if (e.key.toLowerCase() === "c") {
                e.preventDefault();
                setShowModal(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Active Job Openings</h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* the dashed card that opens the create modal */}
                {!showModal ? (
                    <motion.button
                        layoutId="create-job-card"
                        onClick={() => setShowModal(true)}
                        className="group relative flex flex-col items-center justify-center w-full h-full min-h-[180px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-colors duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600 transition-colors duration-300">
                                Create New Opening
                            </span>
                        </motion.div>
                        {/* keyboard shortcut hint */}
                        <span className="absolute bottom-4 right-4 text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 group-hover:border-emerald-200 group-hover:text-emerald-600 group-hover:bg-white transition-colors duration-300">
                            C
                        </span>
                    </motion.button>
                ) : (
                    <div className="w-full h-full min-h-[180px] rounded-lg border border-transparent" />
                )}

                {DUMMY_JOBS.map((job, i) => {
                    const isActive = jobStatuses[job.id];
                    return (
                        <motion.div
                            key={job.id}
                            layout
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full min-h-[180px] ${!isActive ? "opacity-60" : ""
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
                                            onClick={() => toggleStatus(job.id)}
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
                                    <span className="w-px h-3.5 bg-gray-200" />
                                    <span className="font-medium">{job.shortlisted} Shortlisted</span>
                                </div>
                            </div>


                            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <button
                                    onClick={() => onView?.(job.id)}
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


            <AddJobModal isOpen={showModal} onClose={() => setShowModal(false)} layoutId="create-job-card" />
        </>
    );
}
