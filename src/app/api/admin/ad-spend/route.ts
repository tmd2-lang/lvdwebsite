import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { saveAdSpend } from "@/lib/admin-data";
import { canSeeMarketing } from "@/lib/marketing-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 6: the marketing account types in spend per Meta ad. null clears it.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canSeeMarketing(user)) return NextResponse.json({ error: "Marketing access required." }, { status: 403 });
  try {
    const body = (await request.json()) as { adId?: unknown; spend?: unknown };
    const adId = typeof body.adId === "string" && /^\d{5,30}$/.test(body.adId) ? body.adId : "";
    const spend = body.spend === null ? null : typeof body.spend === "number" && Number.isFinite(body.spend) && body.spend >= 0 && body.spend <= 10_000_000 ? Math.round(body.spend * 100) / 100 : undefined;
    if (!adId || spend === undefined) return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    await saveAdSpend(adId, spend, user);
    return NextResponse.json({ adId, spend });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save spend." }, { status: 400 });
  }
}
