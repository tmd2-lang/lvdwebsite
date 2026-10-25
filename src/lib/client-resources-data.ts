import "server-only";
import type { ClientPostEvent } from "@/lib/client-resources-view";

export const RESOURCES_SETUP_MESSAGE = "Client resources are not set up yet. Run supabase/client-resources-schema.sql in the Supabase SQL editor.";

async function request<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Client resources are not configured.");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined, cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (["PGRST205", "PGRST202", "42703", "42P01"].includes(payload?.code)) throw new Error(RESOURCES_SETUP_MESSAGE);
    throw new Error("Could not save or load client resources. Please try again.");
  }
  return payload as T;
}

export async function getClientPostEvent(clientId: string): Promise<ClientPostEvent | null> {
  const rows = await request<ClientPostEvent[]>(`client_post_event?select=client_id,photographer_gallery_url,updated_at,updated_by&client_id=eq.${encodeURIComponent(clientId)}&limit=1`);
  return rows[0] ?? null;
}
export async function savePhotographerGallery(clientId: string, url: string | null, by: string) {
  await request("rpc/save_client_photographer_gallery", { p_client_id: clientId, p_url: url, p_by: by });
}
export async function attachStandardDocuments(clientId: string, by: string) {
  await request("rpc/attach_client_standard_documents", { p_client_id: clientId, p_by: by });
}
