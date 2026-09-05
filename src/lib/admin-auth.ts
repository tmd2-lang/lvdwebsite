import { cookies } from "next/headers";
import type { AdminRole, AdminUser } from "@/lib/admin-types";

export const ADMIN_ACCESS_COOKIE = "lvd_admin_access";
export const ADMIN_REFRESH_COOKIE = "lvd_admin_refresh";

type SupabaseAuthUser = {
  id?: unknown;
  email?: unknown;
  user_metadata?: {
    full_name?: unknown;
    name?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    display_name?: unknown;
    role?: unknown;
    avatar_url?: unknown;
  } | null;
};

type SupabaseAdminUser = SupabaseAuthUser & {
  id: string;
  email: string;
};

function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

function emailList(variable: string | undefined) {
  return (variable || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/** Planners work inside the client portal; all other approved admins are owners. */
export function roleForEmail(email: string): AdminRole {
  const planners = emailList(process.env.SUPABASE_PLANNER_EMAILS);
  return planners.includes(email.trim().toLowerCase()) ? "planner" : "owner";
}

export function canSeeInquiries(user: AdminUser) {
  return user.role === "owner" || user.role === "planner";
}

/** Where each role lands after signing in. */
export function homePathForRole(role: AdminRole) {
  return role === "planner" ? "/admin/portal" : "/admin";
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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function profileFromUser(user: SupabaseAuthUser, fallbackEmail = "") : AdminUser | null {
  const id = cleanText(user.id);
  const email = cleanText(user.email || fallbackEmail).toLowerCase();
  if (!id || !email) return null;

  const metadata = user.user_metadata || {};
  const firstName = cleanText(metadata.first_name);
  const lastName = cleanText(metadata.last_name);
  const displayName = cleanText(metadata.display_name)
    || [firstName, lastName].filter(Boolean).join(" ")
    || cleanText(metadata.full_name)
    || cleanText(metadata.name)
    || email.split("@")[0].replace(/[._-]+/g, " ");

  return {
    id,
    email,
    name: displayName,
    firstName,
    lastName,
    displayName,
    role: roleForEmail(email),
    avatarUrl: cleanText(metadata.avatar_url) || null,
  };
}

function supabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

async function supabaseAdminFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const config = supabaseAdminConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Supabase admin auth request failed:", await response.text().catch(() => ""));
    return null;
  }

  return response.json() as Promise<T>;
}

async function findSupabaseUserByEmail(email: string) {
  const payload = await supabaseAdminFetch<{ users?: SupabaseAdminUser[] }>(
    "/auth/v1/admin/users?page=1&per_page=1000",
  );
  return payload?.users?.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function getSupabaseUserById(id: string) {
  return supabaseAdminFetch<SupabaseAdminUser>(`/auth/v1/admin/users/${encodeURIComponent(id)}`);
}

function localAdminEmail() {
  return (process.env.SUPABASE_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)[0] || "tjdozier98@gmail.com";
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
    const adminUser = profileFromUser(user);
    if (!adminUser || !isApprovedAdmin(adminUser.email)) return null;
    return adminUser;
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const tokenUser = await verifyAdminToken(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
  if (tokenUser) return tokenUser;

  if (process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_BYPASS === "true") {
    const localUser = await findSupabaseUserByEmail(localAdminEmail());
    const localAdmin = localUser ? profileFromUser(localUser) : null;
    if (localAdmin) return localAdmin;

    return {
      id: "local-dev",
      email: localAdminEmail(),
      name: "TJ (Local Dev)",
      firstName: "TJ",
      lastName: "",
      displayName: "TJ (Local Dev)",
      role: roleForEmail(localAdminEmail()),
      avatarUrl: null,
    };
  }

  return null;
}

export async function updateAdminProfile(
  user: AdminUser,
  profile: { firstName: string; lastName: string; displayName: string; avatarUrl: string | null },
) {
  const authUser = user.id === "local-dev"
    ? await findSupabaseUserByEmail(user.email)
    : await getSupabaseUserById(user.id);
  if (!authUser) throw new Error("Your Supabase account could not be found.");

  const metadata = {
    ...(authUser.user_metadata || {}),
    first_name: profile.firstName,
    last_name: profile.lastName,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl || null,
  };
  const updatedUser = await supabaseAdminFetch<SupabaseAdminUser>(
    `/auth/v1/admin/users/${encodeURIComponent(authUser.id)}`,
    { method: "PUT", body: JSON.stringify({ user_metadata: metadata }) },
  );
  const updatedProfile = updatedUser ? profileFromUser(updatedUser) : null;
  if (!updatedProfile) throw new Error("Your profile could not be saved.");
  return updatedProfile;
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
