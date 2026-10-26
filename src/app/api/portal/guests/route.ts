import { NextResponse } from "next/server";
import { getPortalSession, canEditGuestList } from "@/lib/portal-auth";
import { getRecord, getRecordIds, getSettings } from "@/lib/guests-data";
import { mutateCoupleGuest, CoupleGuestConflict } from "@/lib/couple-guests-data";
import { cleanCoupleGuestPatch, projectCoupleGuestRecord, type CoupleGuestKind } from "@/lib/couple-guests-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Please sign in to your planning portal." }, { status: 401 });
  if (!canEditGuestList(session.relationship)) return NextResponse.json({ error: "Only the couple can edit this guest list." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action !== "save" && body.action !== "delete") throw new Error("Choose a guest-list action.");
    if (body.kind !== "guest" && body.kind !== "household") throw new Error("Tables and studio settings are managed by your planning team.");
    const kind = body.kind as CoupleGuestKind;
    const recordId = typeof body.id === "string" && body.id ? body.id : null;
    if (recordId && !UUID.test(recordId)) throw new Error("Choose a valid guest record.");
    if (body.action === "delete" && !recordId) throw new Error("Choose a guest to remove.");
    if (recordId) {
      const before = await getRecord(session.client.id, recordId);
      if (!before || before.kind !== kind) return NextResponse.json({ error: "That guest record was not found." }, { status: 404 });
      if (body.action === "delete" && !before.added_by_couple) {
        return NextResponse.json({ error: "Your planning team added this one, so only they can remove it. You can still edit the details, or ask them to take it off." }, { status: 403 });
      }
    }
    const expected = typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : null;
    if (recordId && (!expected || expected.length > 100 || !Number.isFinite(new Date(expected).getTime()))) throw new Error("Refresh the guest list before editing.");
    const [households, settings] = await Promise.all([getRecordIds(session.client.id, "household"), getSettings(session.client.id)]);
    const patch = body.action === "save" ? cleanCoupleGuestPatch(kind, body.data, households, settings.events) : {};
    const record = await mutateCoupleGuest({
      clientId: session.client.id, recordId, kind, action: body.action, patch, expected,
      by: session.user.email,
    });
    return NextResponse.json({ record: record ? projectCoupleGuestRecord(record) : null, ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update your guest list." }, { status: error instanceof CoupleGuestConflict ? 409 : 400 });
  }
}
