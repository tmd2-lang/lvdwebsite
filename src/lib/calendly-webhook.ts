import { createHmac, createHash, timingSafeEqual } from "node:crypto";
export function verifyCalendlySignature(raw: string, header: string | null, key: string, now = Date.now()) {
  if (!header || !key) return false;
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamps = parts.filter(([name]) => name === "t");
  if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0][1] || "")) return false;
  const timestamp = timestamps[0][1];
  if (Math.abs(now / 1000 - Number(timestamp)) > 180) return false;
  const expected = createHmac("sha256", key).update(`${timestamp}.${raw}`).digest();
  return parts.some(([name, value]) => name === "v1" && /^[a-f0-9]{64}$/i.test(value || "") && timingSafeEqual(expected, Buffer.from(value, "hex")));
}
const EVENT_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/[a-zA-Z0-9-]+$/;
const INVITEE_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/[a-zA-Z0-9-]+\/invitees\/[a-zA-Z0-9-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Json = Record<string, unknown>;
function object(value: unknown): Json { return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {}; }
function date(value: unknown) { if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error("Invalid Calendly timestamp"); return new Date(value).toISOString(); }
export async function normalizeCalendlyWebhook(input: unknown, allowedType: string, token?: string) {
  const body = object(input);
  if (body.event !== "invitee.created" && body.event !== "invitee.canceled") return null;
  const payload = object(body.payload);
  if (typeof payload.uri !== "string" || !INVITEE_URI.test(payload.uri) || typeof payload.event !== "string" || !EVENT_URI.test(payload.event) || !payload.uri.startsWith(`${payload.event}/invitees/`)) throw new Error("Invalid Calendly resource");
  let event = object(payload.scheduled_event);
  if (!event.event_type || !event.start_time || !event.end_time) {
    if (!token) throw new Error("Calendly API token required for event details");
    const response = await fetch(payload.event, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000), cache: "no-store" });
    if (!response.ok) throw new Error("Calendly event lookup failed");
    event = object(object(await response.json()).resource);
  }
  if (event.uri !== payload.event) throw new Error("Calendly event resource mismatch");
  if (event.event_type !== allowedType) return null;
  if (typeof payload.email !== "string" || !payload.email.trim() || payload.email.length > 320) throw new Error("Invalid invitee email");
  const tracking = object(payload.tracking);
  const candidate = typeof tracking.utm_content === "string" ? tracking.utm_content.replace(/^lvd_lead_/, "") : "";
  return {
    p_delivery_key: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    p_raw: input,
    p_invitee_uri: payload.uri,
    p_event_uri: payload.event,
    p_event_type_uri: event.event_type,
    p_lead_id: typeof tracking.utm_content === "string" && tracking.utm_content.startsWith("lvd_lead_") && UUID.test(candidate) ? candidate : null,
    p_email: payload.email.trim().toLowerCase(),
    p_starts_at: date(event.start_time), p_ends_at: date(event.end_time),
    p_occurred_at: date(body.created_at),
    p_status: body.event === "invitee.canceled" ? "canceled" : "scheduled",
    p_rescheduled: payload.rescheduled === true,
    p_old_invitee_uri: typeof payload.old_invitee === "string" && INVITEE_URI.test(payload.old_invitee) ? payload.old_invitee : null,
    p_new_invitee_uri: typeof payload.new_invitee === "string" && INVITEE_URI.test(payload.new_invitee) ? payload.new_invitee : null,
  };
}
