import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClientById, inviteClientMember, removeClientMember } from "@/lib/client-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELATIONSHIPS = new Set(["client", "partner", "family", "guest"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  // Planners invite clients too — this is portal work, not inquiry work.
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { id } = await context.params;
    const client = await getClientById(id);
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    const body = (await request.json()) as { email?: unknown; relationship?: unknown; name?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const relationship = typeof body.relationship === "string" ? body.relationship : "client";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!RELATIONSHIPS.has(relationship)) {
      return NextResponse.json({ error: "Choose how they relate to this celebration." }, { status: 400 });
    }

    // Invitations land where they can choose a password, not on a sign-in form
    // they have no password for yet.
    const redirectTo = `${new URL(request.url).origin}/portal/welcome`;
    const { alreadyHadAccount } = await inviteClientMember(client.id, email, relationship, redirectTo, name, client.display_name);

    return NextResponse.json({
      ok: true,
      alreadyHadAccount,
      message: alreadyHadAccount
        ? `${email} already had an account, so they were added to this celebration without a new invitation.`
        : `Invitation sent to ${email}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send that invitation.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Revokes one person's access to this celebration. */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { id } = await context.params;
    const memberId = new URL(request.url).searchParams.get("memberId") || "";
    if (!memberId) return NextResponse.json({ error: "Which person?" }, { status: 400 });

    // Scoped to this celebration, so an id from another one matches nothing.
    await removeClientMember(id, memberId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove their access.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
