import { NextResponse } from "next/server";
import { normalizeCalendlyWebhook, verifyCalendlySignature } from "@/lib/calendly-webhook";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  const type = process.env.CALENDLY_DESIGN_CONSULTATION_EVENT_TYPE_URI;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !type || !url || !serviceKey) {
    const missing = [!key && "CALENDLY_WEBHOOK_SIGNING_KEY", !type && "CALENDLY_DESIGN_CONSULTATION_EVENT_TYPE_URI", !url && "NEXT_PUBLIC_SUPABASE_URL", !serviceKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean);
    console.error("Calendly configuration missing:", missing.join(", "));
    return NextResponse.json({ error: "Consultation sync is not configured." }, { status: 503 });
  }
  // Bound actual streamed bytes, not just the caller-supplied Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Missing body." }, { status: 400 });
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1048576) { await reader.cancel(); return NextResponse.json({ error: "Payload too large." }, { status: 413 }); }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!verifyCalendlySignature(raw, request.headers.get("Calendly-Webhook-Signature"), key)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  try {
    const appointment = await normalizeCalendlyWebhook(payload, type, process.env.CALENDLY_API_TOKEN);
    if (!appointment) return NextResponse.json({ ignored: true });
    const response = await fetch(`${url}/rest/v1/rpc/sync_calendly_appointment`, {
      method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(appointment), cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Appointment persistence failed");
    return NextResponse.json({ received: true });
  } catch {
    // No PII or raw webhook payload in server logs. A failed transaction is retryable.
    console.error("Calendly sync failed; delivery was not acknowledged.");
    return NextResponse.json({ error: "Could not sync consultation. Retry delivery." }, { status: 503 });
  }
}
