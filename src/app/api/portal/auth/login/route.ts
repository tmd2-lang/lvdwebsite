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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Sign in is not ready yet." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = text(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const tokenResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const tokens = (await tokenResponse.json().catch(() => null)) as {
      access_token?: unknown; refresh_token?: unknown; expires_in?: unknown;
    } | null;

    if (!tokenResponse.ok || typeof tokens?.access_token !== "string" || typeof tokens.refresh_token !== "string") {
      return NextResponse.json({ error: "That email or password doesn’t look right." }, { status: 401 });
    }

    const user = await verifyPortalToken(tokens.access_token);
    if (!user) {
      return NextResponse.json({ error: "That email or password doesn’t look right." }, { status: 401 });
    }

    // Being a valid Supabase account is not enough. Only someone linked to a
    // celebration may enter the portal — this is what keeps studio accounts
    // and stray sign-ups out.
    const client = await getClientForUser(user.id);
    if (!client) {
      return NextResponse.json(
        { error: "This account isn’t connected to a celebration yet. Reach out to the studio and we’ll get you set up." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    const expiresIn = typeof tokens.expires_in === "number" ? tokens.expires_in : 3600;
    response.cookies.set(PORTAL_ACCESS_COOKIE, tokens.access_token, portalCookieOptions(expiresIn));
    response.cookies.set(PORTAL_REFRESH_COOKIE, tokens.refresh_token, portalCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    return NextResponse.json({ error: "We couldn’t sign you in. Please try again." }, { status: 400 });
  }
}
