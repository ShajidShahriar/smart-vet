"use client";
import React from "react";
import {
    ArrowLeft,
    Search,
    Filter,
    MapPin,
    Calendar,
    FileText,
    Download
} from "lucide-react";

interface JobDetailViewProps {
    onBack: () => void;
    onEdit: () => void;
}

export default function JobDetailView({ onBack, onEdit }: JobDetailViewProps) {
    // static for now, backend will feed this per jobId
    const job = {
        title: "Senior React Developer",
        department: "Engineering",
        status: "Active",
        postedDate: "Feb 10, 2026",
        stats: { total: 42, shortlisted: 8, rejected: 15, pending: 19 },
        skills: ["React", "Redux", "TypeScript", "Node.js", "AWS"],
        description: "We are looking for a Senior React Developer with 5+ years of experience..."
    };

    // fake candidates. scan results will replace this once wired
    const candidates = [
        { id: 1, rank: 1, name: "Liam Johnson", role: "Frontend Lead", score: 98, status: "Shortlisted", avatar: "LJ" },
        { id: 2, rank: 2, name: "Olivia Smith", role: "Senior Engineer", score: 94, status: "Shortlisted", avatar: "OS" },
        { id: 3, rank: 3, name: "Noah Williams", role: "React Developer", score: 89, status: "Review", avatar: "NW" },
        { id: 4, rank: 4, name: "Emma Jones", role: "Web Developer", score: 76, status: "Review", avatar: "EJ" },
        { id: 5, rank: 5, name: "James Brown", role: "Junior Dev", score: 42, status: "Rejected", avatar: "JB" },
    ];

    return (
        <div className="min-h-screen bg-[var(--body-bg)] p-8 font-sans text-[var(--text-primary)]">


            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[var(--card-border)] hover:shadow-sm"
                    >
                        <ArrowLeft className="text-[var(--text-secondary)]" size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{job.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]"></span>
                                <span className="text-sm font-semibold text-[var(--success)] uppercase tracking-wide">
                                    {job.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> Remote / Dhaka</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Posted 2 days ago</span>
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


                    <div className="bg-[var(--card-bg)] p-2 rounded-lg border border-[var(--card-border)] shadow-sm flex justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-[var(--text-secondary)]" size={18} />
                            <input type="text" placeholder="Search candidates..." className="w-full pl-10 pr-4 py-2 text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]" />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors">
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>


                    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-[var(--card-border)] text-xs uppercase text-[var(--text-secondary)] font-semibold tracking-wider">
                                    <th className="px-6 py-4 w-16">Rank</th>
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Match Score</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {candidates.map((c) => (
                                    <tr key={c.id} className="hover:bg-[var(--body-bg)] transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${c.rank === 1 ? 'bg-amber-100 text-amber-700' : c.rank === 2 ? 'bg-gray-100 text-gray-600' : 'text-gray-400'}`}>
                                                #{c.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                                                    {c.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[var(--text-primary)]">{c.name}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">{c.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${c.score > 90 ? 'bg-[var(--success)]' : c.score > 70 ? 'bg-blue-500' : 'bg-[var(--danger)]'}`}
                                                        style={{ width: `${c.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--text-secondary)]">{c.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${c.status === "Shortlisted" ? "bg-emerald-500" :
                                                    c.status === "Review" ? "bg-amber-500" :
                                                        "bg-red-500"
                                                    }`} />
                                                <span className={`text-sm font-medium ${c.status === "Shortlisted" ? "text-emerald-600" :
                                                    c.status === "Review" ? "text-amber-600" :
                                                        "text-red-600"
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                                    {job.skills.map(skill => (
                                        <span key={skill} className="px-2.5 py-1.5 bg-gray-50 text-[var(--text-secondary)] rounded-lg text-xs font-medium border border-[var(--card-border)]">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Experience Level</p>
                                <p className="font-semibold text-[var(--text-primary)]">Senior (5+ Years)</p>
                            </div>
                            <div className="pt-6 border-t border-[var(--card-border)]">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wide">Overall Stats</p>
                                <div className="flex justify-between items-center px-2">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{job.stats.total}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Total</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--success)]">{job.stats.shortlisted}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Passed</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-[var(--danger)]">{job.stats.rejected}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold mt-1">Failed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[var(--text-primary)]">Job Description</h3>
                            <button className="text-xs text-[var(--accent)] font-semibold hover:underline">View Full</button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-6">
                            {job.description}
                            <br /><br />
                            Key Responsibilities:
                            <br />• Architecting scalable frontend systems...
                            <br />• Mentoring junior developers...
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
