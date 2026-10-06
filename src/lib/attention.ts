/**
 * Step 5: which inquiries need a person today, and why. Derived only from
 * data the portal already has; nothing extra is stored.
 */
import type { AdminLead } from "./admin-types";
import { currentConsultation } from "./consultation-display";

export const NEW_LEAD_WINDOW_DAYS = 14;
export const PROPOSAL_FOLLOW_UP_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

export const ATTENTION_REASONS = {
  consult_today: "Consult today",
  outcome_missing: "Outcome missing",
  proposal_waiting: "Proposal waiting",
  new_uncontacted: "New, not contacted",
} as const;
export type AttentionReason = keyof typeof ATTENTION_REASONS;
const ORDER = Object.keys(ATTENTION_REASONS) as AttentionReason[];

function easternDay(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

export function attentionReasons(lead: AdminLead, now = new Date()): AttentionReason[] {
  const closed = lead.sales_outcome || lead.fit === "not_fit" || ["booked", "archived", "spam"].includes(lead.status);
  if (closed) return [];
  const reasons: AttentionReason[] = [];
  const consult = currentConsultation(lead.appointments);
  const upcoming = consult?.status === "scheduled" ? consult : null;
  if (upcoming && !lead.consult_outcome) {
    if (easternDay(new Date(upcoming.starts_at)) === easternDay(now) && Date.parse(upcoming.ends_at) >= now.getTime()) reasons.push("consult_today");
    else if (Date.parse(upcoming.ends_at) < now.getTime()) reasons.push("outcome_missing");
  }
  if (lead.proposal_sent_at && now.getTime() - Date.parse(lead.proposal_sent_at) > PROPOSAL_FOLLOW_UP_DAYS * DAY) reasons.push("proposal_waiting");
  const fresh = now.getTime() - Date.parse(lead.created_at) < NEW_LEAD_WINDOW_DAYS * DAY;
  if (fresh && ["new", "reviewing"].includes(lead.status) && !upcoming && !lead.consult_outcome && !lead.fit && lead.proposal_amount == null) {
    reasons.push("new_uncontacted");
  }
  return reasons;
}

/** Most urgent first: consults today, then missing outcomes, proposals, new leads; oldest first within each. */
export function needsAttention(leads: AdminLead[], now = new Date()) {
  return leads
    .map((lead) => ({ lead, reasons: attentionReasons(lead, now) }))
    .filter((item) => item.reasons.length)
    .sort((a, b) => ORDER.indexOf(a.reasons[0]) - ORDER.indexOf(b.reasons[0]) || Date.parse(a.lead.created_at) - Date.parse(b.lead.created_at))
    .map((item) => item.lead);
}
