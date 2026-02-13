import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Scan from "@/lib/models/Scan";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        // limit to 50 most recent scans
        const scans = await Scan.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json(scans);
    } catch (error) {
        console.error("GET /api/scans failed:", error);
        return NextResponse.json({ error: "failed to fetch scans" }, { status: 500 });
    }
}
