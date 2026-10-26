/**
 * The parts of the event-day timeline that are safe in the browser: lists,
 * types, the starter template, and the rules. `timeline-data.ts` talks to the
 * database and stays on the server.
 *
 * Rules from the Muse package (TIMELINE-INTEGRATION.md):
 * - Every cue has a track and a visibility; the couple and vendors only ever
 *   get filtered views of the one timeline.
 * - Editing a Confirmed cue or block flips it to Changed and bumps the version.
 * - Times are wall-clock times on the event day. The day runs past midnight,
 *   so anything before 6 AM sorts after the evening.
 */

import template from "@/data/timeline-template.json";
import type { PortalClient } from "@/lib/client-types";

export const TIMELINE_PHASES = template.phases;
export const TIMELINE_STATUSES = template.statuses;
export const TIMELINE_VISIBILITY = template.visibility;
export const TIMELINE_PRIORITIES = template.priorities;
export const TIMELINE_TRACKS = template.tracks;
export const VENDOR_TYPES = template.vendor_types;
export const OVERVIEW_FIELDS = template.overview_fields.filter((field) => field !== "Version");
export const QUALITY_CHECKS = ["Pending", "Passed", "Corrected"];

export type TimelineCue = {
  ref: string;
  start: string;
  end: string;
  phase: string;
  track: string;
  activity: string;
  location: string;
  owner: string;
  people: string;
  dependency: string;
  visibility: string;
  priority: string;
  status: string;
  notes: string;
};

export type ProductionBlock = {
  ref: string;
  start: string;
  end: string;
  workstream: string;
  task: string;
  location: string;
  crew: string;
  crew_count: number;
  equipment: string;
  ready_by: string;
  quality_check: string;
  status: string;
  notes: string;
};

export type TimelineVendor = {
  ref: string;
  company: string;
  type: string;
  lead: string;
  mobile: string;
  email: string;
  arrival: string;
  ready_by: string;
  departure: string;
  loading: string;
  setup_location: string;
  power: string;
  meals: string;
};

export type CrewMember = {
  ref: string;
  name: string;
  role: string;
  call_time: string;
  out_time: string;
  meal: string;
  mobile: string;
};

export type TimelineDoc = {
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  version: number;
  overview: Record<string, string>;
  cues: TimelineCue[];
  production: ProductionBlock[];
  vendors: TimelineVendor[];
  crew: CrewMember[];
  /** Null until the first save. Sent back with every save to catch clashes. */
  updated_at: string | null;
  updated_by: string | null;
};

/** "confirm" marks every unconfirmed cue and block Confirmed in one save. */
export type TimelineSection = "overview" | "cues" | "production" | "vendors" | "crew" | "confirm";

export const UNCONFIRMED_STATUSES = ["Draft", "Pending Confirmation", "Changed"];

const GUEST_COUNT_FIELD = "Guest Count (final, locked)";

/**
 * Fills a blank guest count from the client record so the planner never has
 * to retype it. Anything already typed into the timeline wins.
 */
export function withClientGuestCount(doc: TimelineDoc, client: Pick<PortalClient, "guest_count">): TimelineDoc {
  if (doc.overview[GUEST_COUNT_FIELD]?.trim() || !client.guest_count?.trim()) return doc;
  return { ...doc, overview: { ...doc.overview, [GUEST_COUNT_FIELD]: client.guest_count.trim() } };
}

/** The starter timeline for a client nobody has edited yet. */
export function starterTimeline(client: Pick<PortalClient, "display_name" | "event_date" | "venue" | "guest_count">): TimelineDoc {
  const overview: Record<string, string> = Object.fromEntries(OVERVIEW_FIELDS.map((field) => [field, ""]));
  overview["Couple / Client"] = client.display_name;
  overview["Wedding Date"] = client.event_date ?? "";
  overview["Ceremony Venue"] = client.venue ?? "";
  overview["Reception Venue"] = client.venue ?? "";
  overview["Ceremony Time"] = "17:00";
  return {
    version: 1,
    overview,
    cues: template.seed_timeline.map((cue) => ({ ...cue })),
    production: template.seed_production.map((block) => ({ ...block })),
    vendors: [],
    crew: [],
    updated_at: null,
    updated_by: null,
  };
}

/** Minutes into the event day, where 00:00–05:59 counts as after midnight. */
export function dayMinutes(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < 6 * 60 ? minutes + 24 * 60 : minutes;
}

export function byStartTime<T extends { start: string; ref: string }>(rows: T[]) {
  return [...rows].sort((a, b) => dayMinutes(a.start) - dayMinutes(b.start) || a.ref.localeCompare(b.ref));
}

/** "17:30" → "5:30 PM". */
export function formatTime(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time || "—";
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

/** Next free ref like TL-028, so new rows never collide with seeded ones. */
export function nextRef(prefix: string, rows: { ref: string }[]) {
  const highest = rows.reduce((max, row) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(row.ref);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
}

/** What the couple's view would show: their cues and the guests'. */
export function isClientVisible(cue: TimelineCue) {
  return cue.visibility === "Client Facing" || cue.visibility === "Guest Facing";
}

/**
 * Applies the version rule to a saved section. Any row that was Confirmed and
 * comes back with different content (and was not deliberately moved to
 * another status) becomes Changed. Returns the rows and whether to bump.
 */
export function applyVersionRule<T extends { ref: string; status: string }>(previous: T[], next: T[]) {
  const before = new Map(previous.map((row) => [row.ref, row]));
  let bumped = false;
  const rows = next.map((row) => {
    const old = before.get(row.ref);
    if (!old) { if (previous.some((item) => item.status === "Confirmed")) bumped = true; return row; }
    if (old.status !== "Confirmed") return row;
    // Field by field: the database does not keep key order.
    const keys = new Set([...Object.keys(old), ...Object.keys(row)]);
    const same = [...keys].every((key) => (old as Record<string, unknown>)[key] === (row as Record<string, unknown>)[key]);
    if (same) return row;
    bumped = true;
    return { ...row, status: row.status === "Confirmed" ? "Changed" : row.status };
  });
  // Removing a confirmed row is a change too.
  if (previous.some((row) => row.status === "Confirmed" && !next.some((other) => other.ref === row.ref))) bumped = true;
  return { rows, bumped };
}

/** Today as YYYY-MM-DD in the viewer's own time zone. */
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
