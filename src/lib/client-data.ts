import type { NewClientInput, PortalClient, UpdateClientInput } from "@/lib/client-types";
import { coupleDisplayName } from "@/lib/client-types";
import { getDeletedDocumentsForClient, getDocumentsForClient, purgeDocument } from "@/lib/document-data";
import { getDeletedImagesForClient, getImagesForClient, purgeImage } from "@/lib/image-data";
import { inviteMailConfigured, sendInviteEmail } from "@/lib/invite-email";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Client storage is not configured.");
  return { url, serviceRoleKey };
}

function databaseHeaders(prefer?: string) {
  const { serviceRoleKey } = databaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function responseJson<T>(response: Response, failure: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Client database request failed:", payload);
    throw new Error(failure);
  }
  return payload as T;
}

function trimmedOrNull(value: string | undefined | null) {
  const trimmed = (value || "").trim();
  return trimmed || null;
}

/** Every celebration, soonest event first, undated ones last. */
export async function getClients(): Promise<PortalClient[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=*&status=neq.archived&order=event_date.asc.nullslast,created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<PortalClient[]>(response, "Could not load your clients right now.");
}

export async function getClientById(id: string): Promise<PortalClient | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<PortalClient[]>(response, "Could not load that client.");
  return rows[0] || null;
}

export async function countClients(): Promise<number> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/clients?select=id&status=neq.archived`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<{ id: string }[]>(response, "Could not count your clients.");
  return rows.length;
}

export async function createClient(input: NewClientInput): Promise<PortalClient> {
  const { url } = databaseConfig();

  const partnerOne = input.partnerOneName.trim();
  if (!partnerOne) throw new Error("Enter at least one name for this celebration.");

  const row = {
    partner_one_name: partnerOne,
    partner_two_name: trimmedOrNull(input.partnerTwoName),
    display_name: coupleDisplayName(partnerOne, input.partnerTwoName),
    email: trimmedOrNull(input.email)?.toLowerCase() || null,
    phone: trimmedOrNull(input.phone),
    event_date: trimmedOrNull(input.eventDate),
    date_undecided: !trimmedOrNull(input.eventDate),
    venue: trimmedOrNull(input.venue),
    location: trimmedOrNull(input.location),
    guest_count: trimmedOrNull(input.guestCount),
    planning_package: input.planningPackage,
    design_tier: input.designTier || null,
    notes: trimmedOrNull(input.notes),
  };

  const response = await fetch(`${url}/rest/v1/clients`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify(row),
    cache: "no-store",
  });

  const rows = await responseJson<PortalClient[]>(response, "Could not save this client.");
  if (!rows[0]) throw new Error("Could not save this client.");
  return rows[0];
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<PortalClient> {
  const { url } = databaseConfig();
  const partnerOne = input.partnerOneName.trim();
  if (!partnerOne) throw new Error("Enter at least one name for this celebration.");

  const response = await fetch(`${url}/rest/v1/clients?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({
      partner_one_name: partnerOne,
      partner_two_name: trimmedOrNull(input.partnerTwoName),
      display_name: coupleDisplayName(partnerOne, input.partnerTwoName),
      email: trimmedOrNull(input.email)?.toLowerCase() || null,
      phone: trimmedOrNull(input.phone),
      event_date: trimmedOrNull(input.eventDate),
      date_undecided: !trimmedOrNull(input.eventDate),
      venue: trimmedOrNull(input.venue),
      location: trimmedOrNull(input.location),
      guest_count: trimmedOrNull(input.guestCount),
      planning_package: input.planningPackage,
      design_tier: input.designTier || null,
      status: input.status,
      notes: trimmedOrNull(input.notes),
    }),
    cache: "no-store",
  });

  const rows = await responseJson<PortalClient[]>(response, "Could not update this client.");
  if (!rows[0]) throw new Error("Could not update this client.");
  return rows[0];
}

/**
 * Remove one celebration and everything scoped to it.
 *
 * Database relationships cascade invoices, invoice items, document records,
 * and portal memberships. Storage objects live outside Postgres, so those are
 * deliberately removed first. Auth users are kept so an email can be invited
 * to another test or client record later.
 */
export async function deleteClient(id: string): Promise<void> {
  const { url } = databaseConfig();
  // Removed-but-recoverable files still hold storage objects, so both lists
  // have to be purged or the bucket keeps them after the client is gone.
  const [documents, removedDocuments, images, removedImages] = await Promise.all([
    getDocumentsForClient(id),
    getDeletedDocumentsForClient(id).catch(() => []),
    getImagesForClient(id).catch(() => []),
    getDeletedImagesForClient(id).catch(() => []),
  ]);
  for (const document of [...documents, ...removedDocuments]) await purgeDocument(document.id);
  for (const image of [...images, ...removedImages]) await purgeImage(image.id);

  const response = await fetch(`${url}/rest/v1/clients?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not delete this client.");
}

export type ClientMember = {
  id: string;
  created_at: string;
  client_id: string;
  user_id: string;
  relationship: string;
  invited_email: string | null;
  /** What the studio typed on the invitation. */
  invited_name: string | null;
  /** What to actually show: their own name if they have set one, ours if not. */
  display_name: string | null;
};

/**
 * Takes someone's access to a celebration away.
 *
 * Only the link is removed, never the account: the same person may be on
 * another celebration, and keeping the account means they can be invited back
 * without a new sign-up. Access is checked on every portal request, so this
 * takes effect on their next page load even if they are signed in right now.
 */
export async function removeClientMember(clientId: string, memberId: string): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_users?id=eq.${encodeURIComponent(memberId)}&client_id=eq.${encodeURIComponent(clientId)}`,
    { method: "DELETE", headers: databaseHeaders(), cache: "no-store" },
  );
  if (!response.ok) throw new Error("Could not remove their access.");
}

