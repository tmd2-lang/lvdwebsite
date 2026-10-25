import type { ChecklistItemRow, ChecklistStatus } from "@/lib/checklist-view";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("The planning checklist is not configured.");
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
      throw new Error("The planning checklist is not set up yet. Run supabase/checklist-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Checklist request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

export async function getChecklistRows(clientId: string): Promise<ChecklistItemRow[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_checklist_items?select=task_id,status,owner,due_on,notes,updated_at,updated_by&client_id=eq.${encodeURIComponent(clientId)}`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ChecklistItemRow[]>(response, "Could not load the planning checklist.");
}

/**
 * Saves one task for one client. The first change to a task creates its row;
 * later changes update it. Fields left undefined are not touched.
 */
export async function saveChecklistItem(input: {
  clientId: string;
  taskId: string;
  status?: ChecklistStatus;
  owner?: string | null;
  dueOn?: string | null;
  notes?: string | null;
  by: string;
}): Promise<ChecklistItemRow> {
  const { url } = databaseConfig();
  const body: Record<string, unknown> = {
    client_id: input.clientId,
    task_id: input.taskId,
    updated_by: input.by,
  };
  if (input.status !== undefined) body.status = input.status;
  if (input.owner !== undefined) body.owner = input.owner;
  if (input.dueOn !== undefined) body.due_on = input.dueOn;
  if (input.notes !== undefined) body.notes = input.notes?.trim() || null;

  const response = await fetch(`${url}/rest/v1/client_checklist_items?on_conflict=client_id,task_id`, {
    method: "POST",
    headers: databaseHeaders("resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const rows = await responseJson<ChecklistItemRow[]>(response, "Could not save that task.");
  if (!rows[0]) throw new Error("Could not save that task.");
  return rows[0];
}
