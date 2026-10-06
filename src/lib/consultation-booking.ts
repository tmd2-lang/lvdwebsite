export const CONSULTATION_URL = "https://calendly.com/ladyvictoriadesigns/design-consultation";
const KEY = "lvd.consultation.v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type BookingContext = { leadId: string; name: string; email: string; savedAt: number };
export function rememberConsultation(leadId: string, name: string, email: string) {
  try {
    if (typeof window !== "undefined" && UUID.test(leadId)) window.sessionStorage.setItem(KEY, JSON.stringify({ leadId, name, email, savedAt: Date.now() }));
  } catch { /* Storage restrictions must never interrupt an inquiry. */ }
}
export function consultationContext(): BookingContext | null {
  try {
    if (typeof window === "undefined") return null;
    const item = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
    if (!item || !UUID.test(item.leadId) || typeof item.name !== "string" || typeof item.email !== "string" || typeof item.savedAt !== "number" || Date.now() - item.savedAt > 86400000 || item.savedAt > Date.now()) return null;
    return item;
  } catch { return null; }
}
export function consultationUrl() {
  const context = consultationContext();
  const url = new URL(CONSULTATION_URL);
  if (context) url.searchParams.set("utm_content", `lvd_lead_${context.leadId}`);
  return url.toString();
}
