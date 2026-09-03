import { type ClientTask, type TaskOwner } from "@/lib/task-view";

export { TASK_OWNERS, isTaskOwner } from "@/lib/task-view";
export type { ClientTask, TaskOwner } from "@/lib/task-view";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Task lists are not configured.");
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
    // A missing table on a fresh install just means the schema file has not
    // been run yet. Say so plainly rather than logging an empty object.
    const code = (payload as { code?: string } | null)?.code;
    if (code === "PGRST205") {
      throw new Error("Task lists are not set up yet. Run supabase/tasks-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Task request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

export async function getTasksForClient(clientId: string): Promise<ClientTask[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_tasks?select=*&client_id=eq.${encodeURIComponent(clientId)}&order=position.asc,created_at.asc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientTask[]>(response, "Could not load the task list.");
}

export async function createTask(input: {
  clientId: string;
  title: string;
  note?: string;
  dueOn?: string | null;
  owner: TaskOwner;
  createdBy?: string;
}): Promise<ClientTask> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_tasks`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({
      client_id: input.clientId,
      title: input.title.trim(),
      note: input.note?.trim() || null,
      due_on: input.dueOn || null,
      owner: input.owner,
      created_by: input.createdBy || null,
    }),
    cache: "no-store",
  });
  const rows = await responseJson<ClientTask[]>(response, "Could not add that task.");
  if (!rows[0]) throw new Error("Could not add that task.");
  return rows[0];
}

export async function updateTask(
  taskId: string,
  changes: { title?: string; note?: string | null; dueOn?: string | null; owner?: TaskOwner },
): Promise<void> {
  const { url } = databaseConfig();
  const body: Record<string, unknown> = {};
  if (changes.title !== undefined) body.title = changes.title.trim();
  if (changes.note !== undefined) body.note = changes.note?.trim() || null;
  if (changes.dueOn !== undefined) body.due_on = changes.dueOn || null;
  if (changes.owner !== undefined) body.owner = changes.owner;
  if (Object.keys(body).length === 0) return;

  const response = await fetch(`${url}/rest/v1/client_tasks?id=eq.${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: databaseHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not update that task.");
}

/**
 * Ticks a task off or puts it back. `by` is recorded so each side can see who
 * marked it, which matters when the couple and the studio share a list.
 */
export async function setTaskDone(taskId: string, done: boolean, by: string): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_tasks?id=eq.${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: databaseHeaders(),
    body: JSON.stringify(
      done
        ? { completed_at: new Date().toISOString(), completed_by: by }
        : { completed_at: null, completed_by: null },
    ),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not update that task.");
}

/**
 * Tasks are cheap to retype, unlike a signed contract or a photograph, so this
 * is a real delete rather than the recoverable kind used for files.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_tasks?id=eq.${encodeURIComponent(taskId)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not remove that task.");
}

/** One task, but only if it belongs to the celebration given. */
export async function getTaskForClient(taskId: string, clientId: string): Promise<ClientTask | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_tasks?select=*&id=eq.${encodeURIComponent(taskId)}&client_id=eq.${encodeURIComponent(clientId)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<ClientTask[]>(response, "Could not load that task.");
  return rows[0] || null;
}
