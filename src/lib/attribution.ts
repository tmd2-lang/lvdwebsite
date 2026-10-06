/**
 * Ad attribution: remembers which ad (or other tagged link) a visitor arrived
 * from, so it can be saved with their inquiry even if they browse first.
 *
 * Kept in localStorage on this browser only. A click on a phone followed by a
 * submission on a laptop cannot be connected, and that is accepted.
 */
const STORAGE_KEY = "lvd_ad_attribution";
const FIRST_TOUCH_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const TRACKED_PARAM = /^(utm_[a-z_]+|fbclid|gclid|epik)$/;
const META_SOURCES = new Set(["fb", "ig", "facebook", "instagram", "meta", "an", "msg", "threads"]);

export type Touch = {
  at: string;
  landing_page: string;
  referrer: string | null;
  params: Record<string, string>;
};

export type Attribution = {
  first?: Touch;
  last?: Touch;
  fbc?: string;
  fbp?: string;
  ga_client_id?: string;
};

export type AttributionColumns = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  landing_page: string | null;
  first_touch_at: string | null;
  attribution: Attribution;
};

function cleanValue(key: string, value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 256);
  // Skip placeholders such as "?fbclid=fbclid" and unfilled "{{ad.id}}" macros.
  if (!trimmed || trimmed === key || trimmed.includes("{{")) return "";
  return trimmed;
}

/** Builds a touch from a landing URL, or null when the URL carries no tracking tags. */
export function touchFromUrl(href: string, referrer: string | null, now: Date): Touch | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    const clean = TRACKED_PARAM.test(key) ? cleanValue(key, value) : "";
    if (clean && Object.keys(params).length < 20) params[key] = clean;
  }
  if (!Object.keys(params).length) return null;
  let referrerOrigin: string | null = null;
  // Only the origin: referrer paths and queries can contain personal details.
  try { referrerOrigin = referrer ? new URL(referrer).origin : null; } catch {}
  return { at: now.toISOString(), landing_page: url.pathname.slice(0, 256), referrer: referrerOrigin, params };
}

/** First touch is kept for 90 days; last touch is always the newest tagged visit. */
export function mergeTouch(stored: Attribution, touch: Touch | null, now: Date): Attribution {
  if (!touch) return stored;
  const firstAge = stored.first ? now.getTime() - Date.parse(stored.first.at) : Infinity;
  const first = stored.first && firstAge < FIRST_TOUCH_MAX_AGE_MS ? stored.first : touch;
  return { ...stored, first, last: touch };
}

function readStored(): Attribution {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}

/** Call on every public page view. */
export function captureAdAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const now = new Date();
  const merged = mergeTouch(readStored(), touchFromUrl(window.location.href, document.referrer || null, now), now);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch { /* Storage may be blocked. */ }
  return merged;
}

function cookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Everything sent alongside an inquiry; the visitor never sees these values. */
export function attributionForSubmit(): Attribution {
  if (typeof window === "undefined") return {};
  const attribution = captureAdAttribution();
  const fbp = cookie("_fbp");
  let fbc = cookie("_fbc");
  const fbclid = attribution.last?.params.fbclid;
  // Meta's documented fallback when the pixel has not yet written _fbc.
  if (!fbc && fbclid && attribution.last) fbc = `fb.1.${Date.parse(attribution.last.at)}.${fbclid}`;
  const ga = cookie("_ga").match(/^GA\d\.\d\.(\d+\.\d+)$/)?.[1];
  return { ...attribution, ...(fbc ? { fbc } : {}), ...(fbp ? { fbp } : {}), ...(ga ? { ga_client_id: ga } : {}) };
}

function sanitizeTouch(value: unknown): Touch | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const at = typeof raw.at === "string" && !Number.isNaN(Date.parse(raw.at)) ? new Date(raw.at).toISOString() : null;
  const page = typeof raw.landing_page === "string" && raw.landing_page.startsWith("/") ? raw.landing_page.slice(0, 256) : null;
  if (!at || !page) return undefined;
  const params: Record<string, string> = {};
  const rawParams = raw.params && typeof raw.params === "object" ? raw.params as Record<string, unknown> : {};
  for (const [key, paramValue] of Object.entries(rawParams)) {
    const clean = TRACKED_PARAM.test(key) ? cleanValue(key, paramValue) : "";
    if (clean && Object.keys(params).length < 20) params[key] = clean;
  }
  if (!Object.keys(params).length) return undefined;
  const referrer = typeof raw.referrer === "string" && /^https?:\/\/[^/]+$/.test(raw.referrer) ? raw.referrer.slice(0, 256) : null;
  return { at, landing_page: page, referrer, params };
}

function idValue(value: string | undefined) {
  return value && /^\d{5,30}$/.test(value) ? value : null;
}

/**
 * Server side: turns the browser's attribution (untrusted input) into lead
 * columns. Falls back to the submitting page's URL for browsers running an
 * older copy of the site that does not send attribution yet.
 */
export function attributionColumns(body: unknown, refererHeader: string | null, now: Date): AttributionColumns {
  const raw = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const attribution: Attribution = {};
  const first = sanitizeTouch(raw.first);
  const last = sanitizeTouch(raw.last);
  if (first) attribution.first = first;
  if (last) attribution.last = last;
  if (!first && refererHeader) {
    const fallback = touchFromUrl(refererHeader, null, now);
    if (fallback) { attribution.first = fallback; attribution.last = fallback; }
  }
  for (const key of ["fbc", "fbp", "ga_client_id"] as const) {
    const value = raw[key];
    if (typeof value === "string" && /^[A-Za-z0-9._-]{1,512}$/.test(value)) attribution[key] = value;
  }
  const touch = attribution.first;
  const params = touch?.params || {};
  const isMeta = META_SOURCES.has((params.utm_source || "").toLowerCase());
  return {
    utm_source: params.utm_source || null,
    utm_medium: params.utm_medium || null,
    utm_campaign: params.utm_campaign || null,
    // Meta's URL template: utm_campaign/utm_id = campaign, utm_term = ad set, utm_content = ad.
    meta_campaign_id: isMeta ? idValue(params.utm_id) || idValue(params.utm_campaign) : null,
    meta_adset_id: isMeta ? idValue(params.utm_term) : null,
    meta_ad_id: isMeta ? idValue(params.utm_content) : null,
    landing_page: touch?.landing_page || null,
    first_touch_at: touch?.at || null,
    attribution,
  };
}
