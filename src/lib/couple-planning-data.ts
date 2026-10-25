import "server-only";
import { getChecklistRows } from "@/lib/checklist-data";
import { buildChecklist, effectiveDue, type ChecklistItem } from "@/lib/checklist-view";
import { getTimeline } from "@/lib/timeline-data";
import { byStartTime, isClientVisible, type TimelineDoc } from "@/lib/timeline-view";
import type { PortalClient } from "@/lib/client-types";
import type { CoupleChecklistItem, CoupleTimeline } from "@/lib/couple-planning-view";

// Explicit client design decisions. Approval flags on recipes/rigging/production
// in the source workbook must never accidentally publish those internal tasks.
const CLIENT_DESIGN_DECISIONS = new Set(["LVD-021", "LVD-027", "LVD-028", "LVD-040", "LVD-049", "LVD-050", "LVD-101", "LVD-102", "LVD-118"]);

export function projectCoupleChecklist(items: ChecklistItem[]): CoupleChecklistItem[] {
  return items.filter((item) => item.status !== "not_applicable"
    && (item.assignedOwner === "Client" || item.approval === "Yes")
    && (item.track !== "Design & Floral" || CLIENT_DESIGN_DECISIONS.has(item.id)))
    .map((item) => ({
      id: item.id, phase: item.phase, title: item.task, status: item.status,
      dueOn: effectiveDue(item), suggested: !item.dueOn && Boolean(item.suggestedDue),
      kind: item.assignedOwner === "Client" ? "your_task" : "approval",
    }));
}
export async function getCoupleChecklist(client: PortalClient) {
  return projectCoupleChecklist(buildChecklist(client, await getChecklistRows(client.id)));
}

export function projectCoupleTimeline(doc: TimelineDoc | null, eventDate: string | null): CoupleTimeline | null {
  if (!doc?.confirmed_at || !doc.cues.length) return null;
  const ready = (status: string) => ["Confirmed", "Complete", "Canceled"].includes(status);
  if (doc.cues.some((cue) => !ready(cue.status)) || doc.production.some((block) => !ready(block.status))) return null;
  return {
    version: doc.version, confirmedAt: doc.confirmed_at, eventDate,
    cues: byStartTime(doc.cues.filter((cue) => isClientVisible(cue) && cue.status !== "Canceled"))
      .map((cue) => ({ ref: cue.ref, start: cue.start, end: cue.end, activity: cue.activity, location: cue.location, phase: cue.phase })),
  };
}
export async function getCoupleTimeline(client: PortalClient) {
  // Never publish the unsaved starter template when no confirmed row exists.
  return projectCoupleTimeline(await getTimeline(client.id), client.event_date);
}
