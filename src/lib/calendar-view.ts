/** Studio calendar projection. No separate dates or alerts are stored. */
import { buildChecklist, effectiveDue, isOpen, CHECKLIST_STATUS_LABELS, type ChecklistItemRow, type ChecklistTrack } from "@/lib/checklist-view";
import { BUDGET_SIDE_LABELS, PAYMENT_TYPE_LABELS, paymentBalance, type BudgetLine, type BudgetPayment } from "@/lib/budget-view";
import type { PortalClient } from "@/lib/client-types";

export type CalendarClient = Pick<PortalClient, "id" | "display_name" | "event_date" | "booked_on" | "design_tier" | "status">;
export type CalendarChecklistRow = Pick<ChecklistItemRow, "task_id" | "status" | "owner" | "due_on"> & { client_id: string };
export type CalendarLine = Pick<BudgetLine, "id" | "client_id" | "side" | "vendor" | "description" | "status">;
export type CalendarPayment = Pick<BudgetPayment, "id" | "client_id" | "line_id" | "payment_type" | "payer" | "due_on" | "amount_cents" | "paid_cents" | "manual_status">;
export type CalendarEntry = {
  id: string;
  clientId: string;
  clientName: string;
  kind: "wedding" | "task" | "payment";
  title: string;
  date: string | null;
  track: ChecklistTrack | "Shared / Other";
  owner: string;
  status: string;
  suggested: boolean;
  waitingApproval: boolean;
  /** Disputed payments stay visible, but do not trigger automatic overdue alerts. */
  disputed: boolean;
  balanceCents: number | null;
  href: string;
};
export type CalendarData = { clients: CalendarClient[]; entries: CalendarEntry[]; warnings: string[] };
export type CalendarFilters = { client: string; track: string; owner: string; kind: string; search: string };
export type CalendarFocus = "schedule" | "overdue" | "week" | "approvals";
export const EMPTY_CALENDAR_FILTERS: CalendarFilters = { client: "", track: "", owner: "", kind: "", search: "" };
export const CALENDAR_KIND_LABELS = { wedding: "Wedding", task: "Checklist", payment: "Payment" };

/** Studio dates use New York's calendar day, independent of server/browser timezone. */
export function studioToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function shiftCalendarDay(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function shiftCalendarMonth(month: string, amount: number) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}
export function calendarDays(month: string) {
  const first = `${month}-01`;
  const next = `${shiftCalendarMonth(month, 1)}-01`;
  const offset = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const count = Math.ceil((offset + Number(shiftCalendarDay(next, -1).slice(8))) / 7) * 7;
  const start = shiftCalendarDay(first, -offset);
  return Array.from({ length: count }, (_, i) => shiftCalendarDay(start, i));
}
export function formatCalendarDate(date: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}
export function calendarMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
export function sortCalendarEntries(entries: CalendarEntry[]) {
  return [...entries].sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || a.clientName.localeCompare(b.clientName) || a.title.localeCompare(b.title));
}

export function buildCalendarEntries(
  clients: CalendarClient[],
  /** null means unavailable: do not manufacture open tasks from a failed load. */
  checklist: CalendarChecklistRow[] | null,
  lines: CalendarLine[],
  payments: CalendarPayment[],
): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  const activeClients = clients.filter((c) => c.status !== "archived");
  const clientMap = new Map(activeClients.map((c) => [c.id, c]));
  const rowsByClient = new Map<string, CalendarChecklistRow[]>();
  for (const row of checklist ?? []) {
    const rows = rowsByClient.get(row.client_id) ?? [];
    rows.push(row);
    rowsByClient.set(row.client_id, rows);
  }
  for (const client of activeClients) {
    const base = { clientId: client.id, clientName: client.display_name };
    const path = `/admin/portal/clients/${encodeURIComponent(client.id)}`;
    if (client.event_date) entries.push({
      ...base, id: `wedding:${client.id}`, kind: "wedding", title: "Wedding day", date: client.event_date,
      track: "Shared / Other", owner: "", status: "Wedding", suggested: false, waitingApproval: false,
      disputed: false, balanceCents: null, href: path,
    });
    if (checklist === null) continue;
    const saved: ChecklistItemRow[] = (rowsByClient.get(client.id) ?? []).map((r) => ({ ...r, notes: null, updated_at: "", updated_by: null }));
    for (const task of buildChecklist(client, saved).filter(isOpen)) {
      entries.push({
        ...base, id: `task:${client.id}:${task.id}`, kind: "task", title: `${task.id} · ${task.task}`,
        date: effectiveDue(task), track: task.track, owner: task.assignedOwner,
        status: CHECKLIST_STATUS_LABELS[task.status], suggested: !task.dueOn && Boolean(task.suggestedDue),
        waitingApproval: task.approval === "Yes" && task.status === "waiting_client",
        disputed: false, balanceCents: null, href: `${path}?tab=checklist`,
      });
    }
  }
  const lineMap = new Map(lines.map((l) => [l.id, l]));
  for (const payment of payments) {
    const client = clientMap.get(payment.client_id);
    const line = lineMap.get(payment.line_id);
    const balance = paymentBalance(payment as BudgetPayment);
    if (!client || !line || line.client_id !== client.id || line.status === "canceled" || payment.manual_status === "waived" || balance <= 0) continue;
    entries.push({
      id: `payment:${payment.id}`, clientId: client.id, clientName: client.display_name, kind: "payment",
      title: `${PAYMENT_TYPE_LABELS[payment.payment_type]} · ${line.vendor || line.description || BUDGET_SIDE_LABELS[line.side]}`,
      date: payment.due_on, track: line.side === "lvd_planning" ? "Planning Core" : line.side === "lvd_design" ? "Design & Floral" : "Shared / Other",
      // A payer is not a task owner. Leave unassigned until team ownership exists.
      owner: "", status: payment.manual_status === "disputed" ? "Disputed" : BUDGET_SIDE_LABELS[line.side],
      suggested: false, waitingApproval: false, disputed: payment.manual_status === "disputed", balanceCents: balance,
      href: `/admin/portal/clients/${encodeURIComponent(client.id)}?tab=budget`,
    });
  }
  return sortCalendarEntries(entries);
}

export function filterCalendarEntries(entries: CalendarEntry[], filters: CalendarFilters) {
  const search = filters.search.trim().toLowerCase();
  return entries.filter((e) => (!filters.client || e.clientId === filters.client)
    && (!filters.track || e.track === filters.track)
    && (!filters.owner || (filters.owner === "unassigned" ? !e.owner : e.owner === filters.owner))
    && (!filters.kind || e.kind === filters.kind)
    && (!search || `${e.clientName} ${e.title} ${e.owner} ${e.status}`.toLowerCase().includes(search)));
}
export function isCalendarOverdue(entry: CalendarEntry, today: string) {
  return entry.kind !== "wedding" && !entry.disputed && Boolean(entry.date && entry.date < today);
}
export function isCalendarDueThisWeek(entry: CalendarEntry, today: string) {
  const day = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const sunday = shiftCalendarDay(today, 6 - day);
  return !entry.disputed && Boolean(entry.date && entry.date >= today && entry.date <= sunday);
}
export function calendarFocusEntries(entries: CalendarEntry[], focus: CalendarFocus, today: string) {
  if (focus === "overdue") return entries.filter((e) => isCalendarOverdue(e, today));
  if (focus === "week") return entries.filter((e) => isCalendarDueThisWeek(e, today));
  if (focus === "approvals") return entries.filter((e) => e.waitingApproval);
  return entries;
}
