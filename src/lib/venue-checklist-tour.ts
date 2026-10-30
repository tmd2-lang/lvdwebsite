import { CHECKLIST_SECTIONS } from "./venue-checklist-questions";

/**
 * A couple's progress on the phone checklist: one entry per venue they tour.
 * Shared by the browser (which edits it) and the server (which saves it on the lead).
 */

export type Mark = "slash" | "check" | "na";
export type Verdict = "clear" | "follow" | "deal";
export type VenueProgress = {
  id: string;
  name: string;
  email: string;
  marks: Record<string, Mark>;
  answers: Record<string, { answer: string; who: string }>;
  verdicts: Record<string, Verdict>;
  notes: string;
};
export type TourState = { venues: VenueProgress[]; updatedAt: string };

export const MAX_VENUES = 6;
const MARKS = new Set<string>(["slash", "check", "na"]);
const VERDICTS = new Set<string>(["clear", "follow", "deal"]);
const QUESTION_IDS = new Set(CHECKLIST_SECTIONS.flatMap((section) => section.questions.map((q) => q.id)));
const SECTION_IDS = new Set(CHECKLIST_SECTIONS.map((section) => section.id));

export function newVenue(name = ""): VenueProgress {
  return { id: Math.random().toString(36).slice(2, 10), name, email: "", marks: {}, answers: {}, verdicts: {}, notes: "" };
}

export function emptyTour(): TourState {
  return { venues: [newVenue("Venue 1")], updatedAt: "" };
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
const record = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {});

/** Keeps only known questions, marks and sizes, so a saved tour can never grow without limit. */
export function cleanTour(value: unknown): TourState {
  const input = record(value);
  const venues = (Array.isArray(input.venues) ? input.venues : []).slice(0, MAX_VENUES).map((raw): VenueProgress => {
    const venue = record(raw);
    const marks: VenueProgress["marks"] = {};
    for (const [id, mark] of Object.entries(record(venue.marks))) if (QUESTION_IDS.has(id) && MARKS.has(String(mark))) marks[id] = mark as Mark;
    const answers: VenueProgress["answers"] = {};
    for (const [id, entry] of Object.entries(record(venue.answers))) {
      if (!QUESTION_IDS.has(id)) continue;
      const { answer, who } = record(entry);
      if (answer || who) answers[id] = { answer: text(answer, 500), who: text(who, 120) };
    }
    const verdicts: VenueProgress["verdicts"] = {};
    for (const [id, verdict] of Object.entries(record(venue.verdicts))) if (SECTION_IDS.has(id) && VERDICTS.has(String(verdict))) verdicts[id] = verdict as Verdict;
    return {
      id: text(venue.id, 20) || newVenue().id,
      name: text(venue.name, 80),
      email: text(venue.email, 200),
      marks, answers, verdicts,
      notes: text(venue.notes, 4000),
    };
  });
  return { venues: venues.length ? venues : emptyTour().venues, updatedAt: text(input.updatedAt, 40) };
}
