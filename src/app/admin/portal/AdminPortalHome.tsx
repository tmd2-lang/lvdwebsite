"use client";

import Link from "next/link";
import type { AdminUser } from "@/lib/admin-types";
import styles from "./portal-admin.module.css";

const portalModules = [
  { number: "01", label: "Clients", value: "0", detail: "No client records yet" },
  { number: "02", label: "Invoices", value: "$0", detail: "No payments collected" },
  { number: "03", label: "Documents", value: "0", detail: "The file vault is empty" },
  { number: "04", label: "Images", value: "0", detail: "No galleries created" },
];

function firstName(user: AdminUser) {
  const source = user.firstName || user.displayName || user.name || user.email.split("@")[0];
  return source.replace(/\s*\([^)]*\)\s*/g, " ").trim().split(/\s+/)[0] || "Admin";
}

async function signOut() {
  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
  window.location.assign("/admin/login");
}

export default function AdminPortalHome({ user }: { user: AdminUser }) {
  const isOwner = user.role === "owner";

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin/portal" aria-label="Lady Victoria Designs portal administration">
          <span>LVD</span>
          <b>Portal Studio</b>
        </Link>

        <nav className={styles.portalNav} aria-label="Portal administration">
          <p>Client portal</p>
          <Link className={styles.navActive} href="/admin/portal" aria-current="page"><span>Overview</span><i>01</i></Link>
          <span aria-disabled="true"><b>Clients</b><i>02</i></span>
          <span aria-disabled="true"><b>Invoices</b><i>03</i></span>
          <span aria-disabled="true"><b>Documents</b><i>04</i></span>
          <span aria-disabled="true"><b>Images</b><i>05</i></span>
        </nav>

        <nav className={styles.studioNav} aria-label="Studio administration">
          <p>Studio</p>
          {isOwner && <Link href="/admin">Home</Link>}
          {isOwner && <Link href="/admin/inquiries">Inquiries</Link>}
          <Link href="/admin/profile">Profile</Link>
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>{firstName(user).slice(0, 1).toUpperCase()}</span>
          <div><strong>{user.displayName || user.name}</strong><small>{user.email}</small></div>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link href="/admin/portal"><b>LVD</b><span>Portal Studio</span></Link>
          <nav aria-label="Mobile administration">
            <Link aria-current="page" href="/admin/portal">Portal</Link>
            {isOwner && <Link href="/admin/inquiries">Inquiries</Link>}
            <Link href="/admin/profile">Profile</Link>
          </nav>
        </header>

        <div className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Booked clients</p>
            <h1>Welcome, <em>{firstName(user)}.</em></h1>
            <p>This is where your real client portals will be created and managed.</p>
          </div>
          <div className={styles.topActions}>
            <span className={styles.accessStatus}><i aria-hidden="true" /> {isOwner ? "Owner access" : "Planner access"}</span>
            <Link href="/portal">Preview client portal <span aria-hidden="true">↗</span></Link>
          </div>
        </div>

        <section className={styles.metrics} aria-label="Portal totals">
          <article><span>Active clients</span><strong>0</strong><small>Ready for your first record</small></article>
          <article><span>Open invoices</span><strong>0</strong><small>No balances due</small></article>
          <article><span>Collected</span><strong>$0</strong><small>Payments connect next</small></article>
        </section>

        <div className={styles.mainGrid}>
          <section className={styles.firstRun} id="portal-setup">
            <div className={styles.firstRunHeading}>
              <div><p className={styles.sectionKicker}>First-run setup</p><h2>Your portal is ready for <em>real clients.</em></h2></div>
              <span>0 of 3 complete</span>
            </div>
            <p className={styles.firstRunCopy}>Start with one client record. Their private login, files, invoices, and gallery will all connect back to that record.</p>

            <ol className={styles.setupList}>
              <li className={styles.setupComplete}>
                <span>✓</span>
                <div><strong>Admin identity confirmed</strong><small>{user.email} is approved for private studio access.</small></div>
                <b>Complete</b>
              </li>
              <li>
                <span>2</span>
                <div><strong>Create the first client</strong><small>Add their name, email, event date, and planning package.</small></div>
                <b>Next</b>
              </li>
              <li>
                <span>3</span>
                <div><strong>Connect their portal</strong><small>Upload the first invoice, document, and image collection.</small></div>
                <b>Queued</b>
              </li>
            </ol>

            <div className={styles.setupActions}>
              <span className={styles.primaryPending} aria-disabled="true">Add your first client <small>Database connection next</small></span>
              <Link href="/portal/login">View client sign in <span aria-hidden="true">→</span></Link>
            </div>
          </section>

          <aside className={styles.readiness}>
            <div><p className={styles.sectionKicker}>Launch readiness</p><h2>System status</h2></div>
            <dl>
              <div><dt>Admin account</dt><dd className={styles.ready}>Active</dd></div>
              <div><dt>Client records</dt><dd>Not connected</dd></div>
              <div><dt>Payments</dt><dd>Not connected</dd></div>
              <div><dt>Private files</dt><dd>Not connected</dd></div>
            </dl>
            <p>Nothing here is pretending to be live. Each status will turn active as we connect the real service.</p>
          </aside>
        </div>

        <section className={styles.moduleSection}>
          <div className={styles.sectionTitle}><div><p className={styles.sectionKicker}>Client workspace</p><h2>Everything starts empty.</h2></div><span>Fresh admin view</span></div>
          <div className={styles.moduleGrid}>
            {portalModules.map((module) => (
              <article key={module.label}>
                <span>{module.number}</span>
                <div><p>{module.label}</p><strong>{module.value}</strong><small>{module.detail}</small></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
