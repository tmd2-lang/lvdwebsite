import type { NewClientInput, PortalClient } from "@/lib/client-types";
import { coupleDisplayName } from "@/lib/client-types";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Client storage is not configured.");
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

async function responseJson<T>(response: Response, failure: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Client database request failed:", payload);
    throw new Error(failure);
  }
  return payload as T;
}

function trimmedOrNull(value: string | undefined | null) {
  const trimmed = (value || "").trim();
  return trimmed || null;
}

/** Every celebration, soonest event first, undated ones last. */
export async function getClients(): Promise<PortalClient[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=*&status=neq.archived&order=event_date.asc.nullslast,created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<PortalClient[]>(response, "Could not load your clients right now.");
}

export async function getClientById(id: string): Promise<PortalClient | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<PortalClient[]>(response, "Could not load that client.");
  return rows[0] || null;
}

export async function countClients(): Promise<number> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=id&status=neq.archived`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<{ id: string }[]>(response, "Could not count your clients.");
  return rows.length;
}

export async function createClient(input: NewClientInput): Promise<PortalClient> {
  const { url } = databaseConfig();

  const partnerOne = input.partnerOneName.trim();
  if (!partnerOne) throw new Error("Enter at least one name for this celebration.");

  const row = {
    partner_one_name: partnerOne,
    partner_two_name: trimmedOrNull(input.partnerTwoName),
    display_name: coupleDisplayName(partnerOne, input.partnerTwoName),
    email: trimmedOrNull(input.email)?.toLowerCase() || null,
    phone: trimmedOrNull(input.phone),
    event_date: trimmedOrNull(input.eventDate),
    date_undecided: !trimmedOrNull(input.eventDate),
    venue: trimmedOrNull(input.venue),
    location: trimmedOrNull(input.location),
    guest_count: trimmedOrNull(input.guestCount),
    planning_package: input.planningPackage,
    design_tier: input.designTier || null,
    notes: trimmedOrNull(input.notes),
  };

  const response = await fetch(`${url}/rest/v1/clients`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify(row),
    cache: "no-store",
  });

  const rows = await responseJson<PortalClient[]>(response, "Could not save this client.");
  if (!rows[0]) throw new Error("Could not save this client.");
  return rows[0];
}
