import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import {
  clearReference,
  createRecord,
  deleteRecord,
  getRecord,
  getRecordIds,
  getSettings,
  getTableNames,
  saveSettings,
  updateRecord,
} from "@/lib/guests-data";
import {
  EVENTS,
  FIELDS_BY_KIND,
  LOCKED_FIELDS,
  SETUP_FIELDS,
  guestName,
  type GuestData,
  type GuestRecord,
  type GuestSettings,
  type RecordKind,
} from "@/lib/guests-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: RecordKind[] = ["guest", "household", "table"];

class InputError extends Error {}

/** Keeps only known fields, each in its own shape. Unknown keys are dropped. */
function clean(kind: RecordKind, raw: unknown, refs: { household: Set<string>; table: Set<string> }): GuestData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InputError("That record was not readable.");
  const input = raw as Record<string, unknown>;
  const data: GuestData = {};

  for (const field of FIELDS_BY_KIND[kind]) {
    const value = input[field.key];
    if (field.key === "events") {
      const events: Record<string, boolean> = {};
      if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const [event, going] of Object.entries(value as Record<string, unknown>)) {
          if (EVENTS.includes(event) && typeof going === "boolean") events[event] = going;
        }
      }
      data.events = events;
      continue;
    }
    switch (field.kind) {
      case "yesno":
        data[field.key] = value === true;
        break;
      case "number": {
        const number = Number(value ?? 0);
        if (!Number.isInteger(number) || number < 0 || number > 1000) throw new InputError(`${field.label} needs to be a whole number.`);
        data[field.key] = number;
        break;
      }
      case "date": {
        const date = typeof value === "string" ? value : "";
        if (date && !DATE.test(date)) throw new InputError(`${field.label} was not a readable date.`);
        data[field.key] = date;
        break;
      }
      case "select": {
        const choice = typeof value === "string" ? value : "";
        const options = field.options ?? [];
        if (choice && !options.includes(choice)) throw new InputError(`"${choice}" is not on the ${field.label.toLowerCase()} list.`);
        data[field.key] = choice || (options.includes("") ? "" : options[0]);
        break;
      }
      case "household":
      case "table": {
        const ref = typeof value === "string" ? value : "";
        if (ref && !refs[field.kind].has(ref)) throw new InputError(`That ${field.kind} no longer exists. Reload the page.`);
        data[field.key] = ref;
        break;
      }
      default: {
        if (value !== undefined && value !== null && typeof value !== "string") throw new InputError(`${field.label} was not readable.`);
        const string = typeof value === "string" ? value.trim() : "";
        if (string.length > (field.max ?? 500)) throw new InputError(`Keep ${field.label.toLowerCase()} under ${field.max ?? 500} characters.`);
        data[field.key] = string;
      }
    }
    if (field.required && !data[field.key]) throw new InputError(`${field.label} is needed.`);
  }
  return data;
}

function display(field: string, value: unknown, refs: Map<string, string>) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const string = typeof value === "string" ? value : "";
  if (field === "table_id") return refs.get(string) ?? (string ? "a removed table" : "no seat");
  return string || "blank";
}

/**
 * After counts are locked, changes to attendance, meals, allergies, or seats
 * still save, but each one is written into the exception log.
 */
async function logExceptions(
  clientId: string,
  settings: GuestSettings,
  name: string,
  before: GuestData | null,
  after: GuestData | null,
  by: string,
) {
  if (!settings.counts_locked) return;
  const attendingBefore = before?.rsvp === "Attending";
  const attendingAfter = after?.rsvp === "Attending";
  if (!attendingBefore && !attendingAfter) return;

  const tableNames = await getTableNames(clientId);
  const at = new Date().toISOString();
  const entries: GuestSettings["exceptions"] = [];
  if (!before) entries.push({ at, by, guest: name, field: "guest", from: "not on the list", to: "added, attending" });
  else if (!after) entries.push({ at, by, guest: name, field: "guest", from: "attending", to: "removed" });
  else {
    for (const field of LOCKED_FIELDS) {
      if (JSON.stringify(before[field] ?? "") !== JSON.stringify(after[field] ?? "")) {
        entries.push({ at, by, guest: name, field, from: display(field, before[field], tableNames), to: display(field, after[field], tableNames) });
      }
    }
  }
  if (entries.length) await saveSettings(clientId, { exceptions: [...settings.exceptions, ...entries].slice(-500) }, by);
}

// Owners and planners both run guest lists.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const client = await getClientById(typeof body.clientId === "string" ? body.clientId : "");
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });
    const by = user.email;

    switch (body.action) {
      case "save": {
        const kind = body.kind as RecordKind;
        if (!KINDS.includes(kind)) throw new InputError("Save what?");
        const [household, table] = await Promise.all([getRecordIds(client.id, "household"), getRecordIds(client.id, "table")]);
        const data = clean(kind, body.data, { household, table });
        const recordId = typeof body.id === "string" && body.id ? body.id : null;

        let before: GuestRecord | null = null;
        if (recordId) {
          before = await getRecord(client.id, recordId);
          if (!before || before.kind !== kind) throw new InputError("That record no longer exists. Reload the page.");
        }
        const record = recordId ? await updateRecord(client.id, recordId, data, by) : await createRecord(client.id, kind, data, by);
        if (kind === "guest") await logExceptions(client.id, await getSettings(client.id), guestName(record), before?.data ?? null, data, by);
        return NextResponse.json({ record });
      }
      case "delete": {
        const recordId = typeof body.id === "string" ? body.id : "";
        const record = await getRecord(client.id, recordId);
        if (!record) throw new InputError("That record no longer exists. Reload the page.");
        if (record.kind === "household") await clearReference(client.id, "household_id", record.id, by);
        if (record.kind === "table") await clearReference(client.id, "table_id", record.id, by);
        await deleteRecord(client.id, record.id);
        if (record.kind === "guest") await logExceptions(client.id, await getSettings(client.id), guestName(record), record.data, null, by);
        return NextResponse.json({ ok: true });
      }
      case "settings": {
        const patch: Partial<GuestSettings> = {};
        if (body.setup !== undefined) {
          if (!body.setup || typeof body.setup !== "object") throw new InputError("Setup was not readable.");
          const raw = body.setup as Record<string, unknown>;
          patch.setup = Object.fromEntries(SETUP_FIELDS.map((field) => {
            const value = typeof raw[field] === "string" ? (raw[field] as string).trim() : "";
            if (value.length > 200) throw new InputError(`Keep ${field} under 200 characters.`);
            return [field, value];
          }));
        }
        if (body.events !== undefined) {
          if (!Array.isArray(body.events)) throw new InputError("Events were not readable.");
          patch.events = EVENTS.filter((event) => (body.events as unknown[]).includes(event));
        }
        if (typeof body.locked === "boolean") {
          patch.counts_locked = body.locked;
          patch.locked_at = body.locked ? new Date().toISOString() : null;
          patch.locked_by = body.locked ? by : null;
        }
        const settings = await saveSettings(client.id, patch, by);
        return NextResponse.json({ settings });
      }
      default:
        throw new InputError("Unknown guest action.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

