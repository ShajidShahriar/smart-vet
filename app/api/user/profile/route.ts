import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function PUT(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, jobTitle, avatarUrl, image } = body;

        // Connect to DB
        await dbConnect();

        // The user should already exist because they are logged in via NextAuth
        // We search by email because session.user.id might be string vs ObjectId
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    name,
                    jobTitle,
                    // allow updating either avatarUrl (custom) or image (next-auth standard)
                    ...(image && { image }),
                    ...(avatarUrl && { avatarUrl })
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Profile update failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
