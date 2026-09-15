import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  isApprovedAdmin,
  isApprovedAdminAccount,
  roleFromAppMetadata,
  safeAdminReturnPath,
  sessionCookieOptions,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefreshResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  user?: { email?: unknown; app_metadata?: { role?: unknown } | null };
};

function clearSession(response: NextResponse) {
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", sessionCookieOptions(0));
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", sessionCookieOptions(0));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = safeAdminReturnPath(requestUrl.searchParams.get("next"));
  const loginUrl = new URL("/admin/login", requestUrl.origin);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const refreshToken = (await cookies()).get(ADMIN_REFRESH_COOKIE)?.value;

  if (!url || !anonKey || !refreshToken) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    const result = (await authResponse.json().catch(() => null)) as RefreshResponse | null;
    const email = typeof result?.user?.email === "string" ? result.user.email.toLowerCase() : "";
    const accessToken = typeof result?.access_token === "string" ? result.access_token : "";
    const nextRefreshToken = typeof result?.refresh_token === "string" ? result.refresh_token : "";

    const metadataRole = result?.user ? roleFromAppMetadata(result.user) : null;
    const hasValidSession = authResponse.ok
      && Boolean(accessToken)
      && Boolean(nextRefreshToken);
    if (!hasValidSession || (!isApprovedAdmin(email, metadataRole) && !await isApprovedAdminAccount(email))) {
      const response = NextResponse.redirect(loginUrl);
      clearSession(response);
      return response;
    }

    const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    const expiresIn = typeof result.expires_in === "number" ? result.expires_in : 3600;
    response.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, sessionCookieOptions(expiresIn));
    response.cookies.set(ADMIN_REFRESH_COOKIE, nextRefreshToken, sessionCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    const response = NextResponse.redirect(loginUrl);
    clearSession(response);
    return response;
  }
}
