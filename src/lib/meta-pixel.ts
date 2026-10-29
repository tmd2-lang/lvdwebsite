export const META_PIXEL_ID = "1263840655319183";
type MetaPixel = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: MetaPixel;
  }
}

export type MetaLeadSource = "inquire" | "consultation" | "reserve" | "style_quiz" | "venue_checklist";
const sentEvents = new Set<string>();

function publicProductionPage() {
  if (typeof window === "undefined") return false;
  return ["ladyvictoriadesigns.com", "www.ladyvictoriadesigns.com"].includes(window.location.hostname)
    && !/^\/(admin|portal)(\/|$)/.test(window.location.pathname);
}

export function trackMetaPageView() {
  if (!publicProductionPage() || typeof window.fbq !== "function") return false;

  window.fbq("trackSingle", META_PIXEL_ID, "PageView");
  return true;
}

/** Only call with an ID returned after a successful database save. */
export function trackMetaLead(source: MetaLeadSource, leadId: string) {
  if (!publicProductionPage() || typeof window.fbq !== "function" || !leadId) return false;
  const eventName = source === "style_quiz" ? "StyleQuizCompleted" : "Lead";
  const kind = eventName === "Lead" ? (source === "venue_checklist" ? "checklist" : "inquiry") : "quiz";
  const eventId = `lvd_${leadId}_${kind}`;
  if (sentEvents.has(eventId)) return false;
  try {
    if (window.sessionStorage.getItem(eventId)) return false;
  } catch { /* Tracking also works when browser storage is unavailable. */ }
  window.fbq(source === "style_quiz" ? "trackSingleCustom" : "trackSingle",
    META_PIXEL_ID, eventName, { content_name: source }, { eventID: eventId });
  sentEvents.add(eventId);
  try { window.sessionStorage.setItem(eventId, "1"); } catch { /* Memory guard remains. */ }
  return true;
}
