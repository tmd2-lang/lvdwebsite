export const DESIGN_FIELDS = { palette: "Color palette", furniture: "Furniture & inventory", florals: "Floral selections", price: "Design price & scope" } as const;
export type MoodboardDesign = Record<keyof typeof DESIGN_FIELDS, string>;
export type MoodboardApproval = { approved_name: string; approved_at: string };
export type MoodboardVersion = {
  id: string; version: number; title: string; design: MoodboardDesign; change_summary: string; created_at: string;
  images: { id: string; name: string; url: string | null }[];
  approvals: MoodboardApproval[];
};
export const isMoodboardApprover = (relationship: string) => relationship === "client" || relationship === "partner";
export const MOODBOARD_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function moodboardInput(raw: Record<string, unknown>) {
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  if (!title || title.length > 160 || !summary || summary.length > 2000) throw new Error("Enter a title and a summary of this design version.");
  const images = raw.images;
  if (!Array.isArray(images) || images.length < 1 || images.length > 40 || images.some((id) => typeof id !== "string" || !MOODBOARD_UUID.test(id)) || new Set(images).size !== images.length) throw new Error("Choose 1 to 40 Design images.");
  const source = raw.design as Record<string, unknown> | null;
  const design = {} as MoodboardDesign;
  for (const field of Object.keys(DESIGN_FIELDS) as (keyof MoodboardDesign)[]) {
    if (typeof source?.[field] !== "string" || source[field].length > 4000) throw new Error("Enter valid design details (up to 4,000 characters each).");
    design[field] = source[field].trim();
  }
  const expected = raw.expected === null ? null : typeof raw.expected === "string" && MOODBOARD_UUID.test(raw.expected) ? raw.expected : undefined;
  if (expected === undefined) throw new Error("Refresh the moodboard before submitting.");
  return { title, summary, images: images as string[], design, expected };
}
