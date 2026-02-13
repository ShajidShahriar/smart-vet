import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import Scan from "@/lib/models/Scan";
import { analyzeResume } from "@/lib/gemini";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
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

    // save file to public/uploads
    // unique filename to prevent collisions? for now exact name is fine for demo
    // but lets prepend timestamp to be safe
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await writeFile(path.join(uploadDir, uniqueFilename), buffer);

    // find the job so we can use its description in the prompt
    const job = await Job.findOne({ title: jobTitle }).lean();
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }

    // retrieving configuration from headers (BYOK support)
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
      filename: uniqueFilename, // save the actual disk filename
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