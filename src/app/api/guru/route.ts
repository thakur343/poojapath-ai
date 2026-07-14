import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key exists:", !!apiKey);
    console.log("API Key:", apiKey?.slice(0, 20));

    const body = await req.json();
    const userMessage = body.messages?.[0]?.content || "";
    const systemPrompt = body.system || "";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        }),
      }
    );

    console.log("Gemini status:", res.status);
    const data = await res.json();
    console.log("Gemini data:", JSON.stringify(data).slice(0, 500));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      content: [{ type: "text", text: text || "Kshama karein, response nahi mila." }]
    });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
