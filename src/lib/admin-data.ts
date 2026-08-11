import type { AdminLead, LeadNote, LeadStatus } from "@/lib/admin-types";

type StoredAdminLead = Omit<AdminLead, "attachments" | "notes"> & {
  payload: unknown;
};

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

function attachmentUrls(payload: unknown, supabaseUrl: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const attachments = (payload as { attachments?: unknown }).attachments;
  if (!Array.isArray(attachments)) return [];

  let storageOrigin = "";
  try {
    storageOrigin = new URL(supabaseUrl).origin;
  } catch {
    return [];
  }

  const validAttachments = attachments
    .filter((value): value is string => typeof value === "string")
    .filter((value) => {
      try {
        const url = new URL(value);
        return url.origin === storageOrigin
          && url.pathname.startsWith("/storage/v1/object/public/inquiry_attachments/");
      } catch {
        return false;
      }
    });

  return [...new Set(validAttachments)].slice(0, 5);
}

export async function getAdminLeads(): Promise<AdminLead[]> {
  const { url } = databaseConfig();
  const leadFields = [
    "id", "created_at", "updated_at", "source", "status", "name", "email", "phone",
    "celebration_type", "event_date", "date_undecided", "venue", "guest_count", "services",
    "vision", "investment", "referral_source", "quiz_score", "quiz_result_tier", "payload",
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

  const leads = await responseJson<StoredAdminLead[]>(leadsResponse);
  const notes = await responseJson<LeadNote[]>(notesResponse);
  const notesByLead = new Map<string, LeadNote[]>();

  notes.forEach((note) => {
    const current = notesByLead.get(note.lead_id) || [];
    current.push(note);
    notesByLead.set(note.lead_id, current);
  });

  return leads.map(({ payload, ...lead }) => ({
    ...lead,
    services: Array.isArray(lead.services) ? lead.services : [],
    attachments: attachmentUrls(payload, url),
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

export async function deleteLead(id: string) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Failed to delete lead:", errorText);
    throw new Error("Could not delete the inquiry right now.");
  }
}

export async function deleteLeads(ids: string[]) {
  if (ids.length === 0) return;
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/leads?id=in.(${ids.join(",")})`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Failed to delete inquiries:", errorText);
    throw new Error("Could not delete those inquiries right now.");
  }
}
