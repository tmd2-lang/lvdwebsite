import { NextResponse } from "next/server";
import { canSeeInquiries, getAdminUser } from "@/lib/admin-auth";
import { getLeadAppointments } from "@/lib/admin-data";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeInquiries(user)) return NextResponse.json({ error: "Inquiry access required." }, { status: 403 });
  const data = await getLeadAppointments();
  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
