import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createClient } from "@/lib/client-data";
import {
  DESIGN_TIER_IDS,
  PLANNING_PACKAGE_IDS,
  type DesignTierId,
  type PlanningPackageId,
} from "@/lib/client-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  // Owners and planners both create clients. Only inquiries are owner-only.
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = await request.json() as Record<string, unknown>;

    const partnerOneName = text(body.partnerOneName);
    if (!partnerOneName) {
      return NextResponse.json({ error: "Enter at least one name for this celebration." }, { status: 400 });
    }

    const planningPackage = text(body.planningPackage) as PlanningPackageId;
    if (!PLANNING_PACKAGE_IDS.includes(planningPackage)) {
      return NextResponse.json({ error: "Choose a planning package." }, { status: 400 });
    }

    const designTierValue = text(body.designTier);
    if (designTierValue && !DESIGN_TIER_IDS.includes(designTierValue as DesignTierId)) {
      return NextResponse.json({ error: "That design tier is not recognised." }, { status: 400 });
    }

    const eventDate = text(body.eventDate);
    if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json({ error: "Enter the event date as a calendar date." }, { status: 400 });
    }

    const client = await createClient({
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
      notes: text(body.notes),
    });

    return NextResponse.json({ client });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this client.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
