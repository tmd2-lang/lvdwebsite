import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { deleteClient, getClientById, updateClient } from "@/lib/client-data";
import {
  CLIENT_STATUSES,
  DESIGN_TIER_IDS,
  PLANNING_PACKAGE_IDS,
  type ClientStatus,
  type DesignTierId,
  type PlanningPackageId,
} from "@/lib/client-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { id } = await params;
    if (!await getClientById(id)) return NextResponse.json({ error: "That client could not be found." }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    const partnerOneName = text(body.partnerOneName);
    if (!partnerOneName) return NextResponse.json({ error: "Enter at least one name for this celebration." }, { status: 400 });

    const planningPackage = text(body.planningPackage) as PlanningPackageId;
    if (!PLANNING_PACKAGE_IDS.includes(planningPackage)) return NextResponse.json({ error: "Choose a planning package." }, { status: 400 });
    const designTierValue = text(body.designTier);
    if (designTierValue && !DESIGN_TIER_IDS.includes(designTierValue as DesignTierId)) return NextResponse.json({ error: "That design tier is not recognised." }, { status: 400 });
    const status = text(body.status) as ClientStatus;
    if (!CLIENT_STATUSES.includes(status)) return NextResponse.json({ error: "Choose a valid client status." }, { status: 400 });
    const eventDate = text(body.eventDate);
    if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Enter the event date as a calendar date." }, { status: 400 });

    const client = await updateClient(id, {
      partnerOneName,
      partnerTwoName: text(body.partnerTwoName),
      email: text(body.email),
      phone: text(body.phone),
      eventDate,
      venue: text(body.venue),
      location: text(body.location),
      guestCount: text(body.guestCount),
      planningPackage,
      designTier: (designTierValue as DesignTierId) || null,
      status,
      notes: text(body.notes),
    });

    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update this client." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { id } = await params;
    const client = await getClientById(id);
    if (!client) return NextResponse.json({ error: "That client could not be found." }, { status: 404 });
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    if (text(body.confirmation) !== client.display_name) {
      return NextResponse.json({ error: `Type ${client.display_name} exactly to confirm.` }, { status: 400 });
    }

    await deleteClient(client.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete this client." }, { status: 400 });
  }
}
