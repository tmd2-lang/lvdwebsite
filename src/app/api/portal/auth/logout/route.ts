import { NextResponse } from "next/server";
import { PORTAL_ACCESS_COOKIE, PORTAL_REFRESH_COOKIE, portalCookieOptions } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_ACCESS_COOKIE, "", portalCookieOptions(0));
  response.cookies.set(PORTAL_REFRESH_COOKIE, "", portalCookieOptions(0));
  return response;
}
