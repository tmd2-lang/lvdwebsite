import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PORTAL_ACCESS_COOKIE, getPortalSession } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lets someone change their own name and password.
 *
 * The access token lives in an httpOnly cookie, so the browser cannot make
 * this call to Supabase itself. It goes through here instead, using the token
 * of whoever is signed in — so a person can only ever change their own
 * account, never anybody else's.
 */
export async function PATCH(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "The portal isn’t configured yet." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PORTAL_ACCESS_COOKIE)?.value;
  if (!accessToken) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as { name?: unknown; password?: unknown };
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : undefined;
    const password = typeof body.password === "string" ? body.password : undefined;

    const changes: Record<string, unknown> = {};
    if (name !== undefined) {
      if (!name) return NextResponse.json({ error: "Please tell us what to call you." }, { status: 400 });
      changes.data = { first_name: name, display_name: name };
    }
    if (password !== undefined) {
      if (password.length < 12) {
        return NextResponse.json({ error: "Please use at least 12 characters." }, { status: 400 });
      }
      changes.password = password;
    }
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    }

    const response = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { msg?: string; message?: string } | null;
      const message = detail?.msg || detail?.message || "We couldn’t save that.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn’t save that." }, { status: 400 });
  }
}
