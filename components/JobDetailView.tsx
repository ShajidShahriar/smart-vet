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
    onDeleteJob: () => void;
    onSelectCandidate: (scan: Scan) => void;
    onDeleteCandidate: (e: React.MouseEvent, id: string) => void;
}

export default function JobDetailView({ job, candidates, onBack, onEdit, onDeleteJob, onSelectCandidate, onDeleteCandidate }: JobDetailViewProps) {
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
        <div className="w-full text-gray-900 dark:text-white space-y-8 animate-fade-in">


            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                    >
                        <ArrowLeft className="text-gray-500 dark:text-gray-400" size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{job.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${job.status === "Active" ? "bg-gray-900 dark:bg-white" : "bg-gray-400"}`}></span>
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${job.status === "Active" ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.department}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Posted on {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onDeleteJob}
                        className="bg-red-600 text-white hover:bg-red-700 border border-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                    <button
                        onClick={onEdit}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 border border-transparent px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Edit Job
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* ranked candidates table */}
                <div className="col-span-12 xl:col-span-8 space-y-6">


                    <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 text-sm outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${showFilters ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'}`}
                                >
                                    <Filter size={14} /> Filters
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="p-3 border-t border-gray-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 appearance-none"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Shortlisted">Shortlisted (Pass/Accepted)</option>
                                        <option value="Rejected">Rejected (Fail)</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Score</label>
                                    <select
                                        value={minScore}
                                        onChange={(e) => setMinScore(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 appearance-none"
                                    >
                                        <option value="0">All Scores</option>
                                        <option value="50">&gt; 50%</option>
                                        <option value="80">&gt; 80%</option>
                                        <option value="90">&gt; 90%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Sort By</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 appearance-none"
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


                    <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10">
                                    <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pt-3 pl-4">Candidate</th>
                                    <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pt-3 px-2">Match Score</th>
                                    <th className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 pt-3 px-2">Status</th>
                                    <th className="pb-3 pt-3 pr-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            {candidates.length === 0 ? "No candidates found for this job yet. Upload a resume to get started." : "No candidates match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((c) => (
                                        <tr
                                            key={c._id}
                                            onClick={() => onSelectCandidate(c)}
                                            className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="py-3 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-white/10">
                                                        {c.candidateName ? c.candidateName.charAt(0) : "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.candidateName || "Unknown"}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[120px]">{c.filename}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 w-20 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gray-900 dark:bg-white`}
                                                            style={{ width: `${c.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{c.score}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${c.status === "Accepted" || c.status === "Pass" ? "bg-gray-900 dark:bg-white" :
                                                        c.status === "Pending" ? "bg-gray-400 dark:bg-gray-500" :
                                                            "bg-gray-300 dark:bg-gray-600"
                                                        }`} />
                                                    <span className={`text-sm font-medium text-gray-900 dark:text-white`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-right">
                                                <button
                                                    onClick={(e) => onDeleteCandidate(e, c._id)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Candidate"
                                                >
                                                    <Trash2 size={16} />
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
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-5 border border-gray-200 dark:border-white/10">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Ranking Criteria
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills && job.skills.length > 0 ? (
                                        job.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-transparent text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium border border-gray-300 dark:border-white/20">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">No specific skills listed</span>
                                    )}
                                </div>
                            </div>
                            <div className="pt-5 border-t border-gray-200 dark:border-white/10">
                                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Overall Stats</p>
                                <div className="flex justify-between items-center px-1">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{stats.total}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-1">Total</p>
                                    </div>
                                    <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{stats.shortlisted}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-1">Shortlisted</p>
                                    </div>
                                    <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{stats.rejected}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold mt-1">Rejected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Job Description</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
