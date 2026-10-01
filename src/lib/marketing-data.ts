export const MARKETING_CHANNELS = [
  { id: "reddit", label: "Reddit Ads" },
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "pinterest", label: "Pinterest Ads" },
] as const;

export type MarketingChannel = (typeof MARKETING_CHANNELS)[number]["id"] | "general";

export function isMarketingChannel(value: unknown): value is MarketingChannel {
  return value === "general" || MARKETING_CHANNELS.some((channel) => channel.id === value);
}

export type MarketingTodo = {
  id: string;
  created_at: string;
  title: string;
  channel: MarketingChannel;
  completed_at: string | null;
};

export type MarketingNote = {
  id: string;
  created_at: string;
  channel: MarketingChannel;
  body: string;
};

export type MarketingStat = {
  day: string;
  channel: MarketingChannel;
  body: string;
};

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("The marketing workspace is not configured.");
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
      throw new Error("The marketing workspace is not set up yet. Run supabase/marketing-schema.sql in the Supabase SQL editor.");
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Marketing request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

async function request<T>(path: string, failure: string, init?: RequestInit & { prefer?: string }): Promise<T> {
  const { url } = databaseConfig();
  const { prefer, ...rest } = init || {};
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...rest,
    headers: databaseHeaders(prefer),
    cache: "no-store",
  });
  if (response.status === 204) return undefined as T;
  return responseJson<T>(response, failure);
}

export function getTodos() {
  return request<MarketingTodo[]>(
    "marketing_todos?select=*&order=created_at.desc&limit=500",
    "Could not load the to-dos.",
  );
}

export function getNotes() {
  return request<MarketingNote[]>(
    "marketing_notes?select=*&order=created_at.desc&limit=200",
    "Could not load the notes.",
  );
}

export function getStatsForDay(day: string) {
  return request<MarketingStat[]>(
    `marketing_stats?select=day,channel,body&day=eq.${encodeURIComponent(day)}`,
    "Could not load today's stats.",
  );
}

export async function createTodo(title: string, channel: MarketingChannel) {
  const rows = await request<MarketingTodo[]>("marketing_todos", "Could not add that to-do.", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ title: title.trim(), channel }),
  });
  if (!rows[0]) throw new Error("Could not add that to-do.");
  return rows[0];
}

export async function setTodoDone(id: string, done: boolean) {
  await request(`marketing_todos?id=eq.${encodeURIComponent(id)}`, "Could not update that to-do.", {
    method: "PATCH",
    body: JSON.stringify({ completed_at: done ? new Date().toISOString() : null }),
  });
}

export async function deleteTodo(id: string) {
  await request(`marketing_todos?id=eq.${encodeURIComponent(id)}`, "Could not delete that to-do.", { method: "DELETE" });
}

export async function createNote(body: string, channel: MarketingChannel) {
  const rows = await request<MarketingNote[]>("marketing_notes", "Could not save that note.", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ body: body.trim(), channel }),
  });
  if (!rows[0]) throw new Error("Could not save that note.");
  return rows[0];
}

export async function deleteNote(id: string) {
  await request(`marketing_notes?id=eq.${encodeURIComponent(id)}`, "Could not delete that note.", { method: "DELETE" });
}

export async function saveStat(day: string, channel: MarketingChannel, body: string) {
  await request("marketing_stats?on_conflict=day,channel", "Could not save the stats.", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: JSON.stringify({ day, channel, body, updated_at: new Date().toISOString() }),
  });
}
