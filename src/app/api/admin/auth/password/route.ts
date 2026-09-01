import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  getAdminUser,
  sessionCookieOptions,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function textValue(value: unknown) { return typeof value === "string" ? value : ""; }

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

async function updateWithServiceRole(userEmail: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return false;
  const usersResponse = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }, cache: "no-store",
  });
  const users = await usersResponse.json().catch(() => null) as { users?: Array<{ id?: string; email?: string }> } | null;
  const id = users?.users?.find((item) => item.email?.toLowerCase() === userEmail.toLowerCase())?.id;
  if (!id) return false;
  const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }), cache: "no-store",
  });
  return response.ok;
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = await request.json() as { currentPassword?: unknown; newPassword?: unknown };
    const currentPassword = textValue(body.currentPassword);
    const newPassword = textValue(body.newPassword);
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "Enter your current password and a new password." }, { status: 400 });
    if (newPassword.length < 12) return NextResponse.json({ error: "Use a new password with at least 12 characters." }, { status: 400 });
    if (currentPassword === newPassword) return NextResponse.json({ error: "Your new password must be different." }, { status: 400 });

    const config = supabaseConfig();
    if (!config) return NextResponse.json({ error: "Password changes are not configured yet." }, { status: 500 });
    if (process.env.NODE_ENV === "development") {
      const updated = await updateWithServiceRole(user.email, newPassword);
      if (!updated) return NextResponse.json({ error: "Your password could not be changed." }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    const tokenResponse = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: currentPassword }), cache: "no-store",
    });
    const tokenResult = await tokenResponse.json().catch(() => null) as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown } | null;
    if (!tokenResponse.ok || typeof tokenResult?.access_token !== "string" || typeof tokenResult.refresh_token !== "string") return NextResponse.json({ error: "Your current password is not correct." }, { status: 400 });

    const updateResponse = await fetch(`${config.url}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: config.anonKey, Authorization: `Bearer ${tokenResult.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }), cache: "no-store",
    });
    if (!updateResponse.ok) return NextResponse.json({ error: "Your new password could not be saved." }, { status: 400 });

    const response = NextResponse.json({ success: true });
    const expiresIn = typeof tokenResult.expires_in === "number" ? tokenResult.expires_in : 3600;
    response.cookies.set(ADMIN_ACCESS_COOKIE, tokenResult.access_token, sessionCookieOptions(expiresIn));
    response.cookies.set(ADMIN_REFRESH_COOKIE, tokenResult.refresh_token, sessionCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    return NextResponse.json({ error: "Your password could not be changed." }, { status: 400 });
  }
}
