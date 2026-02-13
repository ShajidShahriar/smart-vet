"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    Sparkles,
    Clock,
    ChevronRight,
    ArrowLeft,
    LayoutGrid,
    Search,
    Bell,
    Settings,
    Moon,
    BarChart3,
    Mail,
    Calendar,
    ListTodo,
    Receipt,
    Layers,
    PieChart,
    Table,
    ScanText,
    Briefcase,
    ShieldCheck,
    Menu,
    X,
    type LucideIcon,
} from "lucide-react";
import pdfToText from "react-pdftotext";
import JobsDashboard, { Job, DUMMY_JOBS } from "./JobsDashboard";
import JobDetailView from "./JobDetailView";
import AddJobModal from "./AddJobModal";
import SettingsView from "./SettingsView";

// ─── Dummy Data ──────────────────────────────────────────────────────
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

const DUMMY_RECENTS = [
    { id: 1, name: "John_Doe_Resume.pdf", date: "Feb 12, 2026", score: "92%", status: "Pass" as const, category: "Senior React Developer" },
    { id: 2, name: "Jane_Smith_CV.pdf", date: "Feb 11, 2026", score: "41%", status: "Fail" as const, category: "UX Designer" },
    { id: 3, name: "Alex_Johnson_Resume.pdf", date: "Feb 10, 2026", score: "87%", status: "Pass" as const, category: "Backend Engineer (Node.js)" },
    { id: 4, name: "Maria_Garcia_CV.pdf", date: "Feb 09, 2026", score: "63%", status: "Pass" as const, category: "Senior React Developer" },
    { id: 5, name: "James_Wilson_Resume.pdf", date: "Feb 08, 2026", score: "29%", status: "Fail" as const, category: "DevOps Engineer" },
    { id: 6, name: "Emily_Chen_Resume.pdf", date: "Feb 07, 2026", score: "88%", status: "Pass" as const, category: "Backend Engineer (Node.js)" },
    { id: 7, name: "Robert_Brown_CV.pdf", date: "Feb 06, 2026", score: "35%", status: "Fail" as const, category: "UX Designer" },
    { id: 8, name: "Sarah_Davis_Resume.pdf", date: "Feb 05, 2026", score: "76%", status: "Pass" as const, category: "Senior React Developer" },
    { id: 9, name: "Michael_Lee_CV.pdf", date: "Feb 04, 2026", score: "54%", status: "Pass" as const, category: "DevOps Engineer" },
    { id: 10, name: "Olivia_Martinez_Resume.pdf", date: "Feb 03, 2026", score: "22%", status: "Fail" as const, category: "Backend Engineer (Node.js)" },
    { id: 11, name: "Daniel_Taylor_CV.pdf", date: "Feb 02, 2026", score: "91%", status: "Pass" as const, category: "Senior React Developer" },
    { id: 12, name: "Sophia_Anderson_Resume.pdf", date: "Feb 01, 2026", score: "68%", status: "Pass" as const, category: "UX Designer" },
    { id: 13, name: "Chris_Thomas_CV.pdf", date: "Jan 31, 2026", score: "19%", status: "Fail" as const, category: "DevOps Engineer" },
    { id: 14, name: "Rachel_White_Resume.pdf", date: "Jan 30, 2026", score: "83%", status: "Pass" as const, category: "Backend Engineer (Node.js)" },
    { id: 15, name: "Kevin_Harris_CV.pdf", date: "Jan 29, 2026", score: "47%", status: "Fail" as const, category: "Senior React Developer" },
    { id: 16, name: "Amanda_Clark_Resume.pdf", date: "Jan 28, 2026", score: "95%", status: "Pass" as const, category: "UX Designer" },
    { id: 17, name: "Brian_Lewis_CV.pdf", date: "Jan 27, 2026", score: "31%", status: "Fail" as const, category: "DevOps Engineer" },
    { id: 18, name: "Jessica_Robinson_Resume.pdf", date: "Jan 26, 2026", score: "72%", status: "Pass" as const, category: "Backend Engineer (Node.js)" },
    { id: 19, name: "Nathan_Walker_CV.pdf", date: "Jan 25, 2026", score: "58%", status: "Pass" as const, category: "Senior React Developer" },
    { id: 20, name: "Laura_Hall_Resume.pdf", date: "Jan 24, 2026", score: "26%", status: "Fail" as const, category: "UX Designer" },
];

