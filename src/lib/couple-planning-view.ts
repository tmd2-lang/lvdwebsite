import type { ChecklistStatus } from "@/lib/checklist-view";

/** Only these fields may cross the client rendering boundary. */
export type CoupleChecklistItem = {
  id: string; phase: string; title: string; status: ChecklistStatus;
  dueOn: string | null; suggested: boolean; kind: "your_task" | "approval";
};
export type CoupleTimeline = {
  version: number; confirmedAt: string; eventDate: string | null;
  cues: { ref: string; start: string; end: string; activity: string; location: string; phase: string }[];
};
