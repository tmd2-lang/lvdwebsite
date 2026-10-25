import "server-only";
import { signedImageUrl } from "@/lib/image-data";
import type { MoodboardVersion, MoodboardDesign, MoodboardApproval } from "@/lib/moodboard-view";
function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Moodboards are not configured.");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}
export class MoodboardConflict extends Error {}
export async function moodboardRequest<T>(path: string, body?: unknown, prefer?: string): Promise<T> {
  const { url, headers } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) }, cache: "no-store", ...(body === undefined ? {} : { method: "POST", body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (data?.code === "40001") throw new MoodboardConflict(data.message);
    if (["PGRST205", "PGRST202", "42P01"].includes(data?.code)) throw new Error("Moodboards need setup. Run supabase/moodboard-schema.sql in Supabase.");
    throw new Error("The moodboard could not be saved or loaded. Refresh and try again.");
  }
  return data as T;
}
type Row = Omit<MoodboardVersion, "images" | "approvals"> & { images: { id: string; name: string; storage_path: string }[]; approvals: MoodboardApproval[] };
export async function getMoodboards(clientId: string): Promise<MoodboardVersion[]> {
  const rows: Row[] = [];
  for (let offset = 0;; offset += 100) {
    const page = await moodboardRequest<Row[]>(`client_moodboard_versions?select=id,version,title,design,images,change_summary,created_at,approvals:client_moodboard_approvals(approved_name,approved_at)&client_id=eq.${encodeURIComponent(clientId)}&order=version.desc&limit=100&offset=${offset}`);
    rows.push(...page); if (page.length < 100) break;
  }
  return Promise.all(rows.map(async (row) => ({ ...row, images: await Promise.all(row.images.map(async (image) => ({ id: image.id, name: image.name, url: await signedImageUrl(image.storage_path) }))) })));
}
export async function publishMoodboard(clientId: string, input: { title: string; summary: string; images: string[]; design: MoodboardDesign; expected: string | null }, by: string) {
  return moodboardRequest<string>("rpc/publish_client_moodboard", { p_client: clientId, p_expected: input.expected, p_title: input.title, p_summary: input.summary, p_images: input.images, p_design: input.design, p_by: by });
}
export async function approveMoodboard(clientId: string, revision: string, userId: string, name: string) {
  return moodboardRequest("rpc/approve_client_moodboard", { p_client: clientId, p_revision: revision, p_user: userId, p_name: name });
}
export async function getMoodboardProduction(clientId: string) {
  const rows = await moodboardRequest<{ note: string }[]>(`client_moodboard_production?select=note&client_id=eq.${encodeURIComponent(clientId)}`);
  return rows[0]?.note ?? "";
}
