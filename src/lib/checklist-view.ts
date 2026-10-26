/**
 * The parts of the planning checklist that are safe in the browser.
 *
 * The 121 tasks are a fixed template (Irene's master checklist). Each client
 * only stores what has changed: status, owner, due date, notes. This file
 * merges the two and works out progress and suggested due dates.
 * `checklist-data.ts` talks to the database and must stay on the server.
 */

import template from "@/data/planning-checklist.json";
import type { PortalClient } from "@/lib/client-types";
import { addBusinessDays, addPlanningDays } from "@/lib/planning-dates";

export const CHECKLIST_TRACKS = ["Planning Core", "Design & Floral"] as const;
export type ChecklistTrack = (typeof CHECKLIST_TRACKS)[number];

export const CHECKLIST_STATUSES = [
  "not_started",
  "in_progress",
  "waiting_client",
  "waiting_vendor",
  "at_risk",
  "complete",
  "not_applicable",
] as const;
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  waiting_client: "Waiting on client",
  waiting_vendor: "Waiting on vendor",
  at_risk: "At risk",
  complete: "Complete",
  not_applicable: "Not applicable",
};

export const CHECKLIST_OWNERS = [
  "Lead Planner",
  "Planning Assistant",
  "Creative Director",
  "Production Lead",
  "Studio Manager",
  "Client",
  "Vendor",
  "Venue",
  "Stationer",
] as const;
export type ChecklistOwner = (typeof CHECKLIST_OWNERS)[number];

export type ChecklistTemplateTask = {
  id: string;
  track: ChecklistTrack;
  phase: string;
  category: string;
  task: string;
  timing: string;
  owner: ChecklistOwner;
  priority: "High" | "Medium" | "Low";
  dependency: string;
  approval: "Yes" | "No";
};

export const CHECKLIST_TEMPLATE = template.tasks as ChecklistTemplateTask[];

/** Phases in template order, which is also calendar order. */
export const CHECKLIST_PHASES = [...new Set(CHECKLIST_TEMPLATE.map((task) => task.phase))];

/** One saved row from client_checklist_items. */
export type ChecklistItemRow = {
  task_id: string;
  status: ChecklistStatus;
  owner: string | null;
  due_on: string | null;
  notes: string | null;
  updated_at: string;
  updated_by: string | null;
};

/** A template task with this client's changes applied. */
export type ChecklistItem = ChecklistTemplateTask & {
  status: ChecklistStatus;
  /** The owner in effect: the saved one, or the template's. */
  assignedOwner: string;
  /** The saved due date, if the studio set one. */
  dueOn: string | null;
  /** Worked out from the wedding date when nothing is saved. */
  suggestedDue: string | null;
  notes: string;
  updatedBy: string | null;
  updatedAt: string | null;
  /** False when the client did not book this task's track. */
  inScope: boolean;
};

export function isChecklistStatus(value: unknown): value is ChecklistStatus {
  return typeof value === "string" && (CHECKLIST_STATUSES as readonly string[]).includes(value);
}

export function isChecklistOwner(value: unknown): value is ChecklistOwner {
  return typeof value === "string" && (CHECKLIST_OWNERS as readonly string[]).includes(value);
}

export function isChecklistTaskId(value: unknown): value is string {
  return typeof value === "string" && CHECKLIST_TEMPLATE.some((task) => task.id === value);
}

/**
 * Which tracks this client booked. Every planning package gets the planning
 * track; design & floral only comes with a design tier.
 */
