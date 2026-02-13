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

        // count scans per job so the cards show real numbers
        const jobsWithCounts = await Promise.all(
            jobs.map(async (job) => {
                const candidates = await Scan.countDocuments({ jobId: job._id });
                const shortlisted = await Scan.countDocuments({ jobId: job._id, status: { $in: ["Pass", "Accepted"] } });
                return {
                    _id: job._id,
                    title: job.title,
                    department: job.department,
                    description: job.description,
                    status: job.status,
                    skills: job.skills,
                    candidates,
                    shortlisted,
                    createdAt: job.createdAt,
                };
            })
        );

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
