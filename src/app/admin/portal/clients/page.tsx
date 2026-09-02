import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClients } from "@/lib/client-data";
import {
  CLIENT_STATUS_LABELS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_LABELS,
} from "@/lib/client-types";
import styles from "../portal-admin.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Date still open";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ClientsPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/portal/clients");
    redirect("/admin/login");
  }

  const clients = await getClients();

  return (
    <main className={styles.formShell}>
      <div className={styles.listHeader}>
        <div>
          <Link className={styles.backLink} href="/admin/portal"><span aria-hidden="true">←</span> Portal overview</Link>
          <p className={styles.eyebrow}>Booked clients</p>
          <h1>{clients.length === 0 ? "No clients yet." : `${clients.length} ${clients.length === 1 ? "celebration" : "celebrations"}.`}</h1>
        </div>
        <Link className={styles.primaryAction} href="/admin/portal/clients/new">Add a client <span aria-hidden="true">→</span></Link>
      </div>

      {clients.length === 0 ? (
        <section className={styles.emptyState}>
          <p>Start with one client record. Everything else in their portal connects back to it.</p>
          <Link href="/admin/portal/clients/new">Create the first client <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <ul className={styles.clientList}>
          {clients.map((client) => (
            <li key={client.id}>
              <Link className={styles.clientRow} href={`/admin/portal/clients/${client.id}`} aria-label={`Open ${client.display_name}`}>
                <div className={styles.clientName}>
                  <strong>{client.display_name}</strong>
                  <small>{formatDate(client.event_date)}{client.venue ? ` · ${client.venue}` : ""}</small>
                </div>
                <span className={styles.clientPackage}>
                  {PLANNING_PACKAGE_LABELS[client.planning_package]}
                  {client.design_tier && <small>{DESIGN_TIER_LABELS[client.design_tier]}</small>}
                </span>
                <span className={styles.clientStatus}>{CLIENT_STATUS_LABELS[client.status]}</span>
                <span className={styles.clientRowArrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
