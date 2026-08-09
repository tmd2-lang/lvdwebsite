import { cookies } from "next/headers";
import type { AdminUser } from "@/lib/admin-types";

export const ADMIN_ACCESS_COOKIE = "lvd_admin_access";
export const ADMIN_REFRESH_COOKIE = "lvd_admin_refresh";

type SupabaseAuthUser = {
  id?: unknown;
  email?: unknown;
  user_metadata?: {
    full_name?: unknown;
    name?: unknown;
  } | null;
};

function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isApprovedAdmin(email: string) {
  const approved = (process.env.SUPABASE_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return approved.length > 0 && approved.includes(email.trim().toLowerCase());
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function verifyAdminToken(token: string | undefined): Promise<AdminUser | null> {
  const config = authConfig();
  if (!config || !token) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const user = (await response.json()) as SupabaseAuthUser;
    const email = typeof user.email === "string" ? user.email.toLowerCase() : "";
    const id = typeof user.id === "string" ? user.id : "";
    if (!id || !email || !isApprovedAdmin(email)) return null;

    const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
    const name = typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : email.split("@")[0].replace(/[._-]+/g, " ");

    return { id, email, name };
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  if (process.env.NODE_ENV === "development") {
    return { id: "local-dev", email: "tjdozier98@gmail.com", name: "TJ (Local Dev)" };
  }
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
}

export async function hasAdminRefreshToken() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(ADMIN_REFRESH_COOKIE)?.value);
}

export function safeAdminReturnPath(value: string | null) {
  return value && value.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}
