import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  isApprovedAdmin,
  sessionCookieOptions,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  user?: { email?: unknown };
};

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Sign in is not ready yet." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const result = (await authResponse.json().catch(() => null)) as LoginResponse | null;
    const userEmail = typeof result?.user?.email === "string" ? result.user.email.toLowerCase() : "";

    if (!authResponse.ok || typeof result?.access_token !== "string" || typeof result.refresh_token !== "string") {
      return NextResponse.json({ error: "That email or password doesn’t look right." }, { status: 401 });
    }
    if (!isApprovedAdmin(userEmail)) {
      return NextResponse.json({ error: "This account doesn’t have access to the studio." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    const expiresIn = typeof result.expires_in === "number" ? result.expires_in : 3600;
    response.cookies.set(ADMIN_ACCESS_COOKIE, result.access_token, sessionCookieOptions(expiresIn));
    response.cookies.set(ADMIN_REFRESH_COOKIE, result.refresh_token, sessionCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    return NextResponse.json({ error: "We couldn’t sign you in. Please try again." }, { status: 400 });
  }
}
