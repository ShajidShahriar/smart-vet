import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import { auth } from "@/lib/auth";

// partial update, like toggling status or editing fields
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // ensure job belongs to user
        const job = await Job.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            body,
            { new: true, runValidators: true }
        ).lean();

        if (!job) {
            return NextResponse.json({ error: "job not found or access denied" }, { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error("PATCH /api/jobs/[id] failed:", error);
        return NextResponse.json({ error: "failed to update job" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        // ensure job belongs to user
        const job = await Job.findOneAndDelete({ _id: id, userId: session.user.id }).lean();

        if (!job) {
            return NextResponse.json({ error: "job not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/jobs/[id] failed:", error);
        return NextResponse.json({ error: "failed to delete job" }, { status: 500 });
    }
}
