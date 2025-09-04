import { db } from "@/config/db";
import { SessionMessagesTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

// POST - Save a new message
export async function POST(req: NextRequest) {
  try {
    const { sessionId, role, content } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: "sessionId, role, and content are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(SessionMessagesTable)
      .values({
        sessionId,
        role,
        content,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Error saving message:", e);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

// GET - Fetch messages for a session
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    const messages = await db
      .select()
      .from(SessionMessagesTable)
      .where(eq(SessionMessagesTable.sessionId, sessionId))
      .orderBy(desc(SessionMessagesTable.id));

    return NextResponse.json(messages);
  } catch (e) {
    console.error("Error fetching messages:", e);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
