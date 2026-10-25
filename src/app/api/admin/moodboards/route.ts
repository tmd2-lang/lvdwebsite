import { NextResponse } from "next/server";
import { getAdminUser, canManageClientPortal } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { MoodboardConflict, publishMoodboard, moodboardRequest } from "@/lib/moodboard-data";
import { moodboardInput, MOODBOARD_UUID } from "@/lib/moodboard-view";
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Studio access required." }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.clientId !== "string" || !MOODBOARD_UUID.test(body.clientId)) throw new Error("Choose a client.");
    const client = await getClientById(body.clientId);
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
    if (body.action === "production") {
      if (typeof body.note !== "string" || body.note.length > 8000) throw new Error("Production notes must be under 8,000 characters.");
      await moodboardRequest("client_moodboard_production?on_conflict=client_id", { client_id: client.id, note: body.note.trim(), updated_by: user.email, updated_at: new Date().toISOString() }, "resolution=merge-duplicates");
    } else if (body.action === "publish") await publishMoodboard(client.id, moodboardInput(body), user.email);
    else throw new Error("Choose a moodboard action.");
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save moodboard." }, { status: error instanceof MoodboardConflict ? 409 : 400 }); }
}
