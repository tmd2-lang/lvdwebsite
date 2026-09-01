import { NextResponse } from "next/server";
import { canSeeInquiries, getAdminUser } from "@/lib/admin-auth";
import { deleteLeads } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Your account does not have access to inquiries." }, { status: 403 });

  try {
    const body = await request.json() as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? [...new Set(body.ids.filter((id): id is string => typeof id === "string" && UUID_PATTERN.test(id)))]
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Select at least one inquiry." }, { status: 400 });
    }
    if (ids.length > 100) {
      return NextResponse.json({ error: "Delete up to 100 inquiries at a time." }, { status: 400 });
    }

    await deleteLeads(ids);
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete those inquiries." }, { status: 400 });
  }
}
