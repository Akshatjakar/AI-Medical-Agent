import { AIDoctorAgents } from "@/public/agent/list";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",   // ✅ required for OpenRouter
  apiKey: process.env.OPENROUTER_API_KEY,    // ✅ must exist in .env.local
});

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // ✅ vendor prefix required
      messages: [
        { role: "system", content: JSON.stringify(AIDoctorAgents) },
        {
          role: "user",
          content:
            "User Notes/Symptoms: " +
            notes +
            ". Based on the user notes and symptoms, suggest a list of doctors. Return an object in JSON only.",
        },
      ],
    });

    // ✅ Get message content (string)
    const content = completion.choices[0].message?.content ?? "{}";

    // ✅ Parse string into real JSON object
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // fallback: if model adds extra text, wrap safely
      parsed = { raw: content };
    }

    return NextResponse.json(parsed);

  } catch (e: any) {
    console.error("OpenRouter API error:", e);
    return NextResponse.json(
      { error: e.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
 