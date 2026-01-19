import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Receive JSON (Not FormData anymore!)
    const body = await req.json();
    const { text, filename } = body;

    console.log(` SERVER: Received text for ${filename}`);
    console.log("CONTENT PREVIEW:", text.substring(0, 100));

    // Right now, we just echo it back. 
    // NEXT STEP: We will send this 'text' to ChatGPT here.
    
    return NextResponse.json({ 
        success: true, 
        message: "Text received successfully" 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 });
  }
}