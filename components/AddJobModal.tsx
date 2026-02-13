"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Briefcase } from "lucide-react";

interface JobData {
    id?: number;
    title: string;
    department: string;
    description: string;
}

// ─── Component ───────────────────────────────────────────────────────
interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    layoutId?: string;
    initialData?: JobData | null;
    onSave?: (job: JobData) => void;
}

export default function AddJobModal({ isOpen, onClose, layoutId, initialData, onSave }: AddJobModalProps) {
    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({ title: false, department: false, description: false });

    // Populate form when initialData changes or reset when modal opens in create mode
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDepartment(initialData.department); // Note: In dummy data this might not match dropdown exactly, but good for now
            setDescription(initialData.description || "");
        } else {
            // Reset if opening in create mode
            if (isOpen) {
                setTitle("");
                setDepartment("");
                setDescription("");
            }
        }
        // Reset errors whenever initialData or isOpen changes
        setErrors({ title: false, department: false, description: false });
    }, [initialData, isOpen]);

    const handleSubmit = () => {
        let hasErrors = false;
        const newErrors = { title: false, department: false, description: false };

        if (!title.trim()) {
            newErrors.title = true;
            hasErrors = true;
        }
        if (!department.trim()) {
            newErrors.department = true;
            hasErrors = true;
        }
        if (!description.trim()) {
            newErrors.description = true;
            hasErrors = true;
        }

        setErrors(newErrors);

        if (!hasErrors) {
            onSave?.({
                id: initialData?.id, // Pass id if it exists for editing
                title,
                department,
                description,
            });
            onClose();
            // Reset form fields after successful save
            setTitle("");
            setDepartment("");
            setDescription("");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Panel (Shared Element) */}
                    <motion.div
                        layoutId={layoutId}
                        className="pointer-events-auto relative w-full max-w-lg bg-white rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Content Container (Fades in after expansion) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.15, duration: 0.2 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)]">
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">{initialData ? "Edit Job" : "Post New Job"}</h2>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-[var(--text-secondary)]" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Job Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Senior React Developer"
                                        className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--body-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all ${errors.title ? "border-red-500" : "border-[var(--card-border)]"
                                            }`}
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-500">Job Title is required.</p>}
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                        Department
                                    </label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--body-bg)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all appearance-none cursor-pointer ${errors.department ? "border-red-500" : "border-[var(--card-border)]"
                                            }`}
                                    >
                                        <option value="" disabled>Select department</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="design">Design</option>
                                        <option value="marketing">Marketing</option>
                                    </select>
                                    {errors.department && <p className="mt-1 text-xs text-red-500">Department is required.</p>}
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                                        Job Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={10}
                                        placeholder="Paste the full LinkedIn job post or requirements here..."
                                        className={`w-full px-4 py-3 rounded-lg border bg-[var(--body-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none leading-relaxed ${errors.description ? "border-red-500" : "border-[var(--card-border)]"
                                            }`}
                                    />
                                    <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
                                        This text is what the AI will use to grade resumes later.
                                    </p>
                                    {errors.description && <p className="mt-1 text-xs text-red-500">Job Description is required.</p>}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:bg-gray-200/50 hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                                >
                                    {initialData ? "Update Role" : "Save Role"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
