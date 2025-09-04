import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

// ------------------- POST -------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { notes = "", selectedDoctor = {} } = body;
    const user = await currentUser();

    const sessionId = uuidv4();

    const safeDoctor = {
      ...selectedDoctor,
      image:
        selectedDoctor?.image && selectedDoctor.image.trim() !== ""
          ? selectedDoctor.image
          : "/default-doctor.png",
    };

    const [result] = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? "guest",
        notes,
        conversation: [], // ✅ store JSON array
        report: {},       // ✅ store JSON object
        selectedDoctor: safeDoctor, // ✅ store JSON object
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      ...result,
      sessionId,
    });
  } catch (e: any) {
    console.error("Error creating session:", e?.message || e);
    return NextResponse.json(
      { error: "Failed to create session", details: e?.message },
      { status: 500 }
    );
  }
}

// ------------------- GET -------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser();

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    if (sessionId === "all") {
      const sessions = await db
        .select()
        .from(SessionChatTable)
        .where(
          eq(
            SessionChatTable.createdBy,
            user?.primaryEmailAddress?.emailAddress ?? "guest"
          )
        )
        .orderBy(desc(SessionChatTable.id));

      // Parse doctor JSON if stored as string
      const safeSessions = sessions.map((s) => ({
        ...s,
        selectedDoctor:
          typeof s.selectedDoctor === "string"
            ? JSON.parse(s.selectedDoctor)
            : s.selectedDoctor,
      }));

      return NextResponse.json(safeSessions);
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (!result[0]) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    let doctor = result[0].selectedDoctor;
    if (typeof doctor === "string") {
      try {
        doctor = JSON.parse(doctor);
      } catch (e) {
        console.error("Invalid doctor JSON in DB:", e);
      }
    }

    return NextResponse.json({
      ...result[0],
      selectedDoctor: doctor,
    });
  } catch (e: any) {
    console.error("Error fetching session:", e?.message || e);
    return NextResponse.json(
      { error: "Failed to fetch session", details: e?.message },
      { status: 500 }
    );
  }
}
