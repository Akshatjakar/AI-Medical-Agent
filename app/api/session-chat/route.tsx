// app/api/session-chat/route.ts
//hello
import { db } from "@/config/db";
import { SessionChatTable, UsersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { notes = "", selectedDoctor = {} } = body;

    // Get the logged-in user
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Ensure user exists in the UsersTable
    const [existingUser] = await db.select().from(UsersTable).where(eq(UsersTable.email, userEmail));
    if (!existingUser) {
      await db.insert(UsersTable).values({
        name: user?.firstName ?? "Unknown",
        email: userEmail,
        credits: 0,
      });
    }

    // Generate a session ID
    const sessionId = uuidv4();

    // Ensure selectedDoctor has an image
    const safeDoctor = {
      ...selectedDoctor,
      image: selectedDoctor?.image?.trim() || "/default-doctor.png",
    };

    // Insert session
    const [result] = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        notes,
        selectedDoctor: safeDoctor, // stored as JSON
        conversation: [],           // JSON array
        report: {},                 // JSON object
        createdBy: userEmail,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      ...result,
      sessionId,
    });
  } catch (e: any) {
    console.error("Error creating session:", e);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (sessionId === "all") {
      // Get all sessions for the current user
      const sessions = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, userEmail))
        .orderBy(desc(SessionChatTable.id));

      const safeSessions = sessions.map((s) => ({
        ...s,
        selectedDoctor: typeof s.selectedDoctor === "string" ? JSON.parse(s.selectedDoctor) : s.selectedDoctor,
      }));

      return NextResponse.json(safeSessions);
    }

    // Get specific session
    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (!result[0]) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = result[0];
    let doctor = session.selectedDoctor;
    if (typeof doctor === "string") {
      try {
        doctor = JSON.parse(doctor);
      } catch (err) {
        console.error("Failed to parse doctor JSON:", err);
      }
    }

    return NextResponse.json({
      ...session,
      selectedDoctor: doctor,
    });
  } catch (e: any) {
    console.error("Error fetching session:", e);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
