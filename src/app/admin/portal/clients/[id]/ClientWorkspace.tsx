"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { ClientMember } from "@/lib/client-data";
import type { ClientDocument } from "@/lib/document-data";
import type { Invoice } from "@/lib/invoice-types";
import { celebrationTotals, invoiceOutstanding, invoiceTotal, money } from "@/lib/invoice-types";
import { INVOICE_STATUS_LABELS } from "@/lib/invoice-types";
import {
  CLIENT_STATUS_LABELS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_LABELS,
  type PortalClient,
} from "@/lib/client-types";
import type { ViewableImage } from "@/lib/image-view";
import DocumentPanel from "./DocumentPanel";
import ImagePanel from "./ImagePanel";
import TaskPanel from "./TaskPanel";
import ChecklistPanel from "./ChecklistPanel";
import type { ChecklistItem } from "@/lib/checklist-view";
import BudgetPanel from "./BudgetPanel";
import type { ClientBudget } from "@/lib/budget-data";
import TimelinePanel from "./TimelinePanel";
import type { TimelineDoc } from "@/lib/timeline-view";
import GuestsPanel from "./GuestsPanel";
import type { ClientGuests } from "@/lib/guests-data";
import type { ClientTask } from "@/lib/task-view";
import InviteForm from "./InviteForm";
import MemberList from "./MemberList";
import styles from "../../portal-admin.module.css";
import PostEventPanel from "./PostEventPanel";
import type { ClientPostEvent } from "@/lib/client-resources-view";

type WorkspaceTab = "overview" | "checklist" | "budget" | "timeline" | "guests" | "tasks" | "invoices" | "documents" | "images" | "access";

// Tasks is left out of the tab bar: the Checklist replaces it. The panel still
// opens at ?tab=tasks in case anything there is needed before it is removed.
const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "checklist", label: "Checklist" },
  { id: "budget", label: "Budget" },
  { id: "timeline", label: "Timeline" },
  { id: "guests", label: "Guests" },
  { id: "invoices", label: "Invoices" },
  { id: "documents", label: "Documents" },
  { id: "images", label: "Images" },
  { id: "access", label: "Portal access" },
];

