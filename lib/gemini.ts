import { GoogleGenerativeAI } from "@google/generative-ai";

// reads api key from env or user input
const getApiKey = (userKey?: string) => {
    // prefer user key if provided, otherwise fallback to env
    const key = userKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY missing");
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
    strictness: number = 50,
    apiKey?: string
): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(getApiKey(apiKey));

    // map strictness (0-100) to temperature (0.5-0.0)
    // strict = low temp (deterministic), lenient = higher temp (creative)
    const temperature = Math.max(0, 0.5 - (strictness / 200));

    const genModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature,
        }
    });

    // map 0-100 slider to labels
    const strictnessLabel = strictness <= 25 ? "lenient" : strictness <= 50 ? "balanced" : strictness <= 75 ? "strict" : "ruthless";

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
