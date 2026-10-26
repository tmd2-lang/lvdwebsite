import styles from "../portal.module.css";
import { redirect } from "next/navigation";
import ClientPortalShell from "@/components/portal/ClientPortalShell";
import { getPortalSession } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

function eventLabel(eventDate: string | null) {
  if (!eventDate) return "Date still open";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${eventDate}T00:00:00Z`));
}

function initialsOf(partnerOne: string, partnerTwo: string | null) {
  const first = partnerOne.trim()[0] || "";
  const second = (partnerTwo || "").trim()[0] || "";
  return `${first}${second}`.toUpperCase() || first.toUpperCase() || "LVD";
}

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const { client, user } = session;
  const viewerName = user.displayName || user.firstName || "";
  const venue = [client.venue, client.location].filter(Boolean).join(" · ") || "Venue to be confirmed";

  return (
    <ClientPortalShell
      coupleName={client.display_name}
      eventLabel={eventLabel(client.event_date)}
      venueLabel={venue}
      initials={initialsOf(client.partner_one_name, client.partner_two_name)}
      viewerName={viewerName}
      viewerInitials={viewerName ? viewerName.trim().slice(0, 1).toUpperCase() : ""}
      showMoodboard={Boolean(client.design_tier)}
    >
      {session.memberships.length > 1 && <form className={styles.eventPicker} action="/api/portal/event" method="post"><label htmlFor="portal-event">Your celebration</label><select id="portal-event" name="clientId" defaultValue={client.id}>{session.memberships.map(membership => <option key={membership.client.id} value={membership.client.id}>{membership.client.display_name} · {eventLabel(membership.client.event_date)}</option>)}</select><button type="submit">Open event</button></form>}
      {children}
    </ClientPortalShell>
  );
}
