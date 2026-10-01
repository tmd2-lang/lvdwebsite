import type { AdminLead, LeadActivity, LeadStatus } from "./admin-types";

export type ViewState = "viewed" | "unviewed" | "unknown" | "unavailable";
export type InquiryFilters = {
  search: string;
  status: "all" | LeadStatus | "not_contacted";
  viewed: "all" | ViewState;
  notes: "all" | "with" | "without";
  sort: "newest" | "oldest" | "event" | "activity";
};
export function latestView(lead: AdminLead): LeadActivity | undefined {
  return lead.activity?.find((item) => item.kind === "viewed");
}
export function viewState(lead: AdminLead): ViewState {
  if (latestView(lead)) return "viewed";
  if (!lead.tracking_started_at) return "unavailable";
  return Date.parse(lead.created_at) < Date.parse(lead.tracking_started_at) ? "unknown" : "unviewed";
}
export function lastActivityAt(lead: AdminLead): string {
  return [lead.created_at, lead.updated_at, ...(lead.activity || []).map((item) => item.created_at), ...lead.notes.map((note) => note.created_at)]
    .reduce((latest, value) => Date.parse(value) > Date.parse(latest) ? value : latest, lead.created_at);
}
export function filterInquiries(leads: AdminLead[], filters: InquiryFilters): AdminLead[] {
  const query = filters.search.trim().toLowerCase();
  return leads.filter((lead) => {
    const haystack = [lead.name, lead.email, lead.phone, lead.venue, lead.celebration_type, lead.event_date,
      ...lead.notes.map((note) => note.body)].filter(Boolean).join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (filters.status === "all" || (filters.status === "not_contacted" ? ["new", "reviewing"].includes(lead.status) : lead.status === filters.status))
      && (filters.viewed === "all" || viewState(lead) === filters.viewed)
      && (filters.notes === "all" || (filters.notes === "with" ? lead.notes.length > 0 : lead.notes.length === 0));
  }).sort((a, b) => {
    let comparison = 0;
    if (filters.sort === "event") {
      const aDate = !a.date_undecided && a.event_date ? Date.parse(a.event_date) : Infinity;
      const bDate = !b.date_undecided && b.event_date ? Date.parse(b.event_date) : Infinity;
      comparison = aDate === bDate ? 0 : aDate < bDate ? -1 : 1;
    } else if (filters.sort === "activity") comparison = Date.parse(lastActivityAt(b)) - Date.parse(lastActivityAt(a));
    else comparison = (Date.parse(b.created_at) - Date.parse(a.created_at)) * (filters.sort === "oldest" ? -1 : 1);
    return comparison || a.id.localeCompare(b.id);
  });
}
