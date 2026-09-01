import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import {
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_LABELS,
} from "@/lib/client-types";
import PortalSignOut from "@/components/portal/PortalSignOut";
import styles from "./portal.module.css";

export const dynamic = "force-dynamic";

function daysUntil(eventDate: string | null) {
  if (!eventDate) return null;
  const event = new Date(`${eventDate}T00:00:00Z`).getTime();
  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = Math.round((event - startOfToday) / 86400000);
  return days >= 0 ? days : null;
}

function formatDate(value: string | null) {
  if (!value) return "Date still open";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function PortalPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const { user, client } = session;
  const countdown = daysUntil(client.event_date);

  return (
    <main className={styles.realPortal}>
      <header className={styles.realTopbar}>
        <div className={styles.realBrand}><b>LVD</b><span>Planning Atelier</span></div>
        <PortalSignOut />
      </header>

      <section className={styles.realWelcome}>
        <div>
          <p className={styles.eyebrow}>Client planning portal</p>
          <h1>{user.firstName ? <>Welcome, <em>{user.firstName}.</em></> : <>Welcome <em>back.</em></>}</h1>
          <p>{client.display_name} · {formatDate(client.event_date)}{client.venue ? ` · ${client.venue}` : ""}</p>
        </div>
        {countdown !== null && (
          <div className={styles.countdown}>
            <strong>{countdown}</strong>
            <span>{countdown === 1 ? "day to go" : "days to go"}</span>
          </div>
        )}
      </section>

      <section className={styles.realPackage}>
        <div>
          <p className={styles.eyebrow}>Your package</p>
          <h2>{PLANNING_PACKAGE_LABELS[client.planning_package]}</h2>
          {client.design_tier && <p>with {DESIGN_TIER_LABELS[client.design_tier]}</p>}
        </div>
        {client.location && <div className={styles.realVenue}><span>Where</span><strong>{client.venue || "Venue to be confirmed"}</strong><small>{client.location}</small></div>}
      </section>

      <section className={styles.realPending}>
        <p className={styles.eyebrow}>Coming next</p>
        <h2>Your invoices, documents, and plan are on their way.</h2>
        <p>
          This is your private space. As the studio adds invoices, contracts, and planning
          materials for {client.display_name}, they will appear here.
        </p>
      </section>
    </main>
  );
}
