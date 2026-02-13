import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";

// partial update, like toggling status or editing fields
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const job = await Job.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

        if (!job) {
            return NextResponse.json({ error: "job not found" }, { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error("PATCH /api/jobs/[id] failed:", error);
        return NextResponse.json({ error: "failed to update job" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const job = await Job.findByIdAndDelete(id).lean();

        if (!job) {
            return NextResponse.json({ error: "job not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/jobs/[id] failed:", error);
        return NextResponse.json({ error: "failed to delete job" }, { status: 500 });
    }
}
