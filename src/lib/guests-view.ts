/**
 * The parts of the guest list that are safe in the browser: the lists, the
 * field definitions every view and form is drawn from, and the counts.
 * `guests-data.ts` talks to the database and stays on the server.
 *
 * From the Muse package (GUESTS-INTEGRATION.md): one record per guest, and
 * every workbook sheet becomes a filtered view of those records. The caterer
 * handoff is the only view that ever leaves the studio.
 */

export const RSVP = ["Not Invited", "Invited", "Awaiting Response", "Attending", "Declined", "Canceled"];
export const SIDES = ["Client A", "Client B", "Shared", "Professional", "Vendor / Staff"];
export const GUEST_TYPES = ["Adult", "Child", "Infant", "Vendor", "Performer", "Staff"];
export const INVITATION = ["Not Sent", "Save-the-Date Sent", "Invitation Sent", "Digital Invitation Sent", "Returned Mail"];
export const MEALS = ["Standard", "Beef", "Chicken", "Fish", "Vegetarian", "Vegan", "Child", "Other"];
export const TRANSPORT = ["Not Required", "Needs Shuttle", "VIP Vehicle", "Self-Transport", "Pending"];
export const HOTEL = ["Not Required", "Requested", "Booked", "Pending", "Other"];
export const FOLLOW_STATUS = ["No Follow-Up", "Follow-Up Needed", "Contacted", "Resolved", "Exception Approved"];
export const RESPONSE_SOURCE = ["Reply Card", "Online", "Phone", "Entered by Studio"];
export const EVENTS = ["Rehearsal", "Welcome Event", "Cultural / Religious Event", "Ceremony", "Cocktail Hour", "Reception", "After-Party", "Farewell Brunch"];
export const TABLE_TYPES = ["Round", "Rectangle", "Head Table", "Sweetheart", "Family", "Kids", "Vendor", "Other"];
export const SETUP_FIELDS = ["RSVP Deadline", "Invitation Capacity", "Venue Capacity", "Lead Planner", "Caterer Final Count Due"];

export type RecordKind = "guest" | "household" | "table";

/**
 * How each field is typed. "table" and "household" point at another record's
 * id; "events" is a map of event name to attending.
 */
export type FieldKind = "text" | "textarea" | "date" | "yesno" | "select" | "table" | "household" | "number" | "email";

export type FieldDef = { key: string; label: string; kind: FieldKind; options?: string[]; required?: boolean; max?: number };

export const GUEST_FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Guest",
    fields: [
      { key: "first", label: "First name", kind: "text", required: true, max: 80 },
      { key: "last", label: "Last name", kind: "text", max: 80 },
      { key: "household_id", label: "Household", kind: "household" },
      { key: "side", label: "Side", kind: "select", options: SIDES },
      { key: "type", label: "Type", kind: "select", options: GUEST_TYPES },
      { key: "vip", label: "VIP", kind: "yesno" },
      { key: "relationship", label: "Relationship", kind: "text", max: 120 },
      { key: "email", label: "Email", kind: "email", max: 200 },
      { key: "mobile", label: "Mobile", kind: "text", max: 40 },
    ],
  },
  {
    title: "RSVP",
    fields: [
      { key: "invitation", label: "Invitation", kind: "select", options: INVITATION },
      { key: "rsvp", label: "RSVP", kind: "select", options: RSVP },
      { key: "rsvp_date", label: "RSVP date", kind: "date" },
      { key: "source", label: "Responded via", kind: "select", options: RESPONSE_SOURCE },
      { key: "plus_allowed", label: "Plus-one allowed", kind: "yesno" },
      { key: "plus_name", label: "Plus-one name", kind: "text", max: 120 },
    ],
  },
  {
    title: "Meals & accessibility",
    fields: [
      { key: "meal", label: "Meal", kind: "select", options: ["", ...MEALS] },
      { key: "dietary", label: "Dietary restriction", kind: "text", max: 200 },
      { key: "severe", label: "Severe allergy", kind: "yesno" },
      { key: "allergen", label: "Allergen / risk", kind: "text", max: 200 },
      { key: "accessibility", label: "Accessibility need", kind: "text", max: 200 },
      { key: "mobility", label: "Mobility assistance", kind: "text", max: 200 },
      { key: "sensory", label: "Hearing / vision / sensory", kind: "text", max: 200 },
      { key: "service_animal", label: "Service animal", kind: "yesno" },
      { key: "highchair", label: "Highchair", kind: "yesno" },
    ],
  },
  {
    title: "Seating",
    fields: [{ key: "table_id", label: "Table", kind: "table" }],
  },
  {
    title: "Travel & hotel",
    fields: [
      { key: "arrival", label: "Arrival date", kind: "date" },
      { key: "flight", label: "Carrier / flight", kind: "text", max: 120 },
      { key: "departure", label: "Departure date", kind: "date" },
      { key: "hotel", label: "Hotel status", kind: "select", options: HOTEL },
      { key: "property", label: "Hotel / property", kind: "text", max: 200 },
      { key: "room", label: "Room / confirmation", kind: "text", max: 120 },
      { key: "transport", label: "Transport", kind: "select", options: TRANSPORT },
      { key: "route", label: "Route / pickup", kind: "text", max: 200 },
      { key: "gift", label: "Welcome gift", kind: "text", max: 200 },
      { key: "gift_delivery", label: "Gift delivery", kind: "text", max: 200 },
    ],
  },
  {
    title: "Follow-up",
    fields: [
      { key: "follow", label: "Follow-up status", kind: "select", options: FOLLOW_STATUS },
      { key: "last_outreach", label: "Last outreach", kind: "date" },
      { key: "method", label: "Method", kind: "text", max: 80 },
    ],
  },
  {
    title: "After the wedding",
    fields: [
      { key: "gift_received", label: "Gift received", kind: "text", max: 300 },
      { key: "thank_you", label: "Thank-you sent", kind: "yesno" },
      { key: "notes", label: "Notes", kind: "textarea", max: 2000 },
    ],
  },
];

