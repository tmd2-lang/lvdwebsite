export const LEAD_STATUSES = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "booked",
  "archived",
  "spam",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadNote = {
  id: string;
  lead_id: string;
  created_at: string;
  author_name: string | null;
  body: string;
};

export type AdminLead = {
  id: string;
  created_at: string;
  updated_at: string;
  source: string;
  status: LeadStatus;
  name: string | null;
  email: string | null;
  phone: string | null;
  celebration_type: string | null;
  event_date: string | null;
  date_undecided: boolean;
  venue: string | null;
  guest_count: string | null;
  services: string[];
  vision: string | null;
  investment: string | null;
  referral_source: string | null;
  quiz_score: number | null;
  quiz_result_tier: string | null;
  attachments: string[];
  notes: LeadNote[];
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
};
