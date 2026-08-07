import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE, sessionCookieOptions } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const accessToken = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value;

  if (url && anonKey && accessToken) {
    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", sessionCookieOptions(0));
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", sessionCookieOptions(0));
  return response;
}
