import type { Attribution } from "./attribution";
import type { LostReason } from "./sales-stage";

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

export type LeadActivity = {
  id: string;
  lead_id: string;
  created_at: string;
  actor_id: string;
  actor_name: string;
  kind: "viewed" | "status_changed" | "note_added" | "appointment_scheduled" | "appointment_canceled" | "appointment_rescheduled" | "sales_update";
  detail: string | null;
};

export type LeadAppointment = {
  id: string; lead_id: string | null; starts_at: string; ends_at: string;
  status: "scheduled" | "canceled"; rescheduled: boolean;
  outcome: "completed" | "no_show" | null;
};

export type AdminLead = {
  appointments?: LeadAppointment[];
  consultation_sync_available?: boolean;
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
  activity?: LeadActivity[];
  tracking_started_at?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  meta_campaign_id?: string | null;
  meta_adset_id?: string | null;
  meta_ad_id?: string | null;
  landing_page?: string | null;
  first_touch_at?: string | null;
  attribution?: Attribution | null;
  consult_outcome?: "completed" | "no_show" | null;
  consult_outcome_at?: string | null;
  fit?: "good_fit" | "not_fit" | null;
  fit_at?: string | null;
  proposal_amount?: number | string | null;
  proposal_sent_at?: string | null;
  sales_outcome?: "booked" | "lost" | null;
  booked_amount?: number | string | null;
  sales_outcome_at?: string | null;
  lost_reason?: LostReason | null;
  lost_note?: string | null;
  sales_available?: boolean;
};

export const ADMIN_ROLES = ["owner", "planner", "inquiry_staff"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: AdminRole;
  avatarUrl: string | null;
};