function formatDate(value: string | null) {
  if (!value) return "Date still open";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function initials(client: PortalClient) {
  return [client.partner_one_name, client.partner_two_name].filter(Boolean).map((name) => name!.trim()[0]?.toUpperCase()).join("").slice(0, 2);
}

export default function ClientWorkspace({ client, members, invoices, documents, removedDocuments, images, removedImages, tasks, checklist, checklistError, budget, budgetError, timeline, timelineError, guests, guestsError, postEvent, postEventError, initialTab = "overview" }: { client: PortalClient; members: ClientMember[]; invoices: Invoice[]; documents: ClientDocument[]; removedDocuments: ClientDocument[]; tasks: ClientTask[]; checklist: ChecklistItem[]; checklistError?: string; budget: ClientBudget; budgetError?: string; timeline: TimelineDoc; timelineError?: string; guests: ClientGuests; guestsError?: string; postEvent: ClientPostEvent | null; postEventError?: string; images: ViewableImage[]; removedImages: ViewableImage[]; initialTab?: WorkspaceTab }) {
  const [tab, setTabState] = useState<WorkspaceTab>(initialTab);
  const [imageAlbum, setImageAlbum] = useState(client.design_tier ? "Design" : "All");

  /**
   * The open tab lives in the address as well as in state. Sending an invite
   * refreshes the page underneath us, and a tab held only in memory drops back
   * to Overview when that happens. Keeping it in the address also makes a tab
   * something you can link to, bookmark, and reach with the back button.
   *
   * replaceState rather than router.replace: this is the same page, so there is
   * no reason to ask the server for it again.
   */
  const setTab = useCallback((next: WorkspaceTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);
  const totals = celebrationTotals(invoices);
  const locationLine = [formatDate(client.event_date), client.venue, client.location].filter(Boolean).join(" · ");

  return (
    <main className={styles.workspacePage}>
      <Link className={styles.workspaceBack} href="/admin/portal/clients"><span aria-hidden="true">←</span> All clients</Link>

      <section className={styles.workspaceHero}>
        <div className={styles.workspaceIdentity}>
          <span>{initials(client)}</span>
          <div>
            <p className={styles.eyebrow}>{CLIENT_STATUS_LABELS[client.status]} client</p>
            <h1>{client.display_name}</h1>
            <small>{locationLine}</small>
            <div className={styles.workspaceBadges}>
              <b>{PLANNING_PACKAGE_LABELS[client.planning_package]}</b>
              {client.design_tier && <b>{DESIGN_TIER_LABELS[client.design_tier]}</b>}
            </div>
          </div>
        </div>
        <div className={styles.workspaceHeroActions}>
          <Link href={`/admin/portal/clients/${client.id}/preview`}>Preview couple portal</Link>
          <Link href={`/admin/portal/clients/${client.id}/edit`}>Edit client</Link>
          <button type="button" onClick={() => setTab("access")}>Invite client</button>
        </div>
      </section>

      <nav className={styles.workspaceTabs} role="tablist" aria-label={`${client.display_name} workspace`}>
        {tabs.map((item) => <button id={`tab-${item.id}`} className={tab === item.id ? styles.workspaceTabActive : undefined} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} onClick={() => setTab(item.id)} key={item.id}>{item.label}</button>)}
      </nav>

      <section id={`panel-${tab}`} className={styles.workspacePanel} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "overview" && (
          <>
            <section className={styles.workspaceStats} aria-label="Client summary">
              <article className={styles.workspaceStatDark}><span>Total invoiced</span><strong>{money(totals.total)}</strong><small>{totals.count} active {totals.count === 1 ? "invoice" : "invoices"}</small></article>
              <article><span>Paid</span><strong>{money(totals.paid)}</strong><small>Across paid line items</small></article>
              <article><span>Remaining</span><strong>{money(totals.remaining)}</strong><small>Outstanding balance</small></article>
              <article><span>Private files</span><strong>{documents.length}</strong><small>{members.length} portal {members.length === 1 ? "member" : "members"}</small></article>
            </section>

            <div className={styles.workspaceOverviewGrid}>
              <section className={styles.workspaceCard}>
                <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Client record</p><h2>What They Booked</h2></div><Link href={`/admin/portal/clients/${client.id}/edit`}>Edit details</Link></div>
                <dl className={styles.workspaceDetails}>
                  <div><dt>Planning package</dt><dd>{PLANNING_PACKAGE_LABELS[client.planning_package]}</dd></div>
                  <div><dt>Booked on</dt><dd>{client.booked_on ? formatDate(client.booked_on) : "Not set"}</dd></div>
                  <div><dt>Design tier</dt><dd>{client.design_tier ? DESIGN_TIER_LABELS[client.design_tier] : "None"}</dd></div>
                  <div><dt>Guest count</dt><dd>{client.guest_count || "Not set"}</dd></div>
                  <div><dt>Email</dt><dd>{client.email || "Not set"}</dd></div>
                  <div><dt>Phone</dt><dd>{client.phone || "Not set"}</dd></div>
                  <div><dt>Venue</dt><dd>{client.venue || "Not set"}</dd></div>
                </dl>
                {client.notes && <p className={styles.workspaceNotes}>{client.notes}</p>}
              </section>

              <aside className={styles.workspaceCard}>
                <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Next steps</p><h2>Client Actions</h2></div></div>
                <div className={styles.workspaceActions}>
                  <Link href="/admin/portal/wave"><span>01</span><div><strong>Wave invoice sync</strong><small>Match Wave invoices and view payment status.</small></div><i>→</i></Link>
                  <button type="button" onClick={() => setTab("documents")}><span>02</span><div><strong>Upload documents</strong><small>Add contracts, plans, and proposals.</small></div><i>→</i></button>
                  <button type="button" onClick={() => setTab("access")}><span>03</span><div><strong>Invite to portal</strong><small>Send secure access to this celebration.</small></div><i>→</i></button>
                </div>
              </aside>
            </div>
            <PostEventPanel clientId={client.id} initial={postEvent} loadError={postEventError} />
          </>
        )}

        {tab === "invoices" && <section className={styles.workspaceCard}>
          <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Financials</p><h2>Client Invoices</h2></div><Link href="/admin/portal/wave">Wave invoice sync</Link></div>
          {invoices.length === 0 ? <div className={styles.workspaceEmpty}><span>＋</span><h3>No invoices yet.</h3><p>Connect Wave and match this client’s invoices to their event.</p></div> : <ul className={styles.invoiceRows}>{invoices.map((invoice) => <li key={invoice.id}><div className={styles.invoiceRowName}><strong>{invoice.name}</strong><small>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""}</small></div><span className={styles.invoiceRowAmount}>{money(invoiceTotal(invoice))}</span><span className={`${styles.invoiceRowStatus} ${invoiceOutstanding(invoice) === 0 ? styles.invoiceRowPaid : ""}`}>{invoiceOutstanding(invoice) === 0 ? "Paid" : (invoice.wave_status ?? INVOICE_STATUS_LABELS[invoice.status])}</span></li>)}</ul>}
        </section>}

        {tab === "documents" && <DocumentPanel clientId={client.id} documents={documents} removedDocuments={removedDocuments} />}

        {tab === "checklist" && <ChecklistPanel clientId={client.id} eventDate={client.event_date} initialItems={checklist} loadError={checklistError} onOpenDesign={() => { setImageAlbum("Design"); setTab("images"); }} onOpenGallery={() => setTab("overview")} />}

        {tab === "budget" && <BudgetPanel clientId={client.id} designBooked={Boolean(client.design_tier)} guestCount={parseInt(client.guest_count ?? "", 10) || null} setup={budget.setup} lines={budget.lines} payments={budget.payments} loadError={budgetError} />}

        {tab === "timeline" && <TimelinePanel clientId={client.id} eventDate={client.event_date} initial={timeline} loadError={timelineError} />}

        {tab === "guests" && <GuestsPanel clientId={client.id} initialRecords={guests.records} initialSettings={guests.settings} loadError={guestsError} />}

        {tab === "tasks" && <TaskPanel clientId={client.id} tasks={tasks} />}

        {tab === "images" && <ImagePanel clientId={client.id} images={images} removedImages={removedImages} designBooked={Boolean(client.design_tier)} initialAlbum={imageAlbum} />}

        {tab === "access" && <section className={styles.workspaceCard}>
          <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Private portal</p><h2>Who Can Sign In</h2></div></div>
          <div className={styles.workspaceAccessBody}>
            <MemberList clientId={client.id} members={members} />
            <InviteForm clientId={client.id} />
          </div>
        </section>}
      </section>
    </main>
  );
}
