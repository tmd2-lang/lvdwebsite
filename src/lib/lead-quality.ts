/** Narrow solicitation patterns; retain the record for staff review. */
export function isMarketingSolicitation(vision: string) {
  return /\b(reviewing|reviewed|looking at|looked at) your (website|site)\b/i.test(vision)
    && /\b(seo|chatgpt|search engine|website traffic|local users|rankings)\b/i.test(vision)
    && /\b(would you be open|interested in|offer our|our services)\b/i.test(vision);
}

export type LeadNotification = {
  status: "queued" | "accepted" | "failed" | "not_configured";
  attempts: number;
  updatedAt: string;
};

export function readLeadNotification(payload: unknown): LeadNotification | undefined {
  if (!payload || typeof payload !== "object") return;
  const value = (payload as { notification?: LeadNotification }).notification;
  if (!value || !["queued", "accepted", "failed", "not_configured"].includes(value.status)
    || !Number.isInteger(value.attempts) || typeof value.updatedAt !== "string") return;
  return value;
}
