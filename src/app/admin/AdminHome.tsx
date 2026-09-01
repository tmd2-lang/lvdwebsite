"use client";

import Link from "next/link";
import type { AdminLead, AdminUser, LeadStatus } from "@/lib/admin-types";
import styles from "./admin-home.module.css";

const NEW_YORK_TIME_ZONE = "America/New_York";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Reached out",
  qualified: "Good fit",
  booked: "Booked",
  archived: "Archived",
  spam: "Not a fit",
};

function dayKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: NEW_YORK_TIME_ZONE,
  }).format(new Date(value));
}

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: NEW_YORK_TIME_ZONE,
  }).format(now));

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(user: AdminUser) {
  const cleanName = user.name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const fallback = user.email.split("@")[0];
  const name = cleanName.split(/\s+/)[0] || fallback;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function relativeTime(value: string, now: Date) {
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 60000));
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: NEW_YORK_TIME_ZONE,
  }).format(new Date(value));
}

function eventSummary(lead: AdminLead) {
  const kind = lead.celebration_type || "Celebration";
  if (lead.date_undecided) return `${kind} · Date still open`;
  if (!lead.event_date) return `${kind} · Date not shared`;
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${lead.event_date}T00:00:00Z`));
  return `${kind} · ${date}`;
}

async function signOut() {
  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
  window.location.assign("/admin/login");
}

export default function AdminHome({
  initialLeads,
  user,
  nowIso,
}: {
  initialLeads: AdminLead[];
  user: AdminUser;
  nowIso: string;
}) {
  const now = new Date(nowIso);
  const today = dayKey(nowIso);
  const todayLeads = initialLeads.filter((lead) => dayKey(lead.created_at) === today);
  const needsAttention = initialLeads.filter((lead) => lead.status === "new");
  const priorityLeads = needsAttention.slice(0, 4);
  const recentLeads = initialLeads.slice(0, 6);

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.monogram}>LVD</p>
          <p className={styles.studioName}>Lady Victoria<br />Designs</p>
        </div>
        <nav aria-label="Studio navigation">
          <Link className={styles.navActive} href="/admin" aria-current="page">Home</Link>
          <Link href="/admin/portal">Client portal</Link>
          <Link href="/admin/inquiries"><span>Inquiries</span>{needsAttention.length > 0 && <b>{needsAttention.length}</b>}</Link>
          <Link href="/admin/profile">Profile</Link>
        </nav>
        <div className={styles.account}>
          <p>{user.name}</p>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link href="/admin"><b>LVD</b><span>Studio</span></Link>
          <nav aria-label="Mobile studio navigation">
            <Link className={styles.mobileActive} href="/admin">Home</Link>
            <Link href="/admin/portal">Portal</Link>
            <Link href="/admin/inquiries">Inquiries</Link>
            <Link href="/admin/profile">Profile</Link>
          </nav>
        </header>

        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Studio overview</p>
            <h1>{greeting(now)}, <em>{firstName(user)}.</em></h1>
            <p>Here’s what needs your attention today.</p>
          </div>
          <div className={styles.today}>
            <span>Today</span>
            <b>{new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: NEW_YORK_TIME_ZONE,
            }).format(now)}</b>
          </div>
        </div>

        <section className={styles.snapshot} aria-label="Studio at a glance">
          <article className={styles.snapshotPrimary}>
            <span>{needsAttention.length}</span>
            <div><h2>Waiting for a reply</h2><p>{needsAttention.length > 0 ? "These celebrations still need a first response." : "Everyone has been taken care of."}</p></div>
          </article>
          <article>
            <span>{todayLeads.length}</span>
            <div><h2>New {todayLeads.length === 1 ? "inquiry" : "inquiries"} today</h2><p>{todayLeads.length > 0 ? "New celebrations are waiting for you." : "No new submissions yet today."}</p></div>
          </article>
          <article className={styles.snapshotPending}>
            <span>Not set up yet</span>
            <div><h2>Client portals</h2><p>Ready for your first client once portals are connected.</p></div>
          </article>
        </section>


        <div className={styles.dashboardGrid}>
          <section className={styles.attentionPanel}>
            <div className={styles.sectionHeading}>
              <div><p className={styles.sectionKicker}>First priority</p><h2>Needs your attention</h2></div>
              <Link href="/admin/inquiries">View all inquiries <span aria-hidden="true">→</span></Link>
            </div>

            {priorityLeads.length > 0 ? (
              <div className={styles.attentionList}>
                {priorityLeads.map((lead) => (
                  <Link className={styles.attentionRow} href={`/admin/inquiries?lead=${encodeURIComponent(lead.id)}`} key={lead.id}>
                    <span className={styles.newDot} aria-hidden="true" />
                    <span className={styles.leadCopy}>
                      <strong>{lead.name || "New inquiry"}</strong>
                      <small>{eventSummary(lead)}</small>
                    </span>
                    <span className={styles.received}>{relativeTime(lead.created_at, now)}</span>
                    <span className={styles.openLink}>View inquiry <i aria-hidden="true">→</i></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.allClear}>
                <p>All caught up</p>
                <h3>Nothing needs a reply.</h3>
                <span>New website inquiries will appear here.</span>
              </div>
            )}
          </section>

          <section className={styles.activityPanel}>
            <div className={styles.sectionHeading}>
              <div><p className={styles.sectionKicker}>Latest</p><h2>Recent contacts</h2></div>
            </div>

            {recentLeads.length > 0 ? (
              <ol className={styles.activityList}>
                {recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <span className={styles.timelineDot} aria-hidden="true" />
                    <div>
                      <p><Link href={`/admin/inquiries?lead=${encodeURIComponent(lead.id)}`}>{lead.name || "A new client"}</Link> submitted an inquiry.</p>
                      <span>{relativeTime(lead.created_at, now)} · {STATUS_LABELS[lead.status]}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.noActivity}>No inquiries have arrived yet.</p>
            )}
          </section>
        </div>

        <section className={styles.workspaceSection} aria-labelledby="workspace-heading">
          <div className={styles.workspaceHeading}>
            <div><p className={styles.sectionKicker}>Choose a workspace</p><h2 id="workspace-heading">What are you working on?</h2></div>
            <span>One login · two focused spaces</span>
          </div>
          <div className={styles.workspaceCards}>
            <Link className={styles.portalCard} href="/admin/portal">
              <span className={styles.workspaceNumber}>01</span>
              <div>
                <p>Booked clients</p>
                <h3>Client portals</h3>
                <span>Create clients, collect payments, and manage documents and images.</span>
              </div>
              <dl>
                <div><dt>Status</dt><dd>Not set up yet</dd></div>
              </dl>
              <b>Open client portals <i aria-hidden="true">→</i></b>
            </Link>

            <Link className={styles.inquiryCard} href="/admin/inquiries">
              <span className={styles.workspaceNumber}>02</span>
              <div>
                <p>Front door</p>
                <h3>Website inquiries</h3>
                <span>Review new celebrations, contact leads, and follow each inquiry to booked.</span>
              </div>
              <dl>
                <div><dt>New today</dt><dd>{todayLeads.length}</dd></div>
                <div><dt>Needs reply</dt><dd>{needsAttention.length}</dd></div>
                <div><dt>Total leads</dt><dd>{initialLeads.length}</dd></div>
              </dl>
              <b>Open inquiries <i aria-hidden="true">→</i></b>
            </Link>
          </div>
        </section>

        <footer className={styles.mobileFooter}>
          <button type="button" onClick={() => void signOut()}>Sign out</button>
        </footer>
      </section>
    </main>
  );
}
