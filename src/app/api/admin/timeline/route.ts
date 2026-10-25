import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { TimelineConflictError, deleteTimeline, getTimeline, saveTimeline } from "@/lib/timeline-data";
import {
  OVERVIEW_FIELDS,
  QUALITY_CHECKS,
  TIMELINE_PHASES,
  TIMELINE_PRIORITIES,
  TIMELINE_STATUSES,
  TIMELINE_TRACKS,
  TIMELINE_VISIBILITY,
  VENDOR_TYPES,
  UNCONFIRMED_STATUSES,
  applyVersionRule,
  starterTimeline,
  type CrewMember,
  type ProductionBlock,
  type TimelineCue,
  type TimelineVendor,
} from "@/lib/timeline-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;
const MAX_ROWS = 300;

class InputError extends Error {}

type Row = Record<string, unknown>;

function rows(value: unknown): Row[] {
  if (!Array.isArray(value)) throw new InputError("That list was not readable.");
  if (value.length > MAX_ROWS) throw new InputError(`Keep each list under ${MAX_ROWS} rows.`);
  return value.map((row) => {
    if (!row || typeof row !== "object") throw new InputError("A row was not readable.");
    return row as Row;
  });
}

function str(row: Row, key: string, max = 500) {
  const value = row[key];
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new InputError(`${key} was not readable.`);
  if (value.length > max) throw new InputError(`Keep ${key.replace("_", " ")} under ${max} characters.`);
  return value.trim();
}

function time(row: Row, key: string, label: string) {
  const value = str(row, key, 5);
  if (value && !TIME.test(value)) throw new InputError(`${label} needs to be a time like 17:30.`);
  return value;
}

function oneOf(row: Row, key: string, list: string[], fallback: string) {
  const value = str(row, key, 60);
  if (!value) return fallback;
  if (!list.includes(value)) throw new InputError(`"${value}" is not on the ${key} list.`);
  return value;
}

function ref(row: Row, prefix: string) {
  const value = str(row, "ref", 20);
  if (!new RegExp(`^${prefix}-\\d{3,4}$`).test(value)) throw new InputError("A row is missing its reference.");
  return value;
}

function uniqueRefs<T extends { ref: string }>(list: T[]) {
  if (new Set(list.map((row) => row.ref)).size !== list.length) throw new InputError("Two rows share a reference. Reload and try again.");
  return list;
}

function cues(value: unknown): TimelineCue[] {
  return uniqueRefs(rows(value).map((row) => {
    const activity = str(row, "activity");
    if (!activity) throw new InputError("Every cue needs an activity.");
    return {
      ref: ref(row, "TL"),
      start: time(row, "start", "Start"),
      end: time(row, "end", "End"),
      phase: oneOf(row, "phase", TIMELINE_PHASES, "Reception"),
      track: oneOf(row, "track", TIMELINE_TRACKS, "Shared"),
      activity,
      location: str(row, "location", 200),
      owner: str(row, "owner", 200),
      people: str(row, "people", 300),
      dependency: str(row, "dependency", 300),
      visibility: oneOf(row, "visibility", TIMELINE_VISIBILITY, "Internal Only"),
      priority: oneOf(row, "priority", TIMELINE_PRIORITIES, "Medium"),
      status: oneOf(row, "status", TIMELINE_STATUSES, "Draft"),
      notes: str(row, "notes", 2000),
    };
  }));
}

function production(value: unknown): ProductionBlock[] {
  return uniqueRefs(rows(value).map((row) => {
    const task = str(row, "task");
    if (!task) throw new InputError("Every production block needs a task.");
    const count = Number(row.crew_count ?? 0);
    if (!Number.isInteger(count) || count < 0 || count > 500) throw new InputError("Crew count needs to be a whole number.");
    return {
      ref: ref(row, "PROD"),
      start: time(row, "start", "Start"),
      end: time(row, "end", "End"),
      workstream: str(row, "workstream", 120),
      task,
      location: str(row, "location", 200),
      crew: str(row, "crew", 200),
      crew_count: count,
      equipment: str(row, "equipment", 300),
      ready_by: time(row, "ready_by", "Ready by"),
      quality_check: oneOf(row, "quality_check", QUALITY_CHECKS, "Pending"),
      status: oneOf(row, "status", TIMELINE_STATUSES, "Draft"),
      notes: str(row, "notes", 2000),
    };
  }));
}

