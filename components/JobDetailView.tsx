"use client";
import React from "react";
import {
    ArrowLeft,
    Search,
    Filter,
    MapPin,
    Calendar,
    FileText,
    Download,
    Trash2
} from "lucide-react";
import { Job, Scan } from "../types";

interface JobDetailViewProps {
    job: Job;
    candidates: Scan[];
    onBack: () => void;
    onEdit: () => void;
    onSelectCandidate: (scan: Scan) => void;
    onDeleteCandidate: (e: React.MouseEvent, id: string) => void;
}

export default function JobDetailView({ job, candidates, onBack, onEdit, onSelectCandidate, onDeleteCandidate }: JobDetailViewProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("All");
    const [minScore, setMinScore] = React.useState<string>("0");
    const [sortOrder, setSortOrder] = React.useState<string>("newest");
    const [showFilters, setShowFilters] = React.useState(false);

    // calculate stats from real candidates
    const stats = {
        total: candidates.length,
        shortlisted: candidates.filter(c => c.status === "Pass" || c.status === "Accepted").length,
        rejected: candidates.filter(c => c.status === "Fail" || c.status === "Rejected").length,
        pending: candidates.filter(c => c.status === "Pending").length
    };

    const filteredCandidates = React.useMemo(() => {
        let result = [...candidates];

        // 1. Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(c =>
                (c.candidateName && c.candidateName.toLowerCase().includes(lower)) ||
                (c.filename && c.filename.toLowerCase().includes(lower))
            );
        }

        // 2. Status Filter
        if (statusFilter !== "All") {
            if (statusFilter === "Shortlisted") {
                result = result.filter(c => c.status === "Pass" || c.status === "Accepted");
            } else if (statusFilter === "Rejected") {
                result = result.filter(c => c.status === "Fail" || c.status === "Rejected");
            } else {
                result = result.filter(c => c.status === statusFilter);
            }
        }

        // 3. Min Score
        const min = parseInt(minScore);
        if (min > 0) {
            result = result.filter(c => c.score >= min);
        }

        // 4. Sort
        result.sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOrder === "score_high") return b.score - a.score;
            if (sortOrder === "score_low") return a.score - b.score;
            return 0;
        });

        return result;
    }, [candidates, searchQuery, statusFilter, minScore, sortOrder]);

    return (
        <div className="min-h-screen bg-[var(--body-bg)] p-8 font-sans text-[var(--text-primary)]">


            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-[var(--card-bg)] rounded-lg transition-colors border border-transparent hover:border-[var(--card-border)] hover:shadow-sm"
                    >
                        <ArrowLeft className="text-[var(--text-secondary)]" size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{job.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${job.status === "Active" ? "bg-[var(--success)]" : "bg-gray-400"}`}></span>
                                <span className={`text-sm font-semibold uppercase tracking-wide ${job.status === "Active" ? "text-[var(--success)]" : "text-gray-500"}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.department}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Posted on {new Date((job as any).createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onEdit}
                        className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >
                        Edit Job
                    </button>
                    <button className="bg-[var(--text-primary)] text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-gray-900/10 transition-all">
                        Upload Resumes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* ranked candidates table */}
                <div className="col-span-12 xl:col-span-8 space-y-6">


                    <div className="bg-[var(--card-bg)] p-2 rounded-lg border border-[var(--card-border)] shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-2.5 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-gray-100 text-[var(--text-primary)]' : 'hover:bg-gray-50 text-[var(--text-secondary)]'}`}
                                >
                                    <Filter size={16} /> Filters
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors">
                                    <Download size={16} /> Export
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="p-3 border-t border-[var(--card-border)] grid grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5 block">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-gray-50 border border-[var(--card-border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Shortlisted">Shortlisted (Pass/Accepted)</option>
                                        <option value="Rejected">Rejected (Fail)</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5 block">Score</label>
                                    <select
                                        value={minScore}
                                        onChange={(e) => setMinScore(e.target.value)}
                                        className="w-full bg-gray-50 border border-[var(--card-border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
                                    >
                                        <option value="0">All Scores</option>
                                        <option value="50">&gt; 50%</option>
                                        <option value="80">&gt; 80%</option>
                                        <option value="90">&gt; 90%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5 block">Sort By</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full bg-gray-50 border border-[var(--card-border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="score_high">Highest Score</option>
                                        <option value="score_low">Lowest Score</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--body-bg)]/50 border-b border-[var(--card-border)] text-xs uppercase text-[var(--text-secondary)] font-semibold tracking-wider">
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Match Score</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)] italic">
                                            {candidates.length === 0 ? "No candidates found for this job yet. Upload a resume to get started." : "No candidates match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((c) => (
                                        <tr
                                            key={c._id}
                                            onClick={() => onSelectCandidate(c)}
                                            className="hover:bg-[var(--body-bg)] transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                                                        {c.candidateName ? c.candidateName.charAt(0) : "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)]">{c.candidateName || "Unknown"}</p>
                                                        <p className="text-xs text-[var(--text-secondary)]">{c.filename}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${c.score >= 80 ? 'bg-[var(--success)]' : c.score >= 50 ? 'bg-amber-500' : 'bg-[var(--danger)]'}`}
                                                            style={{ width: `${c.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{c.score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${c.status === "Accepted" || c.status === "Pass" ? "bg-emerald-500" :
                                                        c.status === "Pending" ? "bg-amber-500" :
                                                            "bg-red-500"
                                                        }`} />
                                                    <span className={`text-sm font-medium ${c.status === "Accepted" || c.status === "Pass" ? "text-emerald-600" :
                                                        c.status === "Pending" ? "text-amber-600" :
                                                            "text-red-600"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => onDeleteCandidate(e, c._id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete Candidate"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* context panel: job details and required skills */}
                <div className="col-span-12 xl:col-span-4 space-y-6">

                    {/* these skills get used in ai scoring, order matters */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight mb-4">
                            Ranking Criteria
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills && job.skills.length > 0 ? (
                                        job.skills.map((skill, i) => (
                                            <span key={i} className="px-2.5 py-1.5 bg-[var(--body-bg)] text-[var(--text-secondary)] rounded-lg text-xs font-medium border border-[var(--card-border)]">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400">No specific skills listed</span>
                                    )}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[var(--card-border)]">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wide">Overall Stats</p>
                                <div className="flex justify-between items-center px-2">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Total</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--success)]">{stats.shortlisted}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Shortlisted</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--danger)]">{stats.rejected}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Rejected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[var(--text-primary)]">Job Description</h3>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
