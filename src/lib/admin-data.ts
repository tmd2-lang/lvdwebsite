import type { AdminLead, LeadNote, LeadStatus, LeadActivity, LeadAppointment } from "@/lib/admin-types";

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

/** Ad attribution is only selected for marketing viewers (see marketing-access.ts). */
export async function getAdminLeads({ includeMarketing = false } = {}): Promise<AdminLead[]> {
  const { url } = databaseConfig();
  const leadFields = [
    "id", "created_at", "updated_at", "source", "status", "name", "email", "phone",
    "celebration_type", "event_date", "date_undecided", "venue", "guest_count", "services",
    "vision", "investment", "referral_source", "quiz_score", "quiz_result_tier", "payload",
    ...(includeMarketing ? ["utm_source", "utm_medium", "utm_campaign", "meta_campaign_id", "meta_adset_id",
      "meta_ad_id", "landing_page", "first_touch_at", "attribution"] : []),
  ].join(",");

  const [leadsResponse, notesResponse, tracking, consultations] = await Promise.all([
    fetch(`${url}/rest/v1/leads?select=${leadFields}&order=created_at.desc`, {
      headers: databaseHeaders(),
      cache: "no-store",
    }),
    fetch(`${url}/rest/v1/lead_notes?select=id,lead_id,created_at,author_name,body&order=created_at.desc`, {
      headers: databaseHeaders(),
      cache: "no-store",
    }),
    getLeadTracking(),
    getLeadAppointments(),
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
    activity: tracking.activity.filter((item) => item.lead_id === lead.id),
    tracking_started_at: tracking.startedAt,
    appointments: consultations.appointments.filter((item) => item.lead_id === lead.id),
    consultation_sync_available: consultations.available,
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


// Older deployments can still manage inquiries before the tracking migration is applied.
export async function getLeadTracking(): Promise<{ startedAt: string | null; activity: LeadActivity[] }> {
  const { url } = databaseConfig();
  const settings = await fetch(`${url}/rest/v1/lead_tracking_settings?select=started_at&id=eq.1`, { headers: databaseHeaders(), cache: "no-store" });
  if (!settings.ok) return { startedAt: null, activity: [] };
  const rows = await settings.json() as Array<{ started_at: string }>;
  if (!rows[0]?.started_at) return { startedAt: null, activity: [] };
  const activity: LeadActivity[] = [];
  // PostgREST caps a response at 1,000 rows; don't silently lose older view history.
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${url}/rest/v1/lead_activity?select=*&order=created_at.desc,id.desc&offset=${offset}&limit=1000`, { headers: databaseHeaders(), cache: "no-store" });
    if (!response.ok) return { startedAt: null, activity: [] };
    const page = await response.json() as LeadActivity[];
    activity.push(...page);
    if (page.length < 1000) break;
  }
  return { startedAt: rows[0].started_at, activity };
}

export async function applyLeadActivity(id: string, actor: { id: string; name: string }, kind: LeadActivity["kind"], detail: string | null = null) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/apply_lead_activity`, {
    method: "POST", headers: databaseHeaders(), cache: "no-store",
    body: JSON.stringify({ p_lead_id: id, p_actor_id: actor.id, p_actor_name: actor.name, p_kind: kind, p_detail: detail }),
  });
  // Only a missing RPC may use the legacy write path. Other errors must surface.
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    if (error?.code === "PGRST202") {
      if (kind === "status_changed") return { lead: await updateLeadStatus(id, detail as LeadStatus), activity: null };
      if (kind === "note_added") return { note: await addLeadNote(id, detail || "", actor.name), activity: null };
      throw new Error("View tracking is not available yet. The database update must be applied first.");
    }
    throw new Error("Could not save that change. Please try again.");
  }
  return await response.json() as { lead?: { id: string; status: LeadStatus; updated_at: string }; note?: LeadNote; activity: LeadActivity | null };
}

// Store a personal unread marker in the existing activity stream; do not erase views.
export async function markLeadUnread(id: string, actor: { id: string; name: string }) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/lead_activity`, {
    method: "POST", headers: databaseHeaders("return=representation"), cache: "no-store",
    body: JSON.stringify({ lead_id: id, actor_id: actor.id, actor_name: actor.name, kind: "viewed", detail: "unread" }),
  });
  const rows = await responseJson<LeadActivity[]>(response);
  if (!rows[0]) throw new Error("Could not mark this inquiry unread.");
  return { activity: rows[0] };
}

export async function getLeadAppointments(): Promise<{ available: boolean; appointments: LeadAppointment[] }> {
  const { url } = databaseConfig();
  const appointments: LeadAppointment[] = [];
  try {
    for (let offset = 0; ; offset += 1000) {
      const response = await fetch(`${url}/rest/v1/lead_appointments?select=id,lead_id,starts_at,ends_at,status,rescheduled,outcome&order=starts_at.desc,id.desc&offset=${offset}&limit=1000`, { headers: databaseHeaders(), cache: "no-store" });
      if (!response.ok) return { available: false, appointments: [] };
      const page = await response.json() as LeadAppointment[];
      appointments.push(...page);
      if (page.length < 1000) break;
    }
    return { available: true, appointments };
  } catch { return { available: false, appointments: [] }; }
}
