import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import Scan from "@/lib/models/Scan";
import { analyzeResume } from "@/lib/gemini";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // handle form data for file upload
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    const jobTitle = formData.get("jobTitle") as string;

    if (!file || !text || !jobTitle) {
      return NextResponse.json(
        { error: "file, resume text and job title are all required" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // find the job so we can use its description in the prompt
    // ALSO ensure the job belongs to this user to prevent scanning against other people's jobs
    const job = await Job.findOne({ title: jobTitle, userId: session.user.id }).lean();
    if (!job) {
      return NextResponse.json({ error: "job not found or access denied" }, { status: 404 });
    }

    // retrieving configuration from headers (BYOK support)
    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    const strictness = parseInt(req.headers.get("x-gemini-strictness") || "50");

    const result = await analyzeResume(
      text,
      (job as Record<string, unknown>).description as string || "",
      jobTitle,
      strictness,
      apiKey
    );

    // persist the scan result
    const scan = await Scan.create({
      jobId: (job as Record<string, unknown>)._id,
      userId: session.user.id,
      filename: file.name, // save the actual filename
      fileUrl: blob.url, // save the blob url
      candidateName: result.candidateName,
      score: result.score,
      status: "Pending", // initial status is pending review
      summary: result.summary,
      category: jobTitle,
    });

    return NextResponse.json({
      success: true,
      scan: {
        _id: scan._id,
        filename: scan.filename,
        fileUrl: scan.fileUrl,
        candidateName: result.candidateName,
        score: result.score,
        status: scan.status,
        summary: result.summary,
        category: jobTitle,
      },
    });
  } catch (error) {
    console.error("POST /api/analyze failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "analysis failed" },
      { status: 500 }
    );
  }
}