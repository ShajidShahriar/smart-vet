"use client";
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    CheckCircle2,
    XCircle,
    Sparkles,
    Menu,
    ScanText,
    Search,
    Moon,
    Bell,
    Settings,
    type LucideIcon,
} from "lucide-react";
import pdfToText from "react-pdftotext";
import JobsDashboard from "./JobsDashboard";
import JobDetailView from "./JobDetailView";
import AddJobModal from "./AddJobModal";
import ScanResultModal from "./ScanResultModal";
import Sidebar from "./dashboard/Sidebar";
import StatsOverview from "./dashboard/StatsOverview";
import RecentScans from "./dashboard/RecentScans";
import AllScansView from "./dashboard/AllScansView";
import SettingsView from "./dashboard/SettingsView";
import ScanningOverlay from "./ScanningOverlay";
import { Job, Scan } from "../types";

// static data. all of this gets replaced once the api exists
const DUMMY_USER = {
    name: "Shajid Shahriar",
    role: "Hiring Manager",
    creditsUsed: 7,
    creditsTotal: 10,
};

const DUMMY_STATS = {
    totalScans: { value: "1,247", change: "+2.3%", up: true },
    shortlisted: { value: "976", change: "+6.3%", up: true },
    rejected: { value: "271", change: "-8.1%", up: false },
    credits: { value: `${10 - 7}/${10}`, change: "Remaining", up: true },
};




