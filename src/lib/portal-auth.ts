import { cookies } from "next/headers";
import type { PortalClient } from "@/lib/client-types";

/**
 * Client sessions are deliberately separate from the studio's.
 * Different cookies, different checks: signing into one grants nothing
 * in the other.
 */
export const PORTAL_ACCESS_COOKIE = "lvd_portal_access";
export const PORTAL_REFRESH_COOKIE = "lvd_portal_refresh";

export type PortalUser = {
  id: string;
  email: string;
  firstName: string;
  displayName: string;
};

function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

function serviceConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

export function portalCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type SupabaseUser = {
  id?: unknown;
  email?: unknown;
  user_metadata?: { full_name?: unknown; first_name?: unknown; display_name?: unknown } | null;
};

function profileFromUser(user: SupabaseUser): PortalUser | null {
  const id = text(user.id);
  const email = text(user.email).toLowerCase();
  if (!id || !email) return null;

  const metadata = user.user_metadata || {};
  const firstName = text(metadata.first_name);
  const displayName = text(metadata.display_name)
    || text(metadata.full_name)
    || firstName
    || email.split("@")[0].replace(/[._+-]+/g, " ");

  return { id, email, firstName: firstName || displayName.split(" ")[0], displayName };
}

export async function verifyPortalToken(token: string | undefined): Promise<PortalUser | null> {
  const config = authConfig();
  if (!config || !token) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return profileFromUser((await response.json()) as SupabaseUser);
  } catch {
    return null;
  }
}

export async function getPortalUser(): Promise<PortalUser | null> {
  const cookieStore = await cookies();
  return verifyPortalToken(cookieStore.get(PORTAL_ACCESS_COOKIE)?.value);
}

export async function hasPortalRefreshToken() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(PORTAL_REFRESH_COOKIE)?.value);
}

/**
 * The celebration this sign-in is allowed to see, or null.
 *
 * This is the check that keeps one client out of another's portal: access
 * comes from a client_users row, never from the URL or anything the browser
 * sends. Every portal page must go through here.
 */
export async function getClientForUser(userId: string): Promise<PortalClient | null> {
  const config = serviceConfig();
  if (!config) return null;

  const response = await fetch(
    `${config.url}/rest/v1/client_users?select=clients(*)&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    {
      headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Portal client lookup failed:", await response.text().catch(() => ""));
    return null;
  }

  const rows = (await response.json().catch(() => null)) as { clients?: PortalClient | null }[] | null;
  return rows?.[0]?.clients || null;
}

/** The signed-in client and their celebration, or null if either is missing. */
export async function getPortalSession() {
  const user = await getPortalUser();
  if (!user) return null;

  const client = await getClientForUser(user.id);
  if (!client) return null;

  return { user, client };
}

export function safePortalReturnPath(value: string | null) {
  return value && value.startsWith("/portal") && !value.startsWith("//") && !value.startsWith("/portal/demo")
    ? value
    : "/portal";
}
