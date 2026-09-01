import { NextResponse } from "next/server";
import { canSeeInquiries, getAdminUser } from "@/lib/admin-auth";
import { addLeadNote, updateLeadStatus, deleteLead } from "@/lib/admin-data";
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
    return NextResponse.json({ lead: await updateLeadStatus(id, status as LeadStatus) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save that change." }, { status: 400 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await authorizedUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Your account does not have access to inquiries." }, { status: 403 });

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as { body?: unknown };
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Write a note first." }, { status: 400 });
    if (body.length > 4000) return NextResponse.json({ error: "That note is a little too long." }, { status: 400 });
    return NextResponse.json({ note: await addLeadNote(id, body, user.name) });
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

