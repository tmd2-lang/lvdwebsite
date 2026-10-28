import { attributionForSubmit } from "./attribution";
import { rememberConsultation } from "./consultation-booking";
import { trackGA4 } from "./ga4";
import { trackMetaLead } from "./meta-pixel";

export type LeadSource = "inquire" | "consultation" | "reserve" | "style_quiz";

export type LeadSubmission = {
  source: LeadSource;
  name: string;
  email: string;
  phone: string;
  celebrationType?: string;
  date?: string;
  dateUndecided?: boolean;
  venue?: string;
  guestCount?: string;
  services?: string[];
  vision?: string;
  investment?: string;
  referralSource?: string;
  quizScore?: number;
  quizResultTier?: string;
  attachments?: string[];
  payload?: Record<string, unknown>;
};

type SubmissionResult = { leadId: string; notificationSent: false; notificationStatus: "queued" | "not_configured"; trackingEligible: boolean };
const pendingSubmissions = new Map<string, Promise<SubmissionResult>>();

/** A double click while a save is in flight shares the original request. */
export function submitLead(submission: LeadSubmission) {
  const key = JSON.stringify(submission);
  const pending = pendingSubmissions.get(key);
  if (pending) return pending;
  const request = sendLead(submission).finally(() => pendingSubmissions.delete(key));
  pendingSubmissions.set(key, request);
  return request;
}

async function sendLead(submission: LeadSubmission) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...submission, attribution: attributionForSubmit() }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof result.error === "string" ? result.error : "Could not submit your inquiry.");
  }

  if (typeof result.leadId !== "string" || !result.leadId) {
    throw new Error("Could not confirm your saved inquiry. Please contact the studio before submitting again.");
  }
  if (result.trackingEligible !== false) {
    // Analytics must not turn a saved inquiry into a failed form and another submission.
    try { trackMetaLead(submission.source, result.leadId); } catch { /* Non-critical analytics. */ }
  }
  rememberConsultation(result.leadId, submission.name, submission.email);

  if (typeof window !== "undefined") {
    const path = window.location.pathname.replace(/\/$/, "");
    if (result.trackingEligible !== false && (path === "/welcome" || path === "/inquire")) {
      try { trackGA4("generate_lead", path === "/welcome" ? "welcome" : "inquire"); } catch { /* The inquiry is already saved. */ }
    }
  }

  return result as SubmissionResult;
}
