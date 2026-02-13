import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Scan from "@/lib/models/Scan";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        if (!["Pass", "Fail", "Pending", "Accepted", "Rejected"].includes(status)) {
            return NextResponse.json({ error: "invalid status" }, { status: 400 });
        }

        const scan = await Scan.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).lean();

        if (!scan) {
            return NextResponse.json({ error: "scan not found" }, { status: 404 });
        }

        return NextResponse.json(scan);
    } catch (error) {
        console.error("PATCH /api/scans/[id] failed:", error);
        return NextResponse.json({ error: "failed to update scan" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const scan = await Scan.findByIdAndDelete(id).lean();

        if (!scan) {
            return NextResponse.json({ error: "scan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/scans/[id] failed:", error);
        return NextResponse.json({ error: "failed to delete scan" }, { status: 500 });
    }
}