/**
 * Everyone who can sign in to this celebration.
 *
 * The name a person chose for themselves lives on their account, not on this
 * row, so it is merged in here. Theirs wins over the one the studio typed:
 * invite "Sara", she signs in as "Sarah", the list should say Sarah.
 */
export async function getClientMembers(clientId: string): Promise<ClientMember[]> {
  const { url, serviceRoleKey } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_users?select=*&client_id=eq.${encodeURIComponent(clientId)}&order=created_at.asc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<ClientMember[]>(response, "Could not load who has access.");
  if (rows.length === 0) return rows;

  // One lookup for the whole list. The studio has a handful of accounts, so
  // this is cheaper than a request per member.
  const chosenNames = new Map<string, string>();
  try {
    const lookup = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      cache: "no-store",
    });
    const payload = (await lookup.json().catch(() => null)) as {
      users?: Array<{ id?: string; user_metadata?: { first_name?: string; display_name?: string } }>;
    } | null;
    for (const user of payload?.users || []) {
      const chosen = (user.user_metadata?.display_name || user.user_metadata?.first_name || "").trim();
      if (user.id && chosen) chosenNames.set(user.id, chosen);
    }
  } catch {
    // A failed lookup just means we fall back to the invited name.
  }

  return rows.map((row) => ({
    ...row,
    display_name: chosenNames.get(row.user_id) || row.invited_name || null,
  }));
}

/**
 * Invite someone into a celebration.
 *
 * Supabase sends them a link where they choose their own password, so no
 * password is ever emailed or known to the studio. If the address already has
 * an account we reuse it rather than failing.
 */
export async function inviteClientMember(
  clientId: string,
  email: string,
  relationship: string,
  redirectTo: string,
  name = "",
  celebrationName = "your celebration",
): Promise<{ alreadyHadAccount: boolean }> {
  const { url, serviceRoleKey } = databaseConfig();
  const address = email.trim().toLowerCase();
  if (!address) throw new Error("Enter an email address.");
  const invitedName = name.trim().slice(0, 80);

  const adminHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  let userId = "";
  let alreadyHadAccount = false;

  // Two ways to send this. When our own mailbox is configured we mint the link
  // and send a Lady Victoria Designs email; otherwise Supabase sends its own,
  // which works but arrives from "Supabase Auth" on a shared address.
  const sendOurselves = inviteMailConfigured();

  const inviteResponse = sendOurselves
    ? await fetch(`${url}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          type: "invite",
          email: address,
          // redirect_to sits at the top level here, not inside options.
          redirect_to: redirectTo,
          ...(invitedName ? { data: { first_name: invitedName } } : {}),
        }),
        cache: "no-store",
      })
    : await fetch(`${url}/auth/v1/invite?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: "POST",
        headers: adminHeaders,
        // Attached to the new account so the welcome page can offer it back to
        // them already filled in.
        body: JSON.stringify(invitedName ? { email: address, data: { first_name: invitedName } } : { email: address }),
        cache: "no-store",
      });

  if (inviteResponse.ok) {
    const invited = (await inviteResponse.json().catch(() => null)) as
      | { id?: string; user?: { id?: string }; action_link?: string }
      | null;
    userId = invited?.id || invited?.user?.id || "";

    if (sendOurselves && invited?.action_link) {
      try {
        await sendInviteEmail({
          to: address,
          link: invited.action_link,
          celebration: celebrationName,
          recipientName: invitedName || undefined,
        });
      } catch (mailError) {
        // The account exists at this point, so failing here would leave a
        // half-made invitation. Say plainly that the link never went out.
        console.error("Invitation email failed to send:", mailError);
        throw new Error(
          "The account was created but the invitation email could not be sent. Check the mail settings and invite them again.",
        );
      }
    }
  } else {
    // Most likely they already have an account, so look them up instead.
    const lookup = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: adminHeaders, cache: "no-store",
    });
    const payload = (await lookup.json().catch(() => null)) as {
      users?: Array<{ id?: string; email?: string }>;
    } | null;
    const existing = payload?.users?.find((item) => item.email?.toLowerCase() === address);
    if (!existing?.id) {
      console.error("Client invite failed:", await inviteResponse.text().catch(() => ""));
      throw new Error("Could not send that invitation. Please try again.");
    }
    userId = existing.id;
    alreadyHadAccount = true;
  }

  if (!userId) throw new Error("Could not send that invitation. Please try again.");

  const linkResponse = await fetch(`${url}/rest/v1/client_users`, {
    method: "POST",
    headers: { ...adminHeaders, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      client_id: clientId,
      user_id: userId,
      relationship,
      invited_email: address,
      invited_name: invitedName || null,
    }),
    cache: "no-store",
  });

  await responseJson(linkResponse, "Invitation sent, but linking them to this celebration failed.");
  return { alreadyHadAccount };
}
