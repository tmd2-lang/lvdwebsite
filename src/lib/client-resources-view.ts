export const STANDARD_DOCUMENT_KEYS = ["welcome_packet", "planning_guide"] as const;
export type StandardDocumentKey = (typeof STANDARD_DOCUMENT_KEYS)[number];
export const STANDARD_DOCUMENT_LABELS: Record<StandardDocumentKey, string> = {
  welcome_packet: "Client Welcome & Onboarding Packet",
  planning_guide: "Planning Investment Guide",
};
export function isStandardDocumentKey(value: unknown): value is StandardDocumentKey {
  return typeof value === "string" && (STANDARD_DOCUMENT_KEYS as readonly string[]).includes(value);
}

export type ClientPostEvent = {
  client_id: string;
  photographer_gallery_url: string | null;
  updated_at: string;
  updated_by: string | null;
};

/** Links are stored for the studio to open; never fetched by the server. */
export function normalizePhotographerGallery(value: unknown): string | null {
  if (typeof value !== "string") throw new Error("Enter a gallery link or leave it blank.");
  const text = value.trim();
  if (!text) return null;
  if (text.length > 2048) throw new Error("That gallery link is too long.");
  let url: URL;
  try { url = new URL(text); } catch { throw new Error("Enter a complete HTTPS gallery link."); }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error("Use an HTTPS gallery link without a username or password in the address.");
  return url.href;
}