export const GUEST_FIELDS = GUEST_FIELD_GROUPS.flatMap((group) => group.fields);

export const HOUSEHOLD_FIELDS: FieldDef[] = [
  { key: "name", label: "Formal household name", kind: "text", required: true, max: 200 },
  { key: "contact", label: "Primary contact", kind: "text", max: 120 },
  { key: "email", label: "Email", kind: "email", max: 200 },
  { key: "mobile", label: "Mobile", kind: "text", max: 40 },
  { key: "address", label: "Street address", kind: "text", max: 300 },
  { key: "city", label: "City", kind: "text", max: 120 },
  { key: "state", label: "State", kind: "text", max: 60 },
  { key: "postal", label: "Postal code", kind: "text", max: 20 },
  { key: "country", label: "Country", kind: "text", max: 80 },
  { key: "invitation", label: "Invitation", kind: "select", options: INVITATION },
];

export const TABLE_FIELDS: FieldDef[] = [
  { key: "name", label: "Table name / number", kind: "text", required: true, max: 80 },
  { key: "zone", label: "Zone", kind: "text", max: 80 },
  { key: "type", label: "Type", kind: "select", options: TABLE_TYPES },
  { key: "capacity", label: "Capacity", kind: "number" },
  { key: "vip", label: "VIP table", kind: "yesno" },
  { key: "notes", label: "Notes", kind: "text", max: 300 },
];

export const FIELDS_BY_KIND: Record<RecordKind, FieldDef[]> = {
  guest: [...GUEST_FIELDS, { key: "events", label: "Events", kind: "text" }],
  household: HOUSEHOLD_FIELDS,
  table: TABLE_FIELDS,
};

export type GuestData = Record<string, string | boolean | number | Record<string, boolean>>;

export type GuestRecord = {
  id: string;
  kind: RecordKind;
  data: GuestData;
  position: number;
  created_at: string;
};

export type GuestSettings = {
  setup: Record<string, string>;
  events: string[];
  counts_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  exceptions: { at: string; by: string; guest: string; field: string; from: string; to: string }[];
};

export const EMPTY_SETTINGS: GuestSettings = {
  setup: {},
  events: ["Ceremony", "Cocktail Hour", "Reception"],
  counts_locked: false,
  locked_at: null,
  locked_by: null,
  exceptions: [],
};

/** A new guest's starting values. */
export function blankGuest(): GuestData {
  return {
    first: "", last: "", household_id: "", side: "Client A", type: "Adult", vip: false, relationship: "", email: "", mobile: "",
    invitation: "Not Sent", rsvp: "Invited", rsvp_date: "", source: "Entered by Studio", plus_allowed: false, plus_name: "",
    meal: "", dietary: "", severe: false, allergen: "", accessibility: "", mobility: "", sensory: "", service_animal: false, highchair: false,
    table_id: "", events: {}, arrival: "", flight: "", departure: "", hotel: "Not Required", property: "", room: "",
    transport: "Not Required", route: "", gift: "", gift_delivery: "", follow: "No Follow-Up", last_outreach: "", method: "",
    gift_received: "", thank_you: false, notes: "",
  };
}

export function blankRecord(kind: RecordKind): GuestData {
  if (kind === "guest") return blankGuest();
  if (kind === "household") return { name: "", contact: "", email: "", mobile: "", address: "", city: "", state: "", postal: "", country: "", invitation: "Not Sent" };
  return { name: "", zone: "", type: "Round", capacity: 10, vip: false, notes: "" };
}

