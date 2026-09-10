/** GA4-only commands. Never pass form data or Calendly payloads here. */
export const GA4_ID = "G-QS8T3YC21F";
const STORAGE_KEY = "lvd_marketing_attribution";
let attribution: Record<string, string> = {};
let configured = false;
let previousPage = "";

export function isPublicPage(path: string) {
  return !/^\/(admin|portal)(\/|$)/.test(path);
}

export function captureAttribution() {
  try {
    attribution = { ...JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"), ...attribution };
  } catch { /* Storage may be blocked; retain attribution in memory. */ }
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params) {
    if (key === "gclid" || /^utm_[a-z_]+$/.test(key)) attribution[key] = value;
  }
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution)); } catch {}
  return attribution;
}

function command(...args: unknown[]) {
  const target = window as Window & { dataLayer?: unknown[] };
  target.dataLayer ||= [];
  // Google expects an arguments object, including before gtag.js has loaded.
  // eslint-disable-next-line prefer-rest-params -- gtag queue requires IArguments.
  function enqueue() { target.dataLayer!.push(arguments); }
  Reflect.apply(enqueue, undefined, args);
}

function context() {
  captureAttribution();
  // Arbitrary query values, hashes, titles and referrer paths can contain PII.
  const page = new URL(window.location.pathname, window.location.origin);
  const clickId = attribution.gclid;
  if (clickId && /^[a-zA-Z0-9_-]{1,256}$/.test(clickId)) page.searchParams.set("gclid", clickId);
  const campaign: Record<string, string> = {};
  for (const key of ["source", "medium", "campaign", "term", "content", "id"]) {
    const value = attribution[`utm_${key}`];
    // Only campaign slugs are sent; raw attribution remains session-local.
    if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) {
      campaign[key === "campaign" ? "campaign_name" : `campaign_${key}`] = value;
    }
  }
  let referrer = previousPage;
  if (!referrer && document.referrer) {
    try { referrer = new URL(document.referrer).origin; } catch {}
  }
  return { page_location: page.href, page_title: window.location.pathname,
    page_referrer: referrer, ...campaign };
}

export function trackGA4(event: "page_view" | "generate_lead" | "book_appointment", form?: "welcome" | "inquire") {
  if (typeof window === "undefined" || !isPublicPage(window.location.pathname)) return;
  const parameters = context();
  if (!configured) {
    command("config", GA4_ID, { send_page_view: false, ...parameters });
    configured = true;
  }
  command("event", event, { send_to: GA4_ID, ...parameters, ...(form ? { form_id: form } : {}) });
  if (event === "page_view") previousPage = new URL(window.location.pathname, window.location.origin).href;
}
