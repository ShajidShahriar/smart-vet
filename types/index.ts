export interface Job {
    _id: string;
    title: string;
    department: string;
    description: string;
    status: "Active" | "Closed";
    skills: string[];
    createdAt?: string;
    candidates: number;
    shortlisted: number;
}

export interface Scan {
    _id: string;
    jobId: string;
    filename: string;
    fileUrl?: string;
    candidateName: string;
    score: number;
    status: "Pending" | "Accepted" | "Rejected" | "Pass" | "Fail";
    summary: string;
    breakdown?: {
        skillsMatch: { score: number; max: number; comment: string };
        experience: { score: number; max: number; comment: string };
        projectsLinks: { score: number; max: number; comment: string };
        security: { flagged: boolean; comment: string };
    };
    category: string;
    promptHash?: string;
    createdAt: string;
}
