import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/lib/models/Job";
import Scan from "@/lib/models/Scan";
import { analyzeResume } from "@/lib/gemini";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import crypto from "crypto";

// shape returned by Job.findOne().lean() — plain object, no Mongoose wrappers
interface LeanJob {
  _id: string;
  title: string;
  department: string;
  description: string;
  status: string;
  skills: string[];
  userId: string;
}

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

    // server-side limits (defense in depth — client also validates)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_TEXT_LENGTH = 50_000; // ~20 pages

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 413 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Resume text too long. Max ~20 pages supported." },
        { status: 413 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // find the job so we can use its description in the prompt
    // ALSO ensure the job belongs to this user to prevent scanning against other people's jobs
    const job = await Job.findOne({ title: jobTitle, userId: session.user.id }).lean<LeanJob>();
    if (!job) {
      return NextResponse.json({ error: "job not found or access denied" }, { status: 404 });
    }

    // retrieving configuration from headers (BYOK support)
    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    const strictness = parseInt(req.headers.get("x-gemini-strictness") || "50");

    // Generate a deterministic hash of all inputs that affect the AI output
    const promptHash = crypto
      .createHash("sha256")
      .update(text + (job.description || "") + strictness)
      .digest("hex");

    // Check if we already analyzed this exact resume for this exact job config
    const cachedScan = await Scan.findOne({ promptHash, userId: session.user.id }).lean();

    let result;
    if (cachedScan) {
      console.log(`[Cache Hit] Skipping Gemini API for hash: ${promptHash}`);
      // Re-use the AI results from the cached scan
      result = {
        candidateName: cachedScan.candidateName,
        score: cachedScan.score,
        summary: cachedScan.summary,
        breakdown: cachedScan.breakdown,
      };
    } else {
      console.log(`[Cache Miss] Calling Gemini API for hash: ${promptHash}`);
      result = await analyzeResume(
        text,
        job.description || "",
        jobTitle,
        strictness,
        apiKey
      );
    }

    // persist the scan result (creates a NEW record so user sees it, but may use cached AI data)
    const scan = await Scan.create({
      jobId: job._id,
      userId: session.user.id,
      filename: file.name,
      fileUrl: blob.url,
      candidateName: result.candidateName,
      score: result.score,
      status: "Pending",
      summary: result.summary,
      breakdown: result.breakdown,
      category: jobTitle,
      promptHash, // Save the hash so future uploads hit the cache
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
        breakdown: result.breakdown,
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