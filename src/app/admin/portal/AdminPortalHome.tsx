import Link from "next/link";
import type { AdminUser } from "@/lib/admin-types";
import styles from "./portal-admin.module.css";

function firstName(user: AdminUser) {
  const source = user.firstName || user.displayName || user.name || user.email.split("@")[0];
  return source.replace(/\s*\([^)]*\)\s*/g, " ").trim().split(/\s+/)[0] || "Admin";
}

export default function AdminPortalHome({ user, clientCount }: { user: AdminUser; clientCount: number }) {
  const hasClients = clientCount > 0;

  return (
    <main className={styles.content}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Studio planning portal</p>
          <h1>Good afternoon, {firstName(user)}.</h1>
          <p>Create client records and manage every private planning portal from one place.</p>
        </div>
        <Link className={styles.newClientAction} href="/admin/portal/clients/new">
          <span aria-hidden="true">＋</span> New client
        </Link>
      </header>

      <section className={styles.clientSnapshot} aria-label="Client portal total">
        <strong>{clientCount}</strong>
        <div>
          <h2>Active client {clientCount === 1 ? "portal" : "portals"}</h2>
          <p>{hasClients ? "Open the client list to manage their workspace." : "Your first client will appear here once you create them."}</p>
        </div>
      </section>

      <section className={styles.clientPanel} aria-labelledby="client-management-heading">
        <div>
          <p className={styles.eyebrow}>Client management</p>
          <h2 id="client-management-heading">{hasClients ? "Your client roster" : "No clients yet"}</h2>
          <p>{hasClients ? "Open an existing record or add another client." : "Create a client record, choose their package, then invite them into their private portal."}</p>
        </div>
        <div className={styles.clientPanelActions}>
          <Link href="/admin/portal/clients">View clients <span aria-hidden="true">→</span></Link>
          {!hasClients && <Link href="/admin/portal/clients/new">Create your first client</Link>}
        </div>
      </section>
    </main>
  );
}
