import { after, NextResponse } from "next/server";
import { canSeeInquiries, getAdminUser } from "@/lib/admin-auth";
import { applyLeadActivity, applySalesUpdate, deleteLead, getCapiLead, logCapiEvent, markLeadUnread } from "@/lib/admin-data";
import { CAPI_EVENTS, capiEvent, sendCapiEvent, type CapiTrigger } from "@/lib/meta-ads";
import { LOST_REASONS, SALES_ACTIONS, type SalesAction } from "@/lib/sales-stage";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/admin-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function authorizedUser() {
  return getAdminUser();
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await authorizedUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Your account does not have access to inquiries." }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: unknown };
    const status = typeof body.status === "string" ? body.status : "";
    if (!LEAD_STATUSES.includes(status as LeadStatus)) {
      return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
    }
    return NextResponse.json(await applyLeadActivity(id, user, "status_changed", status));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save that change." }, { status: 400 });
  }
}

// Step 7b: tell Meta about real sales progress. Runs after the response, so a
// Meta problem can never slow down or fail the planner's click.
async function reportToMeta(leadId: string, trigger: CapiTrigger, value: number | null) {
  try {
    const lead = await getCapiLead(leadId);
    if (!lead) return;
    const event = capiEvent(trigger, lead, value);
    const sent = await sendCapiEvent(event);
    if (sent.skipped) return;
    await logCapiEvent({ event_id: event.event_id, lead_id: leadId, event_name: event.event_name, value: trigger === "booked" ? value : null, ok: sent.ok, response: sent.body });
    if (!sent.ok) console.error("Meta Conversions API rejected an event:", event.event_name);
  } catch {
    console.error("Meta Conversions API send failed.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await authorizedUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Your account does not have access to inquiries." }, { status: 403 });

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as { body?: unknown; action?: unknown; sales?: unknown };
    if (payload.action === "view") return NextResponse.json(await applyLeadActivity(id, user, "viewed"));
    if (payload.action === "sales") {
      const sales = (payload.sales && typeof payload.sales === "object" ? payload.sales : {}) as Record<string, unknown>;
      if (!SALES_ACTIONS.includes(sales.action as SalesAction)) return NextResponse.json({ error: "Choose a valid action." }, { status: 400 });
      const amount = typeof sales.amount === "number" && Number.isFinite(sales.amount) ? sales.amount : null;
      const reason = typeof sales.reason === "string" && sales.reason in LOST_REASONS ? sales.reason : null;
      const note = typeof sales.note === "string" ? sales.note.slice(0, 500) : null;
      const result = await applySalesUpdate(id, user, { action: sales.action as SalesAction, amount, reason, note });
      if (Object.hasOwn(CAPI_EVENTS, sales.action as string)) after(() => reportToMeta(id, sales.action as CapiTrigger, Number(result.lead.booked_amount) || null));
      return NextResponse.json(result);
    }
    if (payload.action === "mark_unread") return NextResponse.json(await markLeadUnread(id, user));
    if (payload.action !== undefined) return NextResponse.json({ error: "Choose a valid action." }, { status: 400 });
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Write a note first." }, { status: 400 });
    if (body.length > 4000) return NextResponse.json({ error: "That note is a little too long." }, { status: 400 });
    return NextResponse.json(await applyLeadActivity(id, user, "note_added", body));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save that note." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await authorizedUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Your account does not have access to inquiries." }, { status: 403 });

  try {
    const { id } = await context.params;
    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete that inquiry." }, { status: 400 });
  }
}

