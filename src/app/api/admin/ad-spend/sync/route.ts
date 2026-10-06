import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { canSeeMarketing } from "@/lib/marketing-access";
import { runMetaSpendSync } from "@/lib/meta-spend-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "Refresh from Meta" on the Ad report page.
export async function POST() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeMarketing(user)) return NextResponse.json({ error: "Marketing access required." }, { status: 403 });
  try {
    return NextResponse.json(await runMetaSpendSync());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Meta spend sync failed." }, { status: 502 });
  }
}
