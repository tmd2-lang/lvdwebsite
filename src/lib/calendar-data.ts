import "server-only";
import { getWaveInvoices } from "@/lib/wave-data";
import { waveBudget } from "@/lib/wave-budget";
import { studioToday } from "@/lib/calendar-view";
import { buildCalendarEntries, type CalendarClient, type CalendarChecklistRow, type CalendarData, type CalendarLine, type CalendarPayment } from "@/lib/calendar-view";

/** Read-only projection of existing tables; no new schema or save route needed. */
async function allRows<T>(query: string): Promise<T[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Studio calendar storage is not configured.");
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const response = await fetch(`${url}/rest/v1/${query}&limit=500&offset=${offset}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" }, cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load calendar records.");
    const page = await response.json() as T[];
    rows.push(...page);
    // Content-Range also handles projects configured with a row cap below 500.
    const range = response.headers.get("content-range")?.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (range) {
      const end = Number(range[2]);
      if (end + 1 >= Number(range[3])) break;
      if (!page.length) throw new Error("The calendar could not load every record.");
      offset = end + 1 - 500;
    } else if (page.length < 500) break;
  }
  return rows;
}

/** Call only after canManageClientPortal; all current owners/planners share client access. */
export async function getStudioCalendar(): Promise<CalendarData> {
  const clients = await allRows<CalendarClient>("clients?select=id,display_name,event_date,booked_on,design_tier,status&status=neq.archived&order=id.asc");
  if (!clients.length) return { clients, entries: [], warnings: [] };
  const [checklist, lines, payments, wave] = await Promise.allSettled([
    allRows<CalendarChecklistRow>("client_checklist_items?select=client_id,task_id,status,owner,due_on&order=client_id.asc,task_id.asc"),
    allRows<CalendarLine>("client_budget_lines?select=id,client_id,side,vendor,description,status&order=id.asc"),
    allRows<CalendarPayment>("client_budget_payments?select=id,client_id,line_id,payment_type,payer,due_on,amount_cents,paid_cents,manual_status&order=id.asc"),
    getWaveInvoices(),
  ]);
  const warnings: string[] = [];
  if (checklist.status === "rejected") warnings.push("Checklist deadlines and approval alerts could not be loaded. Refresh to try again; the schedule is incomplete.");
  if (lines.status === "rejected" || payments.status === "rejected") warnings.push("Budget payments could not be loaded. Refresh to try again; payment deadlines and alerts are incomplete.");
  const imported = wave.status === "fulfilled" ? clients.map(client => waveBudget(wave.value.filter(invoice => invoice.client_id === client.id), client.event_date, studioToday())) : [];
  if (wave.status === "rejected") warnings.push("Wave payment deadlines could not be loaded. The schedule is incomplete.");
  return {
    clients,
    entries: buildCalendarEntries(clients, checklist.status === "fulfilled" ? checklist.value : null,
      [...(lines.status === "fulfilled" ? lines.value : []), ...imported.flatMap(budget => budget.lines)],
      [...(payments.status === "fulfilled" ? payments.value.map((p) => ({ ...p, amount_cents: Number(p.amount_cents), paid_cents: Number(p.paid_cents) })) : []), ...imported.flatMap(budget => budget.payments)]),
    warnings,
  };
}