export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showAllScans, setShowAllScans] = useState(false);
    const [activeView, setActiveView] = useState<string>("Dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedJobRole, setSelectedJobRole] = useState("");
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
    const [jobs, setJobs] = useState<Job[]>([]);
    const [scans, setScans] = useState<Scan[]>([]);
    const [showScanModal, setShowScanModal] = useState(false);
    const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            const res = await fetch("/api/jobs");
            if (res.ok) setJobs(await res.json());
        } catch (err) {
            console.error("failed to fetch jobs:", err);
        }
    }, []);

    const fetchScans = useCallback(async () => {
        try {
            const res = await fetch("/api/scans");
            if (res.ok) setScans(await res.json());
        } catch (err) {
            console.error("failed to fetch scans:", err);
        }
    }, []);

    // load data on mount
    useEffect(() => {
        fetchJobs();
        fetchScans();
    }, [fetchJobs, fetchScans]);

    const showToast = useCallback((message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedJobRole) {
            showToast("Please select a job category first.");
            e.target.value = "";
            return;
        }
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!selectedJobRole) {
            showToast("Please select a job category first.");
            return;
        }
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type === "application/pdf") {
            setFile(droppedFile);
        }
    }, [selectedJobRole, showToast]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        // validate that a role is selected so we know what to grade against
        if (!selectedJobRole) {
            showToast("Please select a job role first!");
            return;
        }

        setUploading(true);
        try {
            const text = await pdfToText(file);

            // use FormData to send file + text
            const formData = new FormData();
            formData.append("file", file);
            formData.append("text", text);
            formData.append("jobTitle", selectedJobRole);

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData, // fetch automatically sets Content-Type to multipart/form-data
            });

            const result = await response.json();

            if (result.success) {
                setSelectedScan(result.scan);
                setShowScanModal(true);
                fetchScans(); // refresh the list to show the new scan
                fetchJobs(); // refresh job cards for candidate count
                setFile(null); // clear file input
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            alert("Something went wrong!");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: "Pass" | "Fail" | "Accepted" | "Rejected") => {
        try {
            await fetch(`/api/scans/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            await fetchScans(); // refresh list
            fetchJobs(); // refresh job cards for shortlisted count

            // update local modal state too so it reflects immediately if we keep it open
            if (selectedScan && selectedScan._id === id) {
                // @ts-ignore
                setSelectedScan({ ...selectedScan, status: newStatus });
            }
            setShowScanModal(false); // close on action per plan
        } catch (err) {
            console.error("failed to update status:", err);
            showToast("Failed to update status");
        }
    };

    const handleDeleteScan = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // prevent opening the modal
        if (!confirm("Are you sure you want to delete this scan? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/scans/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("Scan deleted successfully");
                fetchScans(); // refresh list
                fetchJobs(); // refresh job cards for candidate/shortlisted count
                // if the deleted scan was selected/open, close it (though modal shouldn't be open if we clicked delete on list)
                if (selectedScan && selectedScan._id === id) {
                    setShowScanModal(false);
                    setSelectedScan(null);
                }
            } else {
                showToast("Failed to delete scan");
            }
        } catch (err) {
            console.error("failed to delete scan:", err);
            showToast("Error deleting scan");
        }
    };

    const stats = React.useMemo(() => {
        const total = scans.length;
        const shortlisted = scans.filter(s => s.status === "Pass" || s.status === "Accepted").length;
        const rejected = scans.filter(s => s.status === "Fail" || s.status === "Rejected").length;

        return {
            totalScans: { value: total.toLocaleString(), change: "", up: true },
            shortlisted: { value: shortlisted.toLocaleString(), change: "", up: true },
            rejected: { value: rejected.toLocaleString(), change: "", up: false },
            credits: DUMMY_STATS.credits, // keep dummy for now per request
        };
    }, [scans]);

    return (
        <div className="flex min-h-screen bg-[var(--body-bg)]">
            <ScanningOverlay isAnalyzing={uploading} />
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                setShowAllScans={setShowAllScans}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                user={DUMMY_USER}
            />

            {/* main content */}


            <div className="flex-1 lg:ml-60 flex flex-col">

                <header className="sticky top-0 z-30 h-16 bg-white border-b border-[var(--card-border)] flex items-center justify-between px-4 sm:px-6 gap-4">

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors"
                        >
                            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2.5">
                            <span className="text-xl font-bold text-[var(--text-primary)]">Dashboard</span>
                        </div>
                    </div>


                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-xl hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors">
                            <Moon className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                        </button>
                        <button className="relative w-9 h-9 rounded-xl hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors">
                            <Bell className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className="w-9 h-9 rounded-xl hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors">
                            <Settings className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white ml-1 cursor-pointer">
                            {DUMMY_USER.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* activeView controls which page shows up here */}
                <main className="flex-1 p-6 space-y-6 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="popLayout">
                        {activeView === "Active Jobs" ? (

                            <motion.div
                                key="jobs-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <JobsDashboard
                                    jobs={jobs}
                                    onView={(jobId) => {
                                        setSelectedJobId(jobId);
                                        setActiveView("JobDetail");
                                    }}
                                    onEdit={(job) => {
                                        setEditingJob(job);
                                        setShowAddJobModal(true);
                                    }}
                                    onRefresh={fetchJobs}
                                />
                            </motion.div>
                        ) : activeView === "JobDetail" ? (

                            <motion.div
                                key="job-detail-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <JobDetailView
                                    job={jobs.find((j) => j._id === selectedJobId) as Job}
                                    candidates={scans.filter((s) => s.jobId === selectedJobId)} // filter scans by job
                                    onBack={() => {
                                        setSelectedJobId(null);
                                        setActiveView("Active Jobs");
                                    }}
                                    onEdit={() => {
                                        setEditingJob(jobs.find((j) => j._id === selectedJobId) as Job);
                                        setShowAddJobModal(true);
                                    }}
                                    onSelectCandidate={(scan) => {
                                        setSelectedScan(scan);
                                        setShowScanModal(true);
                                    }}
                                    onDeleteCandidate={handleDeleteScan}
                                />
                            </motion.div>
                        ) : activeView === "Settings & API" ? (

                            <motion.div
                                key="settings-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <SettingsView />
                            </motion.div>
                        ) : !showAllScans ? (
                            /* default dashboard view */
                            <motion.div
                                key="dashboard-main"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >

                                <StatsOverview
                                    stats={stats}
                                    icons={{ ScanText, CheckCircle2, XCircle, Sparkles }}
                                />


                                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-stretch">

                                    <div className="xl:col-span-2 bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 flex flex-col">
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Resume</h3>

                                        {/* validates that a role is picked before allowing upload */}
                                        <div className="relative mb-4">
                                            <select
                                                value={selectedJobRole}
                                                onChange={(e) => setSelectedJobRole(e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all appearance-none cursor-pointer bg-[var(--body-bg)] ${selectedJobRole
                                                    ? "border-[var(--accent)] text-[var(--text-primary)] ring-2 ring-[var(--accent)]/10"
                                                    : "border-[var(--card-border)] text-[var(--text-secondary)]"
                                                    } focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20`}
                                            >
                                                <option value="" disabled>Select a Job Role...</option>
                                                {jobs.filter(j => j.status === "Active").map((job) => (
                                                    <option key={job._id} value={job.title}>{job.title}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>

                                        <label
                                            htmlFor="resume-upload-dashboard"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`flex-1 flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all ${isDragOver
                                                ? "border-[var(--accent)] bg-[var(--accent-light)]"
                                                : file
                                                    ? "border-emerald-400 bg-[var(--success-light)]"
                                                    : "border-[var(--card-border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/50"
                                                }`}
                                        >
                                            {file ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-xl bg-[var(--success-light)] flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-emerald-600">File Ready</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">{file.name}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-xl bg-[var(--body-bg)] flex items-center justify-center">
                                                        <Upload className="w-6 h-6 text-[var(--text-secondary)]" />
                                                    </div>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">Drop Resume PDF here</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">or click to browse</p>
                                                </div>
                                            )}
                                            <input
                                                id="resume-upload-dashboard"
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>

                                        {file && (
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${uploading
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-[var(--accent)] text-white hover:opacity-90"
                                                    }`}
                                            >
                                                {uploading ? "Analyzing…" : `Analyze ${file.name}`}
                                            </button>
                                        )}
                                    </div>

                                    <RecentScans
                                        scans={scans}
                                        onViewAll={() => setShowAllScans(true)}
                                        onSelectScan={(scan) => {
                                            setSelectedScan(scan);
                                            setShowScanModal(true);
                                        }}
                                        onDeleteScan={handleDeleteScan}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <AllScansView
                                scans={scans}
                                onBack={() => setShowAllScans(false)}
                                onSelectScan={(scan) => {
                                    setSelectedScan(scan);
                                    setShowScanModal(true);
                                }}
                                onDeleteScan={handleDeleteScan}
                            />
                        )}
                    </AnimatePresence>
                </main>


                <footer className="border-t border-[var(--card-border)] bg-white px-6 py-4">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <p>© 2026 <span className="font-semibold text-[var(--text-primary)]">Smart-Vet</span>. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
                            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
                            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Support</a>
                            <span className="text-[var(--text-secondary)]/50">v0.1.0</span>
                        </div>
                    </div>
                </footer>
            </div>
            {/* modal lives here so both jobs dashboard and detail view can trigger it */}
            <AnimatePresence>
                {showAddJobModal && (
                    <AddJobModal
                        isOpen={showAddJobModal}
                        onClose={() => {
                            setShowAddJobModal(false);
                            setEditingJob(null);
                        }}
                        initialData={editingJob ? {
                            id: editingJob._id,
                            title: editingJob.title,
                            department: editingJob.department,
                            description: editingJob.description
                        } : undefined}
                        onSave={async (jobData) => {
                            try {
                                if (jobData.id) {
                                    await fetch(`/api/jobs/${jobData.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            title: jobData.title,
                                            department: jobData.department,
                                            description: jobData.description,
                                        }),
                                    });
                                } else {
                                    await fetch("/api/jobs", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(jobData),
                                    });
                                }
                                fetchJobs();
                            } catch (err) {
                                console.error("save failed:", err);
                            }
                            setShowAddJobModal(false);
                            setEditingJob(null);
                        }}
                    />
                )}
            </AnimatePresence>

            <ScanResultModal
                isOpen={showScanModal}
                onClose={() => setShowScanModal(false)}
                scan={selectedScan}
                onUpdateStatus={handleStatusUpdate}
            />

            {/* shows up when someone tries uploading without picking a role first */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl shadow-black/20"
                    >
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">!</span>
                        </div>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
