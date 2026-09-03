"use client";

import Link from "next/link";
import { useState } from "react";
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
import InviteForm from "./InviteForm";
import styles from "../../portal-admin.module.css";

type WorkspaceTab = "overview" | "invoices" | "documents" | "images" | "access";

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
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

export default function ClientWorkspace({ client, members, invoices, documents, removedDocuments, images, removedImages, initialTab = "overview" }: { client: PortalClient; members: ClientMember[]; invoices: Invoice[]; documents: ClientDocument[]; removedDocuments: ClientDocument[]; images: ViewableImage[]; removedImages: ViewableImage[]; initialTab?: WorkspaceTab }) {
  const [tab, setTab] = useState<WorkspaceTab>(initialTab);
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
                  <Link href={`/admin/portal/clients/${client.id}/invoices/new`}><span>01</span><div><strong>Create an invoice</strong><small>Add itemized charges and a payment link.</small></div><i>→</i></Link>
                  <button type="button" onClick={() => setTab("documents")}><span>02</span><div><strong>Upload documents</strong><small>Add contracts, plans, and proposals.</small></div><i>→</i></button>
                  <button type="button" onClick={() => setTab("access")}><span>03</span><div><strong>Invite to portal</strong><small>Send secure access to this celebration.</small></div><i>→</i></button>
                </div>
              </aside>
            </div>
          </>
        )}

        {tab === "invoices" && <section className={styles.workspaceCard}>
          <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Financials</p><h2>Client Invoices</h2></div><Link href={`/admin/portal/clients/${client.id}/invoices/new`}>Create invoice</Link></div>
          {invoices.length === 0 ? <div className={styles.workspaceEmpty}><span>＋</span><h3>No invoices yet.</h3><p>Create the first itemized invoice for this client.</p></div> : <ul className={styles.invoiceRows}>{invoices.map((invoice) => <li key={invoice.id}><div className={styles.invoiceRowName}><strong>{invoice.name}</strong><small>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""}</small></div><span className={styles.invoiceRowAmount}>{money(invoiceTotal(invoice))}</span><span className={`${styles.invoiceRowStatus} ${invoiceOutstanding(invoice) === 0 ? styles.invoiceRowPaid : ""}`}>{invoiceOutstanding(invoice) === 0 ? "Paid" : INVOICE_STATUS_LABELS[invoice.status]}</span></li>)}</ul>}
        </section>}

        {tab === "documents" && <DocumentPanel clientId={client.id} documents={documents} removedDocuments={removedDocuments} />}

        {tab === "images" && <ImagePanel clientId={client.id} images={images} removedImages={removedImages} />}

        {tab === "access" && <section className={styles.workspaceCard}>
          <div className={styles.workspaceCardHeader}><div><p className={styles.eyebrow}>Private portal</p><h2>Who Can Sign In</h2></div></div>
          <div className={styles.workspaceAccessBody}>
            {members.length === 0 ? <p className={styles.detailEmpty}>Nobody can sign in to this celebration yet.</p> : <ul className={styles.memberList}>{members.map((member) => <li key={member.id}><strong>{member.invited_email || "Linked account"}</strong><span>{member.relationship}</span></li>)}</ul>}
            <InviteForm clientId={client.id} />
          </div>
        </section>}
      </section>
    </main>
  );
}