export const text = (data: GuestData, key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
export const yes = (data: GuestData, key: string) => data[key] === true;

export function guestName(guest: GuestRecord) {
  return `${text(guest.data, "first")} ${text(guest.data, "last")}`.trim() || "(unnamed)";
}

export const isAttending = (guest: GuestRecord) => text(guest.data, "rsvp") === "Attending";

/** Fields whose change after the lock is logged as an exception. */
export const LOCKED_FIELDS = ["rsvp", "meal", "table_id", "severe", "allergen", "dietary", "highchair"];

export type GuestView = "guests" | "followup" | "meals" | "events" | "travel" | "seating" | "households" | "handoff";

export const GUEST_VIEWS: { id: GuestView; label: string; hint: string }[] = [
  { id: "guests", label: "Guests", hint: "The one list. Every other view is drawn from these records, so update here first." },
  { id: "followup", label: "RSVP follow-up", hint: "Guests still owed an answer, and the chase history." },
  { id: "meals", label: "Meals & access", hint: "Attending guests only: meals, allergies, and access needs for service planning." },
  { id: "events", label: "Events", hint: "Who is coming to which event, for multi-day celebrations. Tap to tick." },
  { id: "travel", label: "Travel & hotels", hint: "Arrivals, rooms, transport, and welcome gifts for guests who need them." },
  { id: "seating", label: "Seating", hint: "Tables with live capacity. Seats are assigned on each guest." },
  { id: "households", label: "Households", hint: "Mailing addresses. Invitations go per household; counts run per person." },
  { id: "handoff", label: "Caterer handoff", hint: "Attending guests only, only what service needs. This, never the full list, is what leaves the studio." },
];

export function viewFilter(view: GuestView): (guest: GuestRecord) => boolean {
  switch (view) {
    case "followup":
      return (guest) => text(guest.data, "rsvp") === "Awaiting Response" || ["Follow-Up Needed", "Contacted"].includes(text(guest.data, "follow"));
    case "meals":
    case "handoff":
      return isAttending;
    case "travel":
      return (guest) => text(guest.data, "hotel") !== "Not Required" || ["Needs Shuttle", "VIP Vehicle"].includes(text(guest.data, "transport")) || Boolean(text(guest.data, "arrival"));
    default:
      return () => true;
  }
}

export type GuestCounts = { label: string; value: number; warn: boolean }[];

/** The exception-led dashboard from the workbook. */
export function guestCounts(guests: GuestRecord[]): GuestCounts {
  const attending = guests.filter(isAttending);
  const count = (list: GuestRecord[], test: (guest: GuestRecord) => boolean) => list.filter(test).length;
  const severe = count(attending, (guest) => yes(guest.data, "severe"));
  const noMeal = count(attending, (guest) => !text(guest.data, "meal"));
  const noSeat = count(attending, (guest) => !text(guest.data, "table_id"));
  return [
    { label: "Guests", value: guests.length, warn: false },
    { label: "Attending", value: attending.length, warn: false },
    { label: "Awaiting response", value: count(guests, (guest) => text(guest.data, "rsvp") === "Awaiting Response"), warn: false },
    { label: "Declined", value: count(guests, (guest) => text(guest.data, "rsvp") === "Declined"), warn: false },
    { label: "Children attending", value: count(attending, (guest) => ["Child", "Infant"].includes(text(guest.data, "type"))), warn: false },
    { label: "Severe allergies", value: severe, warn: severe > 0 },
    { label: "Attending, no meal", value: noMeal, warn: noMeal > 0 },
    { label: "Attending, no seat", value: noSeat, warn: noSeat > 0 },
    { label: "Hotel pending", value: count(guests, (guest) => ["Pending", "Requested"].includes(text(guest.data, "hotel"))), warn: false },
    { label: "Needs shuttle", value: count(guests, (guest) => text(guest.data, "transport") === "Needs Shuttle"), warn: false },
    { label: "Follow-ups open", value: count(guests, (guest) => ["Follow-Up Needed", "Contacted"].includes(text(guest.data, "follow"))), warn: false },
    { label: "Highchairs", value: count(attending, (guest) => yes(guest.data, "highchair")), warn: false },
  ];
}

/** The caterer handoff as CSV: attending only, service fields only. */
export function handoffCsv(guests: GuestRecord[], tables: GuestRecord[]) {
  const tableName = new Map(tables.map((table) => [table.id, text(table.data, "name")]));
  // A leading = + - @ would run as a formula when the caterer opens the file.
  const cell = (raw: string) => {
    const value = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };
  const header = ["First", "Last", "Meal", "Dietary", "Severe allergy", "Allergen / risk", "Accessibility", "Highchair", "Table"];
  const rows = guests.filter(isAttending).map((guest) => [
    text(guest.data, "first"),
    text(guest.data, "last"),
    text(guest.data, "meal"),
    text(guest.data, "dietary"),
    yes(guest.data, "severe") ? "Yes" : "No",
    text(guest.data, "allergen"),
    text(guest.data, "accessibility"),
    yes(guest.data, "highchair") ? "Yes" : "No",
    tableName.get(text(guest.data, "table_id")) ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\n");
}
