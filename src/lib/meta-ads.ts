/**
 * Step 7: talking to Meta.
 * 7a: pull spend per ad from the Marketing API (Insights).
 * 7b: send sales outcomes to the Conversions API, so Meta learns who books.
 * Server only. Every token comes from environment variables.
 */
import { createHash } from "node:crypto";
import type { Attribution } from "./attribution";

export const TRACKING_STARTED = "2026-08-13";
const DEFAULT_VERSION = "v26.0";
const DEFAULT_PIXEL = "1263840655319183";
const DEFAULT_AD_ACCOUNT = "55657071";

export function metaConfig() {
  const version = process.env.META_GRAPH_VERSION || DEFAULT_VERSION;
  return {
    version,
    graph: `https://graph.facebook.com/${version}`,
    adAccount: (process.env.META_AD_ACCOUNT_ID || DEFAULT_AD_ACCOUNT).replace(/^act_/, ""),
    adsToken: process.env.META_ADS_READ_TOKEN || "",
    pixel: process.env.META_PIXEL_ID || DEFAULT_PIXEL,
    capiToken: process.env.META_CAPI_TOKEN || "",
    testCode: process.env.META_CAPI_TEST_CODE || "",
  };
}

// ---------- 7a: spend ----------

export type MetaAdSpend = { ad_id: string; ad_name: string | null; spend: number };

export function easternToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function insightsUrl(graph: string, adAccount: string, until: string) {
  const params = new URLSearchParams({
    level: "ad",
    fields: "ad_id,ad_name,spend",
    time_range: JSON.stringify({ since: TRACKING_STARTED, until }),
    limit: "500",
  });
  return `${graph}/act_${adAccount}/insights?${params}`;
}

export function parseInsights(rows: unknown): MetaAdSpend[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const item = row && typeof row === "object" ? row as Record<string, unknown> : {};
    const adId = typeof item.ad_id === "string" && /^\d{5,30}$/.test(item.ad_id) ? item.ad_id : "";
    const spend = Number(item.spend);
    if (!adId || !Number.isFinite(spend) || spend < 0) return [];
    return [{ ad_id: adId, ad_name: typeof item.ad_name === "string" ? item.ad_name.slice(0, 300) : null, spend: Math.round(spend * 100) / 100 }];
  });
}

/** Spend per ad from Aug 13 to today. Follows Meta's paging; throws on any API error. */
export async function fetchMetaSpend(now = new Date()): Promise<MetaAdSpend[]> {
  const config = metaConfig();
  if (!config.adsToken) throw new Error("META_ADS_READ_TOKEN is not set.");
  const results: MetaAdSpend[] = [];
  let url: string | null = insightsUrl(config.graph, config.adAccount, easternToday(now));
  for (let page = 0; url && page < 20; page++) {
    const response: Response = await fetch(url, { headers: { Authorization: `Bearer ${config.adsToken}` }, cache: "no-store", signal: AbortSignal.timeout(20000) });
    const body = await response.json().catch(() => null) as { data?: unknown; paging?: { next?: string }; error?: { message?: string } } | null;
    if (!response.ok || !body) throw new Error(`Meta spend request failed: ${body?.error?.message || response.status}`);
    results.push(...parseInsights(body.data));
    url = body.paging?.next && body.paging.next.startsWith("https://graph.facebook.com/") ? body.paging.next : null;
  }
  return results;
}

// ---------- 7b: Conversions API ----------

export const CAPI_EVENTS = {
  consult_completed: "ConsultCompleted",
  fit_good: "QualifiedLead",
  booked: "Purchase",
} as const;
export type CapiTrigger = keyof typeof CAPI_EVENTS;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Meta's normalization: lowercase trimmed email; phone as digits with country code (US default). */
export function normalizeEmail(email: string | null | undefined) {
  const clean = (email || "").trim().toLowerCase();
  return clean.includes("@") ? clean : "";
}
export function normalizePhone(phone: string | null | undefined) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : "";
}

export type CapiLead = {
  id: string;
  email: string | null;
  phone: string | null;
  attribution?: Attribution | null;
};

export function capiEvent(trigger: CapiTrigger, lead: CapiLead, value: number | null, now = new Date()) {
  const email = normalizeEmail(lead.email);
  const phone = normalizePhone(lead.phone);
  const userData: Record<string, unknown> = { external_id: [sha256(lead.id)] };
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (lead.attribution?.fbc) userData.fbc = lead.attribution.fbc;
  if (lead.attribution?.fbp) userData.fbp = lead.attribution.fbp;
  const eventName = CAPI_EVENTS[trigger];
  return {
    event_name: eventName,
    event_time: Math.floor(now.getTime() / 1000),
    // One event per lead and step: Meta drops repeats with the same ID.
    event_id: `lvd_${lead.id}_${trigger}`,
    action_source: "system_generated",
    user_data: userData,
    ...(trigger === "booked" && value ? { custom_data: { value, currency: "USD" } } : {}),
  };
}

export async function sendCapiEvent(event: ReturnType<typeof capiEvent>) {
  const config = metaConfig();
  if (!config.capiToken) return { skipped: true as const };
  const response = await fetch(`${config.graph}/${config.pixel}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.capiToken}` },
    body: JSON.stringify({ data: [event], ...(config.testCode ? { test_event_code: config.testCode } : {}) }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => null);
  return { skipped: false as const, ok: response.ok, body };
}
