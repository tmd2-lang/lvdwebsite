/**
 * Step 4: what the sales team should be asked next for an inquiry.
 * Each fact is stored separately; the visible step is derived from them.
 */
export type SalesFields = {
  consult_outcome?: "completed" | "no_show" | null;
  fit?: "good_fit" | "not_fit" | null;
  proposal_amount?: number | string | null;
  sales_outcome?: "booked" | "lost" | null;
  booked_amount?: number | string | null;
  lost_reason?: LostReason | null;
};

export const LOST_REASONS = {
  budget: "Budget",
  no_response: "No response",
  went_elsewhere: "Went with someone else",
  date_unavailable: "Date unavailable",
  wrong_service: "Wanted a different service",
  other: "Other",
} as const;
export type LostReason = keyof typeof LOST_REASONS;

export type SalesAction =
  | "consult_completed" | "consult_no_show" | "consult_clear"
  | "fit_good" | "fit_not" | "fit_clear"
  | "proposal_sent" | "proposal_clear"
  | "booked" | "lost" | "outcome_clear";
export const SALES_ACTIONS: SalesAction[] = ["consult_completed", "consult_no_show", "consult_clear", "fit_good", "fit_not",
  "fit_clear", "proposal_sent", "proposal_clear", "booked", "lost", "outcome_clear"];

export type SalesStep =
  | { step: "consult" }
  | { step: "no_show"; undo: SalesAction }
  | { step: "fit"; undo: SalesAction }
  | { step: "not_fit"; undo: SalesAction }
  | { step: "proposal"; undo: SalesAction }
  | { step: "outcome"; undo: SalesAction }
  | { step: "booked"; undo: SalesAction }
  | { step: "lost"; undo: SalesAction };

/** The single next question, plus which action undoes the latest answer. */
export function salesStep(lead: SalesFields): SalesStep {
  if (lead.sales_outcome === "booked") return { step: "booked", undo: "outcome_clear" };
  if (lead.sales_outcome === "lost") return { step: "lost", undo: "outcome_clear" };
  if (lead.proposal_amount != null) return { step: "outcome", undo: "proposal_clear" };
  if (lead.fit === "good_fit") return { step: "proposal", undo: "fit_clear" };
  if (lead.fit === "not_fit") return { step: "not_fit", undo: "fit_clear" };
  if (lead.consult_outcome === "completed") return { step: "fit", undo: "consult_clear" };
  if (lead.consult_outcome === "no_show") return { step: "no_show", undo: "consult_clear" };
  return { step: "consult" };
}

/** "$38,500" or "38500.5" → number; null when it isn't a positive amount. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value > 0 && value <= 10_000_000 ? value : null;
}

export function formatMoney(value: number | string | null | undefined) {
  if (value == null || value === "") return "";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: amount % 1 ? 2 : 0 })
    : "";
}
