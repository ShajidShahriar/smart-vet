import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import Scan from "@/lib/models/Scan";
import { analyzeResume } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { text, filename, jobTitle } = await req.json();

    if (!text || !jobTitle) {
      return NextResponse.json(
        { error: "resume text and job title are both required" },
        { status: 400 }
      );
    }

    // find the job so we can use its description in the prompt
    const job = await Job.findOne({ title: jobTitle }).lean();
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }

    const result = await analyzeResume(
      text,
      (job as Record<string, unknown>).description as string || "",
      jobTitle,
    );

    // persist the scan result
    const scan = await Scan.create({
      jobId: (job as Record<string, unknown>)._id,
      filename,
      candidateName: result.candidateName,
      score: result.score,
      status: result.status,
      category: jobTitle,
    });

    return NextResponse.json({
      success: true,
      scan: {
        _id: scan._id,
        filename: scan.filename,
        candidateName: result.candidateName,
        score: result.score,
        status: result.status,
        summary: result.summary,
        category: jobTitle,
      },
    });
  } catch (error) {
    console.error("POST /api/analyze failed:", error);
    return NextResponse.json(
      { error: "analysis failed" },
      { status: 500 }
    );
  }
}