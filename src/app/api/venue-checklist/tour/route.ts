import { NextResponse } from "next/server";
import { validTourToken } from "@/lib/checklist-emails";
import { cleanTour } from "@/lib/venue-checklist-tour";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Lead storage is not configured.");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

/**
 * Saves the phone checklist (/venue-checklist/tour) on the couple's lead, in payload.tour.
 * The private link's token is the only key, the same as the feedback and unsubscribe links.
 */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({})) as { id?: unknown; t?: unknown; tour?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const token = typeof body.t === "string" ? body.t : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !validTourToken(id, token)) {
    return NextResponse.json({ error: "Link not recognized." }, { status: 400 });
  }
  const tour = { ...cleanTour(body.tour), updatedAt: new Date().toISOString() };

  // Read the lead fresh so fields saved elsewhere (emails sent, feedback) are kept.
  const db = supabase();
  const response = await fetch(`${db.url}/rest/v1/leads?id=eq.${id}&source=eq.venue_checklist&select=payload`, { headers: db.headers, cache: "no-store" });
  const [row] = response.ok ? await response.json() as { payload: Record<string, unknown> | null }[] : [];
  if (!row) return NextResponse.json({ error: "Link not recognized." }, { status: 404 });
  const saved = await fetch(`${db.url}/rest/v1/leads?id=eq.${id}`, {
    method: "PATCH", headers: db.headers, cache: "no-store",
    body: JSON.stringify({ payload: { ...(row.payload || {}), tour } }),
  });
  if (!saved.ok) return NextResponse.json({ error: "Could not save." }, { status: 502 });
  return NextResponse.json({ updatedAt: tour.updatedAt });
}
