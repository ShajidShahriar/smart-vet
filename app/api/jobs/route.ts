import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import Scan from "@/lib/models/Scan";
import { auth } from "@/lib/auth";

// returns all jobs for the authenticated user, newest first
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const userId = session.user.id;
        const jobs = await Job.find({ userId }).sort({ createdAt: -1 }).lean();

        // batch-count all scan stats in a single aggregation instead of N+1 queries
        const jobIds = jobs.map(j => j._id);
        const scanStats = await Scan.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            {
                $group: {
                    _id: "$jobId",
                    candidates: { $sum: 1 },
                    shortlisted: {
                        $sum: { $cond: [{ $in: ["$status", ["Pass", "Accepted"]] }, 1, 0] },
                    },
                },
            },
        ]);

        // build a lookup map for O(1) access
        const statsMap = new Map(
            scanStats.map((s: { _id: string; candidates: number; shortlisted: number }) => [
                s._id.toString(),
                { candidates: s.candidates, shortlisted: s.shortlisted },
            ])
        );

        const jobsWithCounts = jobs.map(job => {
            const counts = statsMap.get(job._id.toString()) || { candidates: 0, shortlisted: 0 };
            return {
                _id: job._id,
                title: job.title,
                department: job.department,
                description: job.description,
                status: job.status,
                skills: job.skills,
                candidates: counts.candidates,
                shortlisted: counts.shortlisted,
                createdAt: job.createdAt,
            };
        });

        return NextResponse.json(jobsWithCounts);
    } catch (error) {
        console.error("GET /api/jobs failed:", error);
        return NextResponse.json({ error: "failed to fetch jobs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        const job = await Job.create({
            ...body,
            userId: session.user.id
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("POST /api/jobs failed:", error);
        return NextResponse.json({ error: "failed to create job" }, { status: 500 });
    }
}