function vendors(value: unknown): TimelineVendor[] {
  return uniqueRefs(rows(value).map((row) => {
    const company = str(row, "company", 200);
    if (!company) throw new InputError("Every vendor needs a company name.");
    return {
      ref: ref(row, "VEN"),
      company,
      type: oneOf(row, "type", VENDOR_TYPES, "Other"),
      lead: str(row, "lead", 200),
      mobile: str(row, "mobile", 40),
      email: str(row, "email", 200),
      arrival: time(row, "arrival", "Arrival"),
      ready_by: time(row, "ready_by", "Ready by"),
      departure: time(row, "departure", "Departure"),
      loading: str(row, "loading", 300),
      setup_location: str(row, "setup_location", 200),
      power: str(row, "power", 300),
      meals: str(row, "meals", 120),
    };
  }));
}

function crew(value: unknown): CrewMember[] {
  return uniqueRefs(rows(value).map((row) => {
    const name = str(row, "name", 120);
    if (!name) throw new InputError("Every crew member needs a name.");
    return {
      ref: ref(row, "CREW"),
      name,
      role: str(row, "role", 120),
      call_time: time(row, "call_time", "Call time"),
      out_time: time(row, "out_time", "Out time"),
      meal: str(row, "meal", 120),
      mobile: str(row, "mobile", 40),
    };
  }));
}

function overview(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("The overview was not readable.");
  const row = value as Row;
  return Object.fromEntries(OVERVIEW_FIELDS.map((field) => [field, str(row, field, 1000)]));
}

// Owners and planners both run the event-day timeline.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });

  try {
    const body = (await request.json()) as Row;
    const client = await getClientById(typeof body.clientId === "string" ? body.clientId : "");
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    if (body.action === "reset") {
      await deleteTimeline(client.id);
      return NextResponse.json({ timeline: starterTimeline(client) });
    }

    const saved = await getTimeline(client.id);
    const current = saved ?? starterTimeline(client);
    const expected = typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : null;
    if ((saved?.updated_at ?? null) !== expected) {
      throw new TimelineConflictError("Someone else changed this timeline since you opened it. Reload to see their changes, then make yours again.");
    }

    const next = {
      confirmed_at: null as string | null,
      confirmed_by: null as string | null,
      version: current.version,
      overview: current.overview,
      cues: current.cues,
      production: current.production,
      vendors: current.vendors,
      crew: current.crew,
    };

    switch (body.section) {
      case "overview":
        next.overview = overview(body.data);
        break;
      case "cues": {
        const result = applyVersionRule(current.cues, cues(body.data));
        next.cues = result.rows;
        if (result.bumped) next.version += 1;
        break;
      }
      case "production": {
        const result = applyVersionRule(current.production, production(body.data));
        next.production = result.rows;
        if (result.bumped) next.version += 1;
        break;
      }
      case "confirm": {
        // Confirming changes no content, so the version stays where it is.
        const confirm = <T extends { status: string }>(list: T[]) =>
          list.map((row) => (UNCONFIRMED_STATUSES.includes(row.status) ? { ...row, status: "Confirmed" } : row));
        next.cues = confirm(current.cues);
        next.production = confirm(current.production);
        next.confirmed_at = new Date().toISOString();
        next.confirmed_by = user.email;
        break;
      }
      case "vendors":
        next.vendors = vendors(body.data);
        break;
      case "crew":
        next.crew = crew(body.data);
        break;
      default:
        throw new InputError("Which part of the timeline?");
    }

    const timeline = await saveTimeline(client.id, next, expected, user.email);
    return NextResponse.json({ timeline });
  } catch (error) {
    if (error instanceof TimelineConflictError) return NextResponse.json({ error: error.message, conflict: true }, { status: 409 });
    const message = error instanceof Error ? error.message : "Could not save the timeline.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
