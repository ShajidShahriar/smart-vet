"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    CheckCircle2,
    XCircle,
    Sparkles,
    Menu,
    ScanText,
    Moon,
    Sun,
    Settings,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import JobsDashboard from "./JobsDashboard";
import JobDetailView from "./JobDetailView";
import AddJobModal from "./AddJobModal";
import ScanResultModal from "./ScanResultModal";
import Topbar from "./dashboard/Topbar";
import StatsOverview from "./dashboard/StatsOverview";
import RecentScans from "./dashboard/RecentScans";
import AllScansView from "./dashboard/AllScansView";
import SettingsView from "./dashboard/SettingsView";
import ProfileModal from "./dashboard/ProfileModal";
import ScanningOverlay from "./ScanningOverlay";
import FirstTimeGuideModal from "./FirstTimeGuideModal";
import { Job, Scan } from "../types";




export default function Dashboard() {
    const { data: session } = useSession();

    // derive user info from the real session, with safe fallbacks
    const user = {
        name: session?.user?.name || "User",
        role: "Hiring Manager", // TODO: pull from user profile once wired
        image: session?.user?.image || undefined,
    };
    const [file, setFile] = useState<File | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Initial page load state
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
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!localStorage.getItem("smartvet_has_seen_guide")) {
            setShowGuideModal(true);
        }
    }, []);

    const closeGuideModal = () => {
        setShowGuideModal(false);
        localStorage.setItem("smartvet_has_seen_guide", "true");
    };

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

    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                if (data.user) setUserData(data.user);
            }
        } catch (err) {
            console.error("failed to fetch user profile:", err);
        }
    }, []);

    // load data on mount with animation delay
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchJobs(),
                fetchScans(),
                fetchUserProfile(),
                new Promise((resolve) => setTimeout(resolve, 400)) // brief animation buffer
            ]);
            setIsLoading(false);
        };
        loadData();
    }, [fetchJobs, fetchScans, fetchUserProfile]);

    const showToast = useCallback((message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
    }, []);

    // upload limits
    const MAX_FILE_SIZE_MB = 5;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedJobRole) {
            showToast("Please select a job category first.");
            e.target.value = "";
            return;
        }
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showToast(`File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`);
                e.target.value = "";
                return;
            }
            setFile(selected);
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
            if (droppedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showToast(`File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`);
                return;
            }
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
            // send only the raw PDF — server extracts text (never trust client-parsed text)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("jobTitle", selectedJobRole);

            // retrieve user config (BYOK)
            const storedConfig = localStorage.getItem("smartvet_config");
            const config = storedConfig ? JSON.parse(storedConfig) : {};

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    ...(config.apiKey ? { "x-gemini-api-key": config.apiKey } : {}),
                    ...(config.strictness !== undefined ? { "x-gemini-strictness": config.strictness.toString() } : {}),
                },
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setSelectedScan(result.scan);
                setShowScanModal(true);
                fetchScans(); // refresh the list to show the new scan
                fetchJobs(); // refresh job cards for candidate count
                fetchUserProfile(); // refresh user profile to update credits
                setFile(null); // clear file input
            } else {
                showToast("Error: " + result.error);
            }
        } catch (error) {
            showToast("Something went wrong!");
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

            // update local modal state so it reflects immediately
            if (selectedScan && selectedScan._id === id) {
                setSelectedScan({ ...selectedScan, status: newStatus } as Scan);
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
        
        const creditsTotal = userData?.creditsTotal ?? 10;
        const creditsUsed = userData?.creditsUsed ?? 0;
        const creditsRemaining = userData ? Math.max(0, creditsTotal - creditsUsed) : 0;

        return {
            totalScans: { value: total.toLocaleString(), change: "", up: true },
            shortlisted: { value: shortlisted.toLocaleString(), change: "", up: true },
            rejected: { value: rejected.toLocaleString(), change: "", up: false },
            credits: { value: userData ? creditsRemaining.toString() : "—", change: userData?.subscriptionTier === 'premium' ? "Pro Plan" : "Free Plan", up: true },
        };
    }, [scans, userData]);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            <ScanningOverlay isAnalyzing={uploading || isLoading} />
            
            <Topbar
                activeView={activeView}
                setActiveView={setActiveView}
                setShowAllScans={setShowAllScans}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                user={user}
                badges={{
                    dashboard: scans.filter(s => s.status === "Pending").length,
                    activeJobs: jobs.filter(j => j.status === "Active").length
                }}
            >
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-500"
                >
                    {mounted && theme === "dark" ? (
                        <Moon className="w-4 h-4" />
                    ) : (
                        <Sun className="w-4 h-4" />
                    )}
                </button>
                <button
                    onClick={() => setActiveView("Settings & API")}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-500 hidden sm:flex"
                >
                    <Settings className="w-4 h-4" />
                </button>
                <motion.button
                    layoutId="profile-modal"
                    onClick={() => setShowProfileModal(true)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white ml-2 cursor-pointer overflow-hidden border border-gray-200 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40 transition-colors shrink-0"
                >
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </motion.button>
            </Topbar>

            {/* main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

                {/* activeView controls which page shows up here */}
                <main className="flex-1 overflow-hidden">
                    <div className="p-6 max-w-[1200px] mx-auto h-full overflow-y-auto space-y-6">
                        <AnimatePresence mode="wait">
                        {activeView === "Active Jobs" ? (

                            <motion.div
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                                    onDeleteJob={async () => {
                                        if (!confirm("Delete this job and all its data? This cannot be undone.")) return;
                                        try {
                                            await fetch(`/api/jobs/${selectedJobId}`, { method: "DELETE" });
                                            setSelectedJobId(null);
                                            setActiveView("Active Jobs");
                                            fetchJobs();
                                            fetchScans();
                                            showToast("Job deleted successfully");
                                        } catch {
                                            showToast("Failed to delete job");
                                        }
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
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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


                                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">

                                    <div className="xl:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-4 flex flex-col animate-fade-in stagger-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upload Resume</h3>

                                        {jobs.length === 0 ? (
                                            /* Inline prompt when no jobs exist yet */
                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                                <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 flex items-center justify-center mb-4">
                                                    <Sparkles className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs leading-relaxed">
                                                    Create a job posting first, then upload resumes to score candidates against it.
                                                </p>
                                                <button
                                                    onClick={() => setActiveView("Active Jobs")}
                                                    className="px-4 py-2 text-sm font-medium rounded-md bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                                >
                                                    Create Your First Job →
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                        {/* validates that a role is picked before allowing upload */}
                                        <div className="relative mb-4">
                                            <select
                                                value={selectedJobRole}
                                                onChange={(e) => setSelectedJobRole(e.target.value)}
                                                className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors appearance-none cursor-pointer bg-white dark:bg-[#0a0a0a] ${selectedJobRole
                                                    ? "border-gray-300 dark:border-white/30 text-gray-900 dark:text-white"
                                                    : "border-gray-200 dark:border-white/10 text-gray-500"
                                                    } focus:border-gray-400 dark:focus:border-gray-500`}
                                            >
                                                <option value="" disabled>Select a Job Role...</option>
                                                {jobs.filter(j => j.status === "Active").map((job) => (
                                                    <option key={job._id} value={job.title}>{job.title}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>

                                        <label
                                            htmlFor="resume-upload-dashboard"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`flex-1 flex flex-col items-center justify-center cursor-pointer rounded-lg border border-dashed p-6 transition-colors ${isDragOver
                                                ? "border-gray-400 bg-gray-50 dark:bg-[#111]"
                                                : file
                                                    ? "border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-[#111]"
                                                    : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {file ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">File Ready</p>
                                                    <p className="text-xs text-gray-500 font-mono truncate max-w-xs">{file.name}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Drop Resume PDF here</p>
                                                    <p className="text-xs text-gray-500">or click to browse</p>
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
                                                className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploading
                                                    ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
                                                    }`}
                                            >
                                                {uploading ? "Analyzing…" : `Analyze ${file.name}`}
                                            </button>
                                        )}
                                            </>
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
                    </div>
                </main>


                <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black px-6 py-4 mt-auto">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between text-xs text-gray-500">
                        <p>© 2026 <span className="font-semibold text-gray-900 dark:text-white">Smart-Vet</span>. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Terms</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Support</a>
                            <span className="text-gray-400 dark:text-gray-600">v0.1.1</span>
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

            <AnimatePresence>
                {showProfileModal && (
                    <ProfileModal
                        isOpen={showProfileModal}
                        onClose={() => setShowProfileModal(false)}
                        user={user}
                        onSignOut={() => signOut()}
                        onEditProfile={() => {
                            setShowProfileModal(false);
                            setActiveView("Settings & API");
                        }}
                    />
                )}
            </AnimatePresence>

            <FirstTimeGuideModal 
                isOpen={showGuideModal}
                onClose={closeGuideModal}
            />

            {/* shows up when someone tries uploading without picking a role first */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-[#0a0a0a] shadow-lg"
                    >
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-white">!</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
