import { GoogleGenerativeAI } from "@google/generative-ai";

// reads api key from env for now. phase 5 will pull from user settings in db
const getApiKey = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY missing from .env.local");
    return key;
};

interface AnalysisResult {
    score: number;
    status: "Pass" | "Fail";
    candidateName: string;
    summary: string;
}

export async function analyzeResume(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    model: string = "gemini-2.0-flash",
    strictness: number = 2,
): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(getApiKey());
    const genModel = genAI.getGenerativeModel({ model });

    const strictnessLabel = ["lenient", "balanced", "strict", "ruthless"][strictness - 1] || "balanced";

    const prompt = `You are an expert hiring manager AI. Analyze this resume against the job posting below.

## Job Title
${jobTitle}

## Job Description
${jobDescription}

## Resume Text
${resumeText}

## Your Task
Score this candidate from 0-100 based on how well their resume matches the job requirements.

Scoring mode: ${strictnessLabel}
- lenient: give benefit of the doubt for transferable skills
- balanced: standard matching
- strict: exact skill matches required, penalize gaps
- ruthless: only top-tier candidates pass, nitpick everything

## Response Format
Respond ONLY with valid JSON, no markdown fencing:
{
  "score": <number 0-100>,
  "status": "<Pass or Fail>",
  "candidateName": "<extracted from resume or Unknown>",
  "summary": "<2-3 sentence explanation of the score>"
}

Pass threshold: score >= 60
If score < 60, status must be "Fail".`;

    const result = await genModel.generateContent(prompt);
    const text = result.response.text().trim();

    // strip markdown code fences if gemini wraps the json anyway
    const cleaned = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

    try {
        return JSON.parse(cleaned) as AnalysisResult;
    } catch {
        console.error("gemini returned unparseable json:", text);
        return {
            score: 0,
            status: "Fail",
            candidateName: "Unknown",
            summary: "failed to parse ai response",
        };
    }
}
