import { GUEST_FIELD_GROUPS, HOUSEHOLD_FIELDS, EVENTS, type FieldDef, type GuestData, type GuestRecord } from "@/lib/guests-view";
import { isPlanningDate } from "@/lib/planning-dates";

const PRIVATE_KEYS = new Set(["notes", "source", "rsvp_date", "gift", "gift_delivery"]);
export const COUPLE_GUEST_GROUPS = GUEST_FIELD_GROUPS
  .filter((group) => !["Follow-up", "Seating"].includes(group.title))
  .map((group) => ({ ...group, fields: group.fields.filter((field) => !PRIVATE_KEYS.has(field.key)) }));
export const COUPLE_GUEST_FIELDS = COUPLE_GUEST_GROUPS.flatMap((group) => group.fields);
export const COUPLE_HOUSEHOLD_FIELDS = HOUSEHOLD_FIELDS;
export type CoupleGuestKind = "guest" | "household";
export type CoupleGuestRecord = Pick<GuestRecord, "id" | "kind" | "data" | "created_at"> & { updated_at: string };
export type CoupleGuests = {
  records: CoupleGuestRecord[];
  tables: { id: string; name: string }[];
  events: string[];
  countsLocked: boolean;
};
export const fieldsForCouple = (kind: CoupleGuestKind) => kind === "guest" ? COUPLE_GUEST_FIELDS : COUPLE_HOUSEHOLD_FIELDS;

export function blankCoupleRecord(kind: CoupleGuestKind): GuestData {
  const data: GuestData = {};
  for (const field of fieldsForCouple(kind)) data[field.key] = field.kind === "yesno" ? false : field.kind === "select" ? field.options?.[0] ?? "" : "";
  if (kind === "guest") data.events = {};
  return data;
}

/** Validate a patch, never replace hidden studio fields with a client copy. */
export function cleanCoupleGuestPatch(kind: CoupleGuestKind, raw: unknown, householdIds: Set<string>, enabledEvents: string[]): GuestData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Enter guest details.");
  const input = raw as Record<string, unknown>;
  const definitions = new Map(fieldsForCouple(kind).map((field) => [field.key, field]));
  const data: GuestData = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "events" && kind === "guest") {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Choose valid event attendance.");
      const events: Record<string, boolean> = {};
      for (const [event, going] of Object.entries(value as Record<string, unknown>)) {
        if (!enabledEvents.includes(event) || !EVENTS.includes(event) || typeof going !== "boolean") throw new Error("Choose valid event attendance.");
        events[event] = going;
      }
      data.events = events; continue;
    }
    const field: FieldDef | undefined = definitions.get(key);
    if (!field) throw new Error("That field is managed by the studio.");
    if (field.kind === "yesno") {
      if (typeof value !== "boolean") throw new Error(`Choose Yes or No for ${field.label}.`);
      data[key] = value; continue;
    }
    if (typeof value !== "string") throw new Error(`Enter ${field.label.toLowerCase()}.`);
    const text = value.trim();
    if (text.length > (field.max ?? 500)) throw new Error(`${field.label} is too long.`);
    if (field.required && !text) throw new Error(`${field.label} is required.`);
    if (field.kind === "select" && !(field.options ?? []).includes(text)) throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
    if (field.kind === "date" && text && !isPlanningDate(text)) throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
    if (field.kind === "household" && text && !householdIds.has(text)) throw new Error("Choose a household from your guest list.");
    if (field.kind === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error("Enter a valid email address.");
    data[key] = text;
  }
  return data;
}

export function projectCoupleGuestRecord(record: GuestRecord): CoupleGuestRecord | null {
  if (record.kind !== "guest" && record.kind !== "household") return null;
  const keys = new Set(fieldsForCouple(record.kind).map((f) => f.key));
  if (record.kind === "guest") { keys.add("table_id"); keys.add("events"); }
  return {
    id: record.id, kind: record.kind, created_at: record.created_at, updated_at: record.updated_at ?? record.created_at,
    data: Object.fromEntries(Object.entries(record.data).filter(([key]) => keys.has(key))),
  };
}
