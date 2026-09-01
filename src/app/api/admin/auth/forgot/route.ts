import { NextResponse } from "next/server";
import { isApprovedAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const genericResponse = NextResponse.json({ message: "If that email belongs to the studio, a reset link is on its way." });

  try {
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !url || !anonKey || !isApprovedAdmin(email)) return genericResponse;

    const redirectTo = `${new URL(request.url).origin}/admin/update-password`;
    const response = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    if (!response.ok) console.error("Supabase password reset request failed:", await response.text().catch(() => ""));
    return genericResponse;
  } catch {
    return genericResponse;
  }
}
