type MetaPixel = (
  command: "track" | "trackCustom",
  eventName: string,
  parameters?: Record<string, string | number | boolean>,
) => void;

declare global {
  interface Window {
    fbq?: MetaPixel;
  }
}

export type MetaLeadSource = "inquire" | "consultation" | "reserve" | "style_quiz";

export function trackMetaPageView() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  window.fbq("track", "PageView");
  return true;
}

export function trackMetaLead(source: MetaLeadSource) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  window.fbq("track", "Lead", {
    content_name: source,
  });

  return true;
}