export function bookedTracks(client: Pick<PortalClient, "design_tier">): ChecklistTrack[] {
  return client.design_tier ? ["Planning Core", "Design & Floral"] : ["Planning Core"];
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/**
 * Turns the template's timing ("9-7 months", "60-30 days", "3-4 weeks before
 * the event") into a date off the wedding day. A range counts down to its
 * nearer end, because that end is the real deadline. Timings tied to the
 * booking date use Booked on when recorded. Kickoff-relative timings stay
 * manual until the kickoff date is known.
 */
export function suggestDue(task: Pick<ChecklistTemplateTask, "timing" | "phase">, eventDate: string | null, bookedOn?: string | null): string | null {
  const timing = task.timing.toLowerCase();

  if (task.phase === "Booking & Onboarding") {
    if (!bookedOn) return null;
    if (/^(immediately after booking|at booking)$/.test(timing)) return bookedOn;
    const business = timing.match(/^within (\d+) business days?$/);
    if (business) return addBusinessDays(bookedOn, Number(business[1]));
    const weeks = timing.match(/^first (\d+) weeks?$/);
    if (weeks) return addPlanningDays(bookedOn, Number(weeks[1]) * 7);
    // A booking date is not a kickoff meeting date. These stay manually dated.
    if (/kickoff/.test(timing)) return null;
  }
  if (!eventDate) return null;

  if (task.phase === "Post-Event") {
    if (/2 weeks after|10 business days/.test(timing)) return addDays(eventDate, 14);
    if (/after client follow-up/.test(timing)) return addDays(eventDate, 21);
    return addDays(eventDate, 7);
  }
  if (/^(event day|end of event|before room reveal|before ceremony)/.test(timing)) return eventDate;
  if (timing.startsWith("daily final week")) return addDays(eventDate, -7);
  if (timing.startsWith("on delivery")) return addDays(eventDate, -2);

  const match = timing.match(/^(\d+)(?:-(\d+))?\s*(month|week|day)s?/);
  if (!match) return null;
  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : first;
  const nearer = Math.min(first, second);
  const unit = match[3];

  if (unit === "month") {
    const value = new Date(`${eventDate}T00:00:00Z`);
    value.setUTCMonth(value.getUTCMonth() - nearer);
    return value.toISOString().slice(0, 10);
  }
  return addDays(eventDate, -(unit === "week" ? nearer * 7 : nearer));
}

/** Event-relative lead-up tasks: the ones a late booking can leave stranded in the past. */
function isEventLeadUp(task: Pick<ChecklistTemplateTask, "timing" | "phase">) {
  return task.phase !== "Booking & Onboarding" && task.phase !== "Post-Event";
}

function dayNumber(date: string) {
  return Math.round(new Date(`${date}T00:00:00Z`).getTime() / 86_400_000);
}

/**
 * The template assumes booking 14-18 months out. When a couple books later,
 * the earliest lead-up tasks would fall before they even booked. This squeezes
 * that early stretch, in its original order, into the first half of the time
 * actually left (Booked on to the wedding). Tasks already due in the second
 * half keep their real deadlines, so final counts and 30-day cutoffs never move.
 * The earliest tasks get a short runway after booking rather than all falling
 * due on the day the couple signs.
 * Without a Booked on date nothing moves: the studio records it, never infers it.
 */
export function rebaseLateBooking(raw: (string | null)[], leadUp: boolean[], eventDate: string | null, bookedOn: string | null | undefined): (string | null)[] {
  if (!eventDate || !bookedOn) return raw;
  const event = dayNumber(eventDate), booked = dayNumber(bookedOn);
  if (booked >= event) return raw;
  const early = raw.filter((date, index): date is string => leadUp[index] && date !== null).map(dayNumber);
  if (!early.length) return raw;
  const start = Math.min(...early);
  if (start >= booked) return raw;
  const pivot = booked + Math.floor((event - booked) / 2);
  const runway = Math.min(14, Math.floor((pivot - booked) / 4));
  const first = booked + runway;
  return raw.map((date, index) => {
    if (!date || !leadUp[index]) return date;
    const day = dayNumber(date);
    if (day >= pivot) return date;
    return addDays(bookedOn, runway + Math.round(((day - start) * (pivot - first)) / (pivot - start)));
  });
}

export function buildChecklist(
  client: Pick<PortalClient, "design_tier" | "event_date"> & Pick<PortalClient, "booked_on">,
  rows: ChecklistItemRow[],
): ChecklistItem[] {
  const saved = new Map(rows.map((row) => [row.task_id, row]));
  const tracks = bookedTracks(client);
  const suggested = rebaseLateBooking(
    CHECKLIST_TEMPLATE.map((task) => suggestDue(task, client.event_date, client.booked_on)),
    CHECKLIST_TEMPLATE.map(isEventLeadUp),
    client.event_date,
    client.booked_on,
  );

  return CHECKLIST_TEMPLATE.map((task, index) => {
    const row = saved.get(task.id);
    const inScope = tracks.includes(task.track);
    return {
      ...task,
      // A track the client did not book reads as Not applicable until the
      // studio says otherwise. Nothing is ever deleted.
      status: row?.status ?? (inScope ? "not_started" : "not_applicable"),
      assignedOwner: row?.owner || task.owner,
      dueOn: row?.due_on ?? null,
      suggestedDue: suggested[index],
      notes: row?.notes ?? "",
      updatedBy: row?.updated_by ?? null,
      updatedAt: row?.updated_at ?? null,
      inScope,
    };
  });
}

export function effectiveDue(item: ChecklistItem) {
  return item.dueOn ?? item.suggestedDue;
}

export type ChecklistProgress = { done: number; total: number; percent: number };

/** Not applicable tasks are left out of the count entirely. */
export function progressOf(items: ChecklistItem[]): ChecklistProgress {
  const counted = items.filter((item) => item.status !== "not_applicable");
  const done = counted.filter((item) => item.status === "complete").length;
  return {
    done,
    total: counted.length,
    percent: counted.length ? Math.round((done / counted.length) * 100) : 0,
  };
}

/** Days until a date. Negative means it has slipped. */
export function daysUntil(date: string | null) {
  if (!date) return null;
  const today = new Date();
  const midnightUtcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((new Date(`${date}T00:00:00Z`).getTime() - midnightUtcToday) / 86_400_000);
}

export function isOpen(item: ChecklistItem) {
  return item.status !== "complete" && item.status !== "not_applicable";
}

export function formatChecklistDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}
