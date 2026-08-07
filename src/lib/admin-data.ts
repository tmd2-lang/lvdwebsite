import type { AdminLead, LeadNote, LeadStatus } from "@/lib/admin-types";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Inquiry storage is not configured.");
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

async function responseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Admin database request failed:", payload);
    throw new Error("Could not update the inquiry right now.");
  }
  return payload as T;
}

export async function getAdminLeads(): Promise<AdminLead[]> {
  const { url } = databaseConfig();
  const leadFields = [
    "id", "created_at", "updated_at", "source", "status", "name", "email", "phone",
    "celebration_type", "event_date", "date_undecided", "venue", "guest_count", "services",
    "vision", "investment", "referral_source", "quiz_score", "quiz_result_tier",
  ].join(",");

  const [leadsResponse, notesResponse] = await Promise.all([
    fetch(`${url}/rest/v1/leads?select=${leadFields}&order=created_at.desc`, {
      headers: databaseHeaders(),
      cache: "no-store",
    }),
    fetch(`${url}/rest/v1/lead_notes?select=id,lead_id,created_at,author_name,body&order=created_at.desc`, {
      headers: databaseHeaders(),
      cache: "no-store",
    }),
  ]);

  const leads = await responseJson<Omit<AdminLead, "notes">[]>(leadsResponse);
  const notes = await responseJson<LeadNote[]>(notesResponse);
  const notesByLead = new Map<string, LeadNote[]>();

  notes.forEach((note) => {
    const current = notesByLead.get(note.lead_id) || [];
    current.push(note);
    notesByLead.set(note.lead_id, current);
  });

  return leads.map((lead) => ({
    ...lead,
    services: Array.isArray(lead.services) ? lead.services : [],
    notes: notesByLead.get(lead.id) || [],
  }));
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
  const rows = await responseJson<Array<{ id: string; status: LeadStatus; updated_at: string }>>(response);
  if (!rows[0]) throw new Error("That inquiry could not be found.");
  return rows[0];
}

export async function addLeadNote(id: string, body: string, authorName: string) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/lead_notes`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({ lead_id: id, body, author_name: authorName }),
    cache: "no-store",
  });
  const rows = await responseJson<LeadNote[]>(response);
  if (!rows[0]) throw new Error("That note could not be saved.");
  return rows[0];
}
