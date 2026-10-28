import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { approveMoodboard, MoodboardConflict } from "@/lib/moodboard-data";
import { isMoodboardApprover, MOODBOARD_UUID } from "@/lib/moodboard-view";
export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!isMoodboardApprover(session.relationship)) return NextResponse.json({ error: "Only either partner may approve the design." }, { status: 403 });
  try {
    const body = await request.json();
    if (body.approved !== true || typeof body.revision !== "string" || !MOODBOARD_UUID.test(body.revision)) throw new Error("Explicitly approve the version you reviewed.");
    // The stamp carries the name the person typed, never the account handle.
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 120) : "";
    if (name.length < 2) throw new Error("Type your full name to approve.");
    await approveMoodboard(session.client.id, body.revision, session.user.id, name);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not approve moodboard." }, { status: error instanceof MoodboardConflict ? 409 : 400 }); }
}
