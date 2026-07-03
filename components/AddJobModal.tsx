"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Briefcase } from "lucide-react";

interface JobData {
    id?: string;
    title: string;
    department: string;
    description: string;
}

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

    // sync form fields when switching between create and edit mode
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDepartment(initialData.department); // might not match dropdown exactly with dummy data
            setDescription(initialData.description || "");
        } else {
            // clean slate for create mode
            if (isOpen) {
                setTitle("");
                setDepartment("");
                setDescription("");
            }
        }
        // clear validation state on mode change
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
                id: initialData?.id, // keeps the id for edits, undefined for creates
                title,
                department,
                description,
            });
            onClose();
            // clear form after save
            setTitle("");
            setDepartment("");
            setDescription("");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">

                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* layoutId connects this to the ghost card in JobsDashboard */}
                    <motion.div
                        layoutId={layoutId}
                        className="pointer-events-auto relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ type: "spring", stiffness: 550, damping: 38, mass: 0.8 }}
                    >
                        {/* content fades in after the panel expands */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.2 }}
                        >

                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{initialData ? "Edit Job" : "Post New Job"}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>


                            <div className="px-5 py-5 space-y-5">

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Senior React Developer"
                                        className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors ${errors.title ? "border-red-500" : "border-gray-200 dark:border-white/10"
                                            }`}
                                    />
                                    {errors.title && <p className="mt-1 text-[10px] text-red-500 font-medium">Job Title is required.</p>}
                                </div>


                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Department
                                    </label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors appearance-none cursor-pointer ${errors.department ? "border-red-500" : "border-gray-200 dark:border-white/10"
                                            }`}
                                    >
                                        <option value="" disabled>Select department</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="design">Design</option>
                                        <option value="marketing">Marketing</option>
                                    </select>
                                    {errors.department && <p className="mt-1 text-[10px] text-red-500 font-medium">Department is required.</p>}
                                </div>


                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Job Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={10}
                                        placeholder="Paste the full LinkedIn job post or requirements here..."
                                        className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors resize-none leading-relaxed ${errors.description ? "border-red-500" : "border-gray-200 dark:border-white/10"
                                            }`}
                                    />
                                    <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                                        This text is what the AI will use to grade resumes later.
                                    </p>
                                    {errors.description && <p className="mt-1 text-[10px] text-red-500 font-medium">Job Description is required.</p>}
                                </div>
                            </div>


                            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111]/50">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
