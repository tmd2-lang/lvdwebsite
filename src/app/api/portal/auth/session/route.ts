import { NextResponse } from "next/server";
import {
  PORTAL_ACCESS_COOKIE,
  PORTAL_REFRESH_COOKIE,
  getClientForUser,
  portalCookieOptions,
  verifyPortalToken,
} from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Turns a Supabase token from an invite or reset link into a portal session.
 *
 * The token arrives from the browser, so it is verified against Supabase here
 * before anything is trusted, exactly as a password sign-in would be.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: unknown; refreshToken?: unknown };
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : "";

    if (!accessToken) {
      return NextResponse.json({ error: "That link is missing or has expired." }, { status: 400 });
    }

    const user = await verifyPortalToken(accessToken);
    if (!user) {
      return NextResponse.json({ error: "That link is no longer valid. Ask the studio for a new one." }, { status: 401 });
    }

    const client = await getClientForUser(user.id);
    if (!client) {
      return NextResponse.json(
        { error: "This account isn’t connected to a celebration yet. Reach out to the studio." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(PORTAL_ACCESS_COOKIE, accessToken, portalCookieOptions(3600));
    if (refreshToken) {
      response.cookies.set(PORTAL_REFRESH_COOKIE, refreshToken, portalCookieOptions(60 * 60 * 24 * 30));
    }
    return response;
  } catch {
    return NextResponse.json({ error: "We couldn’t open your portal. Please try again." }, { status: 400 });
  }
}