// ─── Sidebar nav items ──────────────────────────────────────────────
type NavSection = { label: string; items: { name: string; icon: LucideIcon; active?: boolean; badge?: string }[] };
const NAV_SECTIONS: NavSection[] = [
    {
        label: "MENU",
        items: [
            { name: "Dashboard", icon: LayoutGrid, badge: "5" },
        ],
    },
    {
        label: "CONFIGURATION",
        items: [
            { name: "Active Jobs", icon: Briefcase, badge: "New" },
            { name: "Settings & API", icon: Settings },
            { name: "Security", icon: ShieldCheck },
        ],
    },
];

// ─── Animation ──────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
    }),
};

// ─── Stat Card ──────────────────────────────────────────────────────
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
            {/* Left color block */}
            <div className={`${color} w-[72px] flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {/* Right data */}
            <div className="flex-1 bg-white px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">{label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            </div>
        </motion.div>
    );
}

// ─── Scan Row (shared) ──────────────────────────────────────────────
function ScanRow({ item }: { item: typeof DUMMY_RECENTS[number] }) {
    return (
        <tr className="border-b border-gray-100 last:border-0 hover:bg-[var(--body-bg)] transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--body-bg)] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                </div>
            </td>
            <td className="py-4 pr-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--body-bg)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--card-border)]">
                    {item.category}
                </span>
            </td>
            <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">{item.date}</td>
            <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">{item.score}</td>
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.status === "Pass" ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className={`text-sm font-medium ${item.status === "Pass" ? "text-emerald-600" : "text-red-600"}`}>{item.status}</span>
                </div>
            </td>
        </tr>
    );
}

// ─── Table Header ───────────────────────────────────────────────────
function TableHeader() {
    return (
        <thead>
            <tr className="border-b border-gray-100">
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">File Name</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Category</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Date</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 pr-4">Score</th>
                <th className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3">Status</th>
            </tr>
        </thead>
    );
}

// ─── Component ───────────────────────────────────────────────────────
export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showAllScans, setShowAllScans] = useState(false);
    const [activeView, setActiveView] = useState<string>("Dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedJobRole, setSelectedJobRole] = useState("");
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

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
        setUploading(true);
        try {
            const text = await pdfToText(file);
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, text }),
            });
            const result = await response.json();
            if (result.success) {
                alert("✅ Analysis complete! Check your terminal.");
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

    return (
        <div className="flex min-h-screen bg-[var(--body-bg)]">
            {/* ─── Sidebar ─────────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col w-60 bg-[var(--sidebar-bg)] text-white fixed inset-y-0 left-0 z-40">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/[0.06]">
                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-base font-bold tracking-tight">Smart-Vet</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <p className="text-[10px] font-semibold tracking-widest text-[var(--sidebar-text)] uppercase mb-2 px-2">
                                {section.label}
                            </p>
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.name}>
                                        <button
                                            onClick={() => { setActiveView(item.name); setShowAllScans(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] transition-all duration-200 ${activeView === item.name
                                                ? "bg-emerald-500 text-white font-semibold"
                                                : "text-slate-400 font-medium hover:text-slate-200 hover:bg-white/[0.05]"
                                                }`}
                                        >
                                            <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${activeView === item.name ? "text-white" : ""}`} />
                                            <span className="flex-1 text-left">{item.name}</span>
                                            {item.badge && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeView === item.name
                                                    ? "bg-white/20 text-white"
                                                    : "bg-slate-700 text-slate-300"
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="px-4 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white">
                            {DUMMY_USER.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{DUMMY_USER.name}</p>
                            <p className="text-[10px] text-[var(--sidebar-text)] truncate">{DUMMY_USER.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Menu (dropdown from top) ───────────────────── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        {/* Dropdown panel */}
                        <motion.div
                            className="fixed top-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] text-white rounded-b-2xl shadow-2xl lg:hidden"
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                            {/* Mobile header */}
                            <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                                    <span className="text-base font-bold tracking-tight">Smart-Vet</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Mobile nav */}
                            <nav className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                                {NAV_SECTIONS.map((section) => (
                                    <div key={section.label}>
                                        <p className="text-[10px] font-semibold tracking-widest text-[var(--sidebar-text)] uppercase mb-2 px-2">
                                            {section.label}
                                        </p>
                                        <ul className="space-y-1">
                                            {section.items.map((item) => (
                                                <li key={item.name}>
                                                    <button
                                                        onClick={() => { setActiveView(item.name); setShowAllScans(false); setMobileMenuOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] transition-all duration-200 ${activeView === item.name
                                                            ? "bg-emerald-500 text-white font-semibold"
                                                            : "text-slate-400 font-medium hover:text-slate-200 hover:bg-white/[0.05]"
                                                            }`}
                                                    >
                                                        <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${activeView === item.name ? "text-white" : ""}`} />
                                                        <span className="flex-1 text-left">{item.name}</span>
                                                        {item.badge && (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeView === item.name
                                                                ? "bg-white/20 text-white"
                                                                : "bg-slate-700 text-slate-300"
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>
                            {/* Mobile footer */}
                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white">
                                        {DUMMY_USER.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">{DUMMY_USER.name}</p>
                                        <p className="text-[10px] text-[var(--sidebar-text)] truncate">{DUMMY_USER.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main Area ───────────────────────────────────────────── */}
            <div className="flex-1 lg:ml-60 flex flex-col">
                {/* ── Top Bar ────────────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-[var(--card-border)] flex items-center justify-between px-4 sm:px-6 gap-4">
                    {/* Hamburger + Search */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors"
                        >
                            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
                        </button>
                        <div className="flex items-center gap-2 bg-[var(--body-bg)] rounded-xl px-4 py-2.5 w-full max-w-xs">
                            <Search className="w-4 h-4 text-[var(--text-secondary)]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* Right actions */}
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

                {/* ── Page Content ───────────────────────────────────────── */}
                <main className="flex-1 p-6 space-y-6 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="popLayout">
                        {activeView === "Active Jobs" ? (
                            /* ─── VIEW: JOBS DASHBOARD ─── */
                            <motion.div
                                key="jobs-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <JobsDashboard
                                    onView={(jobId) => {
                                        setSelectedJobId(jobId);
                                        setActiveView("JobDetail");
                                    }}
                                    onEdit={(job) => {
                                        setEditingJob(job);
                                        setShowAddJobModal(true);
                                    }}
                                />
                            </motion.div>
                        ) : activeView === "JobDetail" ? (
                            /* ─── VIEW: JOB DETAIL (LEADERBOARD) ─── */
                            <motion.div
                                key="job-detail-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <JobDetailView
                                    onBack={() => {
                                        setActiveView("Active Jobs");
                                        setSelectedJobId(null);
                                    }}
                                    onEdit={() => {
                                        // Find the job data based on selectedJobId
                                        // For now, we'll just use a placeholder or the editingJob state if already set
                                        // Ideally, pass the full job object to JobDetailView or fetch it there

                                        // Since JobDetailView uses hardcoded data for now, we'll just open the modal.
                                        // In a real app, we'd pass the actual job data.
                                        const mockJob: Job = {
                                            id: selectedJobId || 1,
                                            title: "Senior React Developer",
                                            status: "Active",
                                            candidates: 42,
                                            shortlisted: 8
                                        };
                                        setEditingJob(mockJob);
                                        setShowAddJobModal(true);
                                    }}
                                />
                            </motion.div>
                        ) : activeView === "Settings & API" ? (
                            /* ─── VIEW: SETTINGS & API ─── */
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
                            /* ─── VIEW 1: DASHBOARD (Stats + Upload + Recent) ─── */
                            <motion.div
                                key="dashboard-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Stat Cards */}
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <StatCard icon={ScanText} color="bg-[var(--sidebar-bg)]" label="Total Scans" value={DUMMY_STATS.totalScans.value} index={0} />
                                    <StatCard icon={CheckCircle2} color="bg-emerald-500" label="Shortlisted" value={DUMMY_STATS.shortlisted.value} index={1} />
                                    <StatCard icon={XCircle} color="bg-red-500" label="Rejected" value={DUMMY_STATS.rejected.value} index={2} />
                                    <StatCard icon={Sparkles} color="bg-blue-500" label="Credits" value={DUMMY_STATS.credits.value} index={3} />
                                </motion.div>

                                {/* Upload + Recents Row */}
                                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-stretch">
                                    {/* Upload Zone */}
                                    <div className="xl:col-span-2 bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 flex flex-col">
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Resume</h3>

                                        {/* Job Role Dropdown */}
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
                                                {DUMMY_JOBS.filter(j => j.status === "Active").map((job) => (
                                                    <option key={job.id} value={job.title}>{job.title}</option>
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

                                    {/* Recents Table (Shared Element Source) */}
                                    <motion.div
                                        layoutId="scans-card"
                                        className="xl:col-span-3 bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
                                    >
                                        <motion.div
                                            className="p-6 flex-1 flex flex-col"
                                            initial={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                                                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Scans</h3>
                                                </div>
                                                <button
                                                    onClick={() => setShowAllScans(true)}
                                                    className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1"
                                                >
                                                    View All <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto flex-1">
                                                <table className="w-full text-left">
                                                    <TableHeader />
                                                    <tbody>
                                                        {DUMMY_RECENTS.slice(0, 5).map((item) => (
                                                            <ScanRow key={item.id} item={item} />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            /* ─── VIEW 2: ALL SCANS EXPANDED (Shared Element Target) ─── */
                            <motion.div
                                key="all-scans-expanded"
                                layoutId="scans-card"
                                initial={{ opacity: 0, zIndex: 10 }} // Ensure it stays on top
                                animate={{ opacity: 1, zIndex: 10 }}
                                exit={{ opacity: 0, zIndex: 10, transition: { duration: 0.2 } }}
                                transition={{ type: "spring", stiffness: 250, damping: 30 }} // Smooth spring
                                className="bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col min-h-[calc(100vh-8rem)] overflow-hidden"
                            >
                                <motion.div
                                    className="p-6 flex-1 flex flex-col"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.15, duration: 0.3 }} // Delay content fade-in
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowAllScans(false)}
                                                className="w-9 h-9 rounded-lg hover:bg-[var(--body-bg)] flex items-center justify-center transition-colors"
                                            >
                                                <ArrowLeft className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-bold text-[var(--text-primary)]">All Scans</h3>
                                                <p className="text-xs text-[var(--text-secondary)]">{DUMMY_RECENTS.length} total results</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left">
                                            <TableHeader />
                                            <tbody>
                                                {DUMMY_RECENTS.map((item, idx) => (
                                                    <motion.tr
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + (idx * 0.02) }} // Staggered list
                                                        className="border-b border-gray-100 last:border-0 hover:bg-[var(--body-bg)] transition-colors"
                                                    >
                                                        <td className="py-4 pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-[var(--body-bg)] flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                                                                </div>
                                                                <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">{item.date}</td>
                                                        <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">{item.score}</td>
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2.5 h-2.5 rounded-full ${item.status === "Pass" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                                <span className={`text-sm font-medium ${item.status === "Pass" ? "text-emerald-600" : "text-red-600"}`}>{item.status}</span>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* ── Footer ─────────────────────────────────────────────── */}
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
            {/* Add/Edit Job Modal - Moved to Dashboard level for global access */}
            <AnimatePresence>
                {showAddJobModal && (
                    <AddJobModal
                        isOpen={showAddJobModal}
                        onClose={() => {
                            setShowAddJobModal(false);
                            setEditingJob(null);
                        }}
                        initialData={editingJob ? {
                            id: editingJob.id,
                            title: editingJob.title,
                            department: "Engineering", // Default/Placeholder
                            description: "" // Default/Placeholder
                        } : undefined}
                        onSave={(jobData) => {
                            console.log("Saved job:", jobData);
                            setShowAddJobModal(false);
                            setEditingJob(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Toast Notification */}
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
