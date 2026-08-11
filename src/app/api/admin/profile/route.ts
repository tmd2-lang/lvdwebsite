import { NextResponse } from "next/server";
import { getAdminUser, updateAdminProfile } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  return NextResponse.json({ profile: user });
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = await request.json() as {
      firstName?: unknown;
      lastName?: unknown;
      displayName?: unknown;
      avatarUrl?: unknown;
    };
    const firstName = textValue(body.firstName);
    const lastName = textValue(body.lastName);
    const displayName = textValue(body.displayName) || [firstName, lastName].filter(Boolean).join(" ");
    const avatarUrl = textValue(body.avatarUrl);

    if (!firstName || !lastName || !displayName) {
      return NextResponse.json({ error: "First name, last name, and display name are required." }, { status: 400 });
    }
    if (firstName.length > 80 || lastName.length > 80 || displayName.length > 120 || avatarUrl.length > 500) {
      return NextResponse.json({ error: "One of those profile fields is too long." }, { status: 400 });
    }

    const profile = await updateAdminProfile(user, { firstName, lastName, displayName, avatarUrl: avatarUrl || null });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Your profile could not be saved." }, { status: 400 });
  }
}
