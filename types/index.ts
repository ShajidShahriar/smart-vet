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
    candidateName: string;
    score: number;
    status: "Pending" | "Accepted" | "Rejected" | "Pass" | "Fail";
    summary: string;
    category: string;
    createdAt: string;
}
