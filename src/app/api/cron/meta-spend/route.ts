import { NextResponse } from "next/server";
import { runMetaSpendSync } from "@/lib/meta-spend-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called every morning by the Vercel cron in vercel.json. Vercel sends
// "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    return NextResponse.json(await runMetaSpendSync());
  } catch (error) {
    console.error("Meta spend sync failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Meta spend sync failed." }, { status: 502 });
  }
}
