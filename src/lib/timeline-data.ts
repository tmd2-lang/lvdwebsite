import type { TimelineDoc } from "@/lib/timeline-view";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Event timelines are not configured.");
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
    const code = (payload as { code?: string } | null)?.code;
    if (code === "PGRST205") {
      throw new Error("Event timelines are not set up yet. Run supabase/timeline-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Timeline request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

const COLUMNS = "version,overview,cues,production,vendors,crew,updated_at,updated_by";

/** The saved timeline, or null if nobody has edited this client's yet. */
export async function getTimeline(clientId: string): Promise<TimelineDoc | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_timelines?select=${COLUMNS}&client_id=eq.${encodeURIComponent(clientId)}`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<TimelineDoc[]>(response, "Could not load the timeline.");
  return rows[0] ?? null;
}

export class TimelineConflictError extends Error {}

/**
 * Writes the whole timeline. `expectedUpdatedAt` is the version the editor
 * started from: if someone else saved in between, nothing is written and the
 * caller is told to reload, rather than one person's work quietly replacing
 * the other's.
 */
export async function saveTimeline(
  clientId: string,
  doc: Omit<TimelineDoc, "updated_at" | "updated_by">,
  expectedUpdatedAt: string | null,
  by: string,
): Promise<TimelineDoc> {
  const { url } = databaseConfig();
  const body = JSON.stringify({ ...doc, updated_by: by });

  if (expectedUpdatedAt === null) {
    const response = await fetch(`${url}/rest/v1/client_timelines?select=${COLUMNS}`, {
      method: "POST",
      headers: databaseHeaders("return=representation"),
      body: JSON.stringify({ client_id: clientId, ...doc, updated_by: by }),
      cache: "no-store",
    });
    if (response.status === 409) throw new TimelineConflictError("Someone else started this timeline a moment ago. Reload to see their changes.");
    const rows = await responseJson<TimelineDoc[]>(response, "Could not save the timeline.");
    return rows[0];
  }

  const response = await fetch(
    `${url}/rest/v1/client_timelines?select=${COLUMNS}&client_id=eq.${encodeURIComponent(clientId)}&updated_at=eq.${encodeURIComponent(expectedUpdatedAt)}`,
    { method: "PATCH", headers: databaseHeaders("return=representation"), body, cache: "no-store" },
  );
  const rows = await responseJson<TimelineDoc[]>(response, "Could not save the timeline.");
  if (!rows[0]) throw new TimelineConflictError("Someone else changed this timeline since you opened it. Reload to see their changes, then make yours again.");
  return rows[0];
}

export async function deleteTimeline(clientId: string) {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_timelines?client_id=eq.${encodeURIComponent(clientId)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not reset the timeline.");
}
