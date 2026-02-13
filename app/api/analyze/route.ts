import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const { text, filename } = body;

    console.log(` SERVER: Received text for ${filename}`);
    console.log("CONTENT PREVIEW:", text.substring(0, 100));

    // just echoing back for now. gemini integration goes here once settings are wired

    return NextResponse.json({
      success: true,
      message: "Text received successfully"
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 });
  }
}