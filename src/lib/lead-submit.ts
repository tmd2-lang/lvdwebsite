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
  payload?: Record<string, unknown>;
};

export async function submitLead(submission: LeadSubmission) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof result.error === "string" ? result.error : "Could not submit your inquiry.");
  }

  return result as { leadId: string; notificationSent: boolean };
}
