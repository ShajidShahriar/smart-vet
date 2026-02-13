import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Scan from "@/lib/models/Scan";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// returns scans for the authenticated user only
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        // limit to 50 most recent scans for this user
        const scans = await Scan.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json(scans);
    } catch (error) {
        console.error("GET /api/scans failed:", error);
        return NextResponse.json({ error: "failed to fetch scans" }, { status: 500 });
    }
}
