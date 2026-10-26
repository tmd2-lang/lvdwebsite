import {
  EMPTY_SETTINGS,
  type GuestData,
  type GuestRecord,
  type GuestSettings,
  type RecordKind,
} from "@/lib/guests-view";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Guest lists are not configured.");
  return { url, serviceRoleKey };
}

function databaseHeaders(prefer?: string) {
  const { serviceRoleKey } = databaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function request<T>(path: string, init: RequestInit & { prefer?: string }, failure: string): Promise<T> {
  const { url } = databaseConfig();
  const { prefer, ...rest } = init;
  const response = await fetch(`${url}/rest/v1/${path}`, { ...rest, headers: databaseHeaders(prefer), cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code = (payload as { code?: string } | null)?.code;
    if (code === "PGRST205") {
      throw new Error("Guest lists are not set up yet. Run supabase/guests-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Guest request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

const id = (value: string) => encodeURIComponent(value);
const RECORD_COLUMNS = "id,kind,data,position,created_at,updated_at,added_by_couple";
const SETTINGS_COLUMNS = "setup,events,counts_locked,locked_at,locked_by,exceptions";

export type ClientGuests = { records: GuestRecord[]; settings: GuestSettings };

export async function getGuests(clientId: string): Promise<ClientGuests> {
  async function allRecords() {
    const records: GuestRecord[] = [];
    for (let offset = 0;; offset += 500) {
      const page = await request<GuestRecord[]>(`client_guest_records?select=${RECORD_COLUMNS}&client_id=eq.${id(clientId)}&order=position.asc,created_at.asc,id.asc&limit=500&offset=${offset}`, {}, "Could not load the guest list.");
      records.push(...page);
      if (page.length < 500) return records;
    }
  }
  const [records, settings] = await Promise.all([
    allRecords(),
    request<GuestSettings[]>(`client_guest_settings?select=${SETTINGS_COLUMNS}&client_id=eq.${id(clientId)}`, {}, "Could not load the guest settings."),
  ]);
  return { records, settings: settings[0] ?? EMPTY_SETTINGS };
}

export async function getRecord(clientId: string, recordId: string): Promise<GuestRecord | null> {
  const rows = await request<GuestRecord[]>(
    `client_guest_records?select=${RECORD_COLUMNS}&id=eq.${id(recordId)}&client_id=eq.${id(clientId)}&limit=1`,
    {},
    "Could not load that record.",
  );
  return rows[0] ?? null;
}

export async function getRecordIds(clientId: string, kind: RecordKind): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let offset = 0;; offset += 500) {
    const rows = await request<{ id: string }[]>(`client_guest_records?select=id&client_id=eq.${id(clientId)}&kind=eq.${kind}&order=id.asc&limit=500&offset=${offset}`, {}, "Could not load the guest list.");
    rows.forEach((row) => ids.add(row.id));
    if (rows.length < 500) return ids;
  }
}

export async function getTableNames(clientId: string): Promise<Map<string, string>> {
  const rows = await request<{ id: string; data: GuestData }[]>(`client_guest_records?select=id,data&client_id=eq.${id(clientId)}&kind=eq.table`, {}, "Could not load the tables.");
  return new Map(rows.map((row) => [row.id, typeof row.data.name === "string" ? row.data.name : "a table"]));
}

export async function createRecord(clientId: string, kind: RecordKind, data: GuestData, by: string): Promise<GuestRecord> {
  const rows = await request<GuestRecord[]>(`client_guest_records?select=${RECORD_COLUMNS}`, {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ client_id: clientId, kind, data, updated_by: by }),
  }, "Could not add that.");
  return rows[0];
}

export async function updateRecord(clientId: string, recordId: string, data: GuestData, by: string): Promise<GuestRecord> {
  const rows = await request<GuestRecord[]>(`client_guest_records?select=${RECORD_COLUMNS}&id=eq.${id(recordId)}&client_id=eq.${id(clientId)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ data, updated_by: by }),
  }, "Could not save that.");
  if (!rows[0]) throw new Error("That record no longer exists. Reload the page.");
  return rows[0];
}

export async function deleteRecord(clientId: string, recordId: string) {
  await request(`client_guest_records?id=eq.${id(recordId)}&client_id=eq.${id(clientId)}`, { method: "DELETE", prefer: "return=minimal" }, "Could not remove that.");
}

/** Guests pointing at a removed household or table are pointed at nothing. */
export async function clearReference(clientId: string, field: "household_id" | "table_id", recordId: string, by: string) {
  const guests = await request<GuestRecord[]>(
    `client_guest_records?select=${RECORD_COLUMNS}&client_id=eq.${id(clientId)}&kind=eq.guest&data->>${field}=eq.${id(recordId)}`,
    {},
    "Could not update the guests.",
  );
  await Promise.all(guests.map((guest) => updateRecord(clientId, guest.id, { ...guest.data, [field]: "" }, by)));
}

export async function saveSettings(clientId: string, patch: Partial<GuestSettings>, by: string): Promise<GuestSettings> {
  const rows = await request<GuestSettings[]>(`client_guest_settings?on_conflict=client_id&select=${SETTINGS_COLUMNS}`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify({ client_id: clientId, ...patch, updated_by: by }),
  }, "Could not save the guest settings.");
  return rows[0];
}

export async function getSettings(clientId: string): Promise<GuestSettings> {
  const rows = await request<GuestSettings[]>(`client_guest_settings?select=${SETTINGS_COLUMNS}&client_id=eq.${id(clientId)}`, {}, "Could not load the guest settings.");
  return rows[0] ?? EMPTY_SETTINGS;
}
