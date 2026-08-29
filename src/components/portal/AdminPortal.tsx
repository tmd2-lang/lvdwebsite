"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

type AdminView = "overview" | "clients" | "invoices" | "documents" | "states";

const clients = [
  { name: "Amara & Julien", initials: "AJ", event: "May 17, 2027", venue: "Meridian House", phase: "Design development", total: 68450, paid: 22000, action: "2 approvals" },
  { name: "Nia & Marcus", initials: "NM", event: "Jun 6, 2027", venue: "The Larz Anderson House", phase: "Foundation", total: 52000, paid: 12500, action: "Contract due" },
  { name: "Claire & Devon", initials: "CD", event: "Sep 19, 2026", venue: "Anderson House", phase: "Production", total: 81750, paid: 61200, action: "Final count" },
  { name: "Sofia & Elena", initials: "SE", event: "Oct 10, 2026", venue: "Private estate", phase: "Installation", total: 74500, paid: 74500, action: "On track" },
];

type AdminClient = (typeof clients)[number];

const adminNavigation: { id: AdminView; label: string; number: string }[] = [
  { id: "overview", label: "Overview", number: "01" },
  { id: "clients", label: "Clients", number: "02" },
  { id: "invoices", label: "Invoices", number: "03" },
  { id: "documents", label: "Documents", number: "04" },
  { id: "states", label: "UI states", number: "05" },
];

const viewCopy: Record<AdminView, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "Studio planning portal", title: "Good afternoon, Irene.", description: "Here’s what needs your attention across every celebration." },
  clients: { eyebrow: "Client management", title: "Every celebration, in view.", description: "Open a client workspace, check progress, and see what needs attention." },
  invoices: { eyebrow: "Financial administration", title: "Invoices, collected & clear.", description: "Add invoices, review processing, and keep every client balance accurate." },
  documents: { eyebrow: "Document administration", title: "One organized archive.", description: "Upload planning materials and assign each file to the right celebration." },
  states: { eyebrow: "Experience review", title: "Every state, thoughtfully handled.", description: "Preview what clients see while the portal loads, succeeds, runs empty, or needs attention." },
};

export default function AdminPortal() {
  const [view, setView] = useState<AdminView>("overview");
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [notice, setNotice] = useState("");
  const copy = viewCopy[view];

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3600);
  }

  function changeView(nextView: AdminView) {
    setSelectedClient(null);
    setView(nextView);
  }

  return (
    <main className={styles.adminShell}>
      <aside className={styles.adminSidebar}>
        <Link className={styles.brand} href="/portal/admin"><span className={styles.monogram}>LVD</span><span>Portal Studio</span></Link>
        <nav aria-label="Portal admin navigation">
          {adminNavigation.map((item) => <button className={view === item.id && !selectedClient ? styles.adminNavActive : undefined} type="button" onClick={() => changeView(item.id)} key={item.id}><span>{item.number}</span>{item.label}</button>)}
        </nav>
        <Link className={styles.clientPreviewLink} href="/portal">Open client preview <span aria-hidden="true">↗</span></Link>
        <div className={styles.adminAccount}><span>IV</span><div><strong>Irene Victoria</strong><small>Studio administrator</small></div><button type="button" aria-label="Open admin account menu">•••</button></div>
      </aside>

      <section className={styles.adminWorkspace}>
        <header className={styles.adminMobileHeader}>
          <Link href="/portal/admin"><b>LVD</b><span>Portal Studio</span></Link>
          <Link href="/portal">Client preview</Link>
        </header>

        <nav className={styles.adminMobileNav} aria-label="Mobile portal admin navigation">
          {adminNavigation.map((item) => <button className={view === item.id && !selectedClient ? styles.adminMobileActive : undefined} type="button" onClick={() => changeView(item.id)} key={item.id}>{item.label}</button>)}
        </nav>

        <div className={styles.adminContent}>
          {selectedClient ? (
            <AdminClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} onNotice={showNotice} />
          ) : (
            <>
              <header className={styles.adminPageHeader}>
                <div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.description}</p></div>
                <button type="button" onClick={() => showNotice("The new-client flow is designed and ready for backend connection.")}><span aria-hidden="true">＋</span> New client</button>
              </header>

              {view === "overview" && <AdminOverview onNotice={showNotice} />}
              {view === "clients" && <AdminClients onOpen={setSelectedClient} />}
              {view === "invoices" && <AdminInvoices onNotice={showNotice} />}
              {view === "documents" && <AdminDocuments onNotice={showNotice} />}
              {view === "states" && <AdminStates />}
            </>
          )}
        </div>
      </section>
      <div className={`${styles.toast} ${notice ? styles.toastVisible : ""}`} role="status" aria-live="polite">{notice}</div>
    </main>
  );
}

function AdminOverview({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <>
      <section className={styles.adminSnapshot} aria-label="Portal totals">
        <article className={styles.adminSnapshotPrimary}><span>4</span><div><strong>Active celebrations</strong><small>Across the 2026–27 season</small></div></article>
        <article><span>5</span><div><strong>Open approvals</strong><small>3 need client attention this week</small></div></article>
        <article><span>$74k</span><div><strong>Payments upcoming</strong><small>Across the next 30 days</small></div></article>
      </section>

      <div className={styles.adminDashboardGrid}>
        <section className={styles.adminPanel}>
          <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Priority queue</p><h2>Needs your attention</h2></div><button type="button" onClick={() => onNotice("All priority tasks would open in the production portal.")}>View all</button></div>
          <div className={styles.adminTaskList}>
            <button type="button" onClick={() => onNotice("Opening Amara & Julien’s floral proposal review.")}><span className={styles.priorityDot} /><div><strong>Amara &amp; Julien</strong><small>Floral proposal has 2 pending approvals</small></div><em>Today</em><i>→</i></button>
            <button type="button" onClick={() => onNotice("Opening Nia & Marcus’s contract workspace.")}><span className={styles.priorityDot} /><div><strong>Nia &amp; Marcus</strong><small>Design agreement awaiting signature</small></div><em>Tomorrow</em><i>→</i></button>
            <button type="button" onClick={() => onNotice("Opening Claire & Devon’s production checklist.")}><span className={styles.priorityDotGold} /><div><strong>Claire &amp; Devon</strong><small>Final guest count requested</small></div><em>Sep 2</em><i>→</i></button>
          </div>
        </section>

        <section className={styles.adminPanel}>
          <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Latest</p><h2>Portal activity</h2></div></div>
          <ol className={styles.adminActivity}>
            <li><span /><p><strong>Amara</strong> viewed invoice LVD-1028.<small>18 minutes ago</small></p></li>
            <li><span /><p><strong>Claire</strong> downloaded the production schedule.<small>1 hour ago</small></p></li>
            <li><span /><p><strong>Sofia</strong> completed the final balance.<small>Yesterday · Receipt sent</small></p></li>
            <li><span /><p><strong>Irene</strong> uploaded a revised floorplan.<small>Yesterday</small></p></li>
          </ol>
        </section>
      </div>
    </>
  );
}

function AdminClients({ onOpen }: { onOpen: (client: AdminClient) => void }) {
  return (
    <section className={styles.adminPanel}>
      <div className={styles.adminTableToolbar}><div><button className={styles.filterActive} type="button">Active <span>4</span></button><button type="button">Archived</button></div><label><span className={styles.srOnly}>Search clients</span><input type="search" placeholder="Search clients" /></label></div>
      <div className={styles.clientTableHeader}><span>Client</span><span>Phase</span><span>Financials</span><span>Next action</span><span /></div>
      <div className={styles.clientTable}>
        {clients.map((client) => {
          const progress = Math.round((client.paid / client.total) * 100);
          return <button type="button" onClick={() => onOpen(client)} key={client.name}>
            <span className={styles.clientInitials}>{client.initials}</span>
            <div className={styles.clientName}><strong>{client.name}</strong><small>{client.event} · {client.venue}</small></div>
            <span className={styles.clientPhase}>{client.phase}</span>
            <div className={styles.clientFinancials}><span><b>{money(client.paid)}</b> of {money(client.total)}</span><i><em style={{ width: `${progress}%` }} /></i></div>
            <span className={client.action === "On track" ? styles.statusPaid : styles.statusDue}>{client.action}</span>
            <i className={styles.clientArrow}>→</i>
          </button>;
        })}
      </div>
    </section>
  );
}

function AdminInvoices({ onNotice }: { onNotice: (message: string) => void }) {
  const [reviewing, setReviewing] = useState(false);
  const [lineItems, setLineItems] = useState([
    { id: 1, name: "Ceremony meadow installation", quantity: 1, unitPrice: 3200 },
    { id: 2, name: "Personal flowers", quantity: 1, unitPrice: 1850 },
    { id: 3, name: "Reception centerpieces", quantity: 18, unitPrice: 300 },
    { id: 4, name: "Candlelight & tabletop accents", quantity: 1, unitPrice: 2050 },
  ]);

  function updateLine(id: number, field: "name" | "quantity" | "unitPrice", value: string) {
    setLineItems((current) => current.map((line) => line.id === id ? { ...line, [field]: field === "name" ? value : Number(value) } : line));
  }

  if (reviewing) {
    const total = lineItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    return (
      <section className={styles.invoiceReviewWorkspace}>
        <button className={styles.reviewBack} type="button" onClick={() => setReviewing(false)}>← Upload queue</button>
        <div className={styles.reviewHeader}><div><p className={styles.eyebrow}>Invoice extraction review</p><h2>Confirm every detail before the client sees it.</h2><p>The sample PDF has been converted into editable invoice data.</p></div><span>4 items detected</span></div>
        <div className={styles.reviewGrid}>
          <section className={styles.adminPanel}>
            <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Invoice details</p><h2>floral-design-invoice.pdf</h2></div><span className={styles.statusPaid}>Ready to review</span></div>
            <div className={styles.reviewMetadata}>
              <label>Client<select defaultValue="Amara & Julien"><option>Amara &amp; Julien</option><option>Nia &amp; Marcus</option></select></label>
              <label>Invoice number<input defaultValue="LVD-1028" /></label>
              <label>Category<select defaultValue="Florals"><option>Florals</option><option>Décor</option><option>Planning</option></select></label>
              <label>Project phase<select defaultValue="Design development"><option>Design development</option><option>Foundation</option><option>Production</option></select></label>
              <label>Issue date<input type="date" defaultValue="2026-08-20" /></label>
              <label>Due date<input type="date" defaultValue="2026-09-10" /></label>
            </div>
            <div className={styles.reviewLineHeader}><span>Line item</span><span>Qty</span><span>Rate</span><span>Total</span><span /></div>
            <div className={styles.reviewLines}>
              {lineItems.map((line) => <div key={line.id}>
                <input value={line.name} onChange={(event) => updateLine(line.id, "name", event.target.value)} aria-label={`Line item ${line.id} name`} />
                <input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value)} aria-label={`${line.name} quantity`} />
                <input type="number" min="0" value={line.unitPrice} onChange={(event) => updateLine(line.id, "unitPrice", event.target.value)} aria-label={`${line.name} unit price`} />
                <strong>{money(line.quantity * line.unitPrice)}</strong>
                <button type="button" onClick={() => setLineItems((current) => current.filter((item) => item.id !== line.id))} aria-label={`Remove ${line.name}`}>×</button>
              </div>)}
            </div>
            <button className={styles.addLineButton} type="button" onClick={() => setLineItems((current) => [...current, { id: Date.now(), name: "New line item", quantity: 1, unitPrice: 0 }])}>＋ Add line item</button>
            <div className={styles.reviewTotal}><span>Invoice total</span><strong>{money(total)}</strong></div>
            <div className={styles.reviewActions}><button type="button" onClick={() => setReviewing(false)}>Keep as draft</button><button type="button" onClick={() => { onNotice("Invoice approved. In the finished portal it would now appear for Amara & Julien."); setReviewing(false); }}>Approve &amp; publish</button></div>
          </section>

          <aside className={styles.sourcePreview}>
            <div className={styles.sourcePreviewHeader}><span>Source document</span><button type="button">Open PDF</button></div>
            <div className={styles.fakeInvoicePage}><p>LADY VICTORIA DESIGNS</p><h3>Floral &amp; Spatial Design</h3><span>INVOICE LVD-1028</span><i /><i /><i /><i /><div><b>Total</b><strong>$12,500</strong></div></div>
            <p>Compare the extracted fields with the original upload before publishing.</p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.adminSplitGrid}>
      <section className={`${styles.adminPanel} ${styles.uploadPanel}`}>
        <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Add invoices</p><h2>Upload individually or in bulk</h2></div></div>
        <div className={styles.uploadDropzone}>
          <span aria-hidden="true">＋</span><h3>Drop invoice files here</h3><p>PDF, JPG, PNG, XLSX · Up to 25 files at once</p>
          <button type="button" onClick={() => onNotice("The real file picker will connect during the storage phase.")}>Choose files</button>
        </div>
        <div className={styles.uploadSettings}><label>Assign to client<select defaultValue="Amara & Julien"><option>Amara &amp; Julien</option><option>Nia &amp; Marcus</option><option>Claire &amp; Devon</option></select></label><label>Project phase<select defaultValue="Auto-detect"><option>Auto-detect</option><option>Foundation</option><option>Design development</option><option>Production</option></select></label></div>
      </section>

      <section className={styles.adminPanel}>
        <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Processing queue</p><h2>Recent uploads</h2></div><span className={styles.countBadge}>3</span></div>
        <div className={styles.processingList}>
          <button type="button" onClick={() => setReviewing(true)}><span>PDF</span><div><strong>floral-design-invoice.pdf</strong><small>Amara &amp; Julien · 4 line items found</small></div><b>Review now</b></button>
          <article><span>PDF</span><div><strong>rentals-september.pdf</strong><small>Claire &amp; Devon · 7 line items found</small></div><b>Ready to review</b></article>
          <article><span>XLSX</span><div><strong>vendor-invoices-batch.xlsx</strong><small>3 clients · 12 invoices</small></div><b className={styles.processing}>Processing</b></article>
        </div>
        <button className={styles.panelAction} type="button" onClick={() => setReviewing(true)}>Review upload queue <span>→</span></button>
      </section>
    </div>
  );
}

function AdminDocuments({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <div className={styles.adminSplitGrid}>
      <section className={`${styles.adminPanel} ${styles.uploadPanel}`}>
        <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Document library</p><h2>Upload planning materials</h2></div></div>
        <div className={styles.uploadDropzone}><span aria-hidden="true">＋</span><h3>Add contracts, proposals &amp; plans</h3><p>PDF, DOCX, XLSX, JPG, PNG · Up to 50 MB each</p><button type="button" onClick={() => onNotice("The real document picker will connect during the storage phase.")}>Choose documents</button></div>
        <div className={styles.uploadSettings}><label>Assign to client<select defaultValue="Select a client"><option>Select a client</option><option>Amara &amp; Julien</option><option>Nia &amp; Marcus</option></select></label><label>Category<select defaultValue="Auto-detect"><option>Auto-detect</option><option>Contract</option><option>Proposal</option><option>Floorplan</option><option>Planning</option></select></label></div>
      </section>

      <section className={styles.adminPanel}>
        <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Latest files</p><h2>Recently added</h2></div><button type="button" onClick={() => onNotice("The full document library will open here.")}>View library</button></div>
        <div className={styles.adminDocumentList}>
          <article><span>PDF</span><div><strong>Reception floorplan v3</strong><small>Amara &amp; Julien · Planning</small></div><time>Aug 17</time></article>
          <article><span>PDF</span><div><strong>Signed design agreement</strong><small>Nia &amp; Marcus · Contracts</small></div><time>Aug 16</time></article>
          <article><span>XLSX</span><div><strong>Final guest count</strong><small>Claire &amp; Devon · Planning</small></div><time>Aug 15</time></article>
          <article><span>PDF</span><div><strong>Production schedule</strong><small>Sofia &amp; Elena · Planning</small></div><time>Aug 14</time></article>
        </div>
      </section>
    </div>
  );
}

function AdminClientDetail({ client, onBack, onNotice }: { client: AdminClient; onBack: () => void; onNotice: (message: string) => void }) {
  const remaining = client.total - client.paid;
  const progress = Math.round((client.paid / client.total) * 100);

  return (
    <>
      <button className={styles.reviewBack} type="button" onClick={onBack}>← All clients</button>
      <section className={styles.clientDetailHero}>
        <div className={styles.clientDetailIdentity}><span>{client.initials}</span><div><p className={styles.eyebrow}>Client workspace</p><h1>{client.name}</h1><small>{client.event} · {client.venue}</small></div></div>
        <div className={styles.clientDetailActions}><Link href="/portal">View as client <span>↗</span></Link><button type="button" onClick={() => onNotice("Client message composer is ready for backend connection.")}>Message client</button></div>
      </section>

      <nav className={styles.clientDetailTabs} aria-label="Client workspace sections"><button className={styles.filterActive} type="button">Overview</button><button type="button">Invoices</button><button type="button">Documents</button><button type="button">Planning</button><button type="button">Activity</button></nav>

      <section className={styles.clientDetailStats}>
        <article><span>Total investment</span><strong>{money(client.total)}</strong><small>Across 5 invoices</small></article>
        <article><span>Paid to date</span><strong>{money(client.paid)}</strong><small>{progress}% complete</small><i><em style={{ width: `${progress}%` }} /></i></article>
        <article className={styles.clientDetailStatDark}><span>Remaining</span><strong>{money(remaining)}</strong><small>Next payment due September 10</small></article>
        <article><span>Portal activity</span><strong>18m</strong><small>Last active today</small></article>
      </section>

      <div className={styles.clientDetailGrid}>
        <section className={styles.adminPanel}>
          <div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Client financials</p><h2>Invoices &amp; payments</h2></div><button type="button" onClick={() => onNotice("Creating a new invoice for this client.")}>＋ Add invoice</button></div>
          <div className={styles.clientInvoiceList}>
            <article><span className={styles.statusDue}>Due Sep 10</span><div><strong>Floral &amp; spatial design</strong><small>LVD-1028 · 4 line items</small></div><b>$12,500</b><button type="button" onClick={() => onNotice("Opening the invoice editor.")}>Edit</button></article>
            <article><span className={styles.statusUpcoming}>Due Nov 1</span><div><strong>Décor sourcing &amp; rentals</strong><small>LVD-1022 · 3 line items</small></div><b>$8,750</b><button type="button" onClick={() => onNotice("Opening the invoice editor.")}>Edit</button></article>
            <article><span className={styles.statusPaid}>Paid Aug 18</span><div><strong>Venue styling retainer</strong><small>LVD-1019 · Receipt RCT-2019</small></div><b>$9,500</b><button type="button" onClick={() => onNotice("Opening the payment receipt.")}>Receipt</button></article>
          </div>
        </section>

        <div className={styles.clientDetailSide}>
          <section className={styles.adminPanel}><div className={styles.adminPanelHeader}><div><p className={styles.eyebrow}>Planning pulse</p><h2>Next actions</h2></div></div><div className={styles.clientActionList}><article><span>01</span><div><strong>2 design approvals</strong><small>Floral proposal · Due Friday</small></div></article><article><span>02</span><div><strong>Guest count</strong><small>Requested by September 6</small></div></article><article><span>03</span><div><strong>Design call</strong><small>September 12 · 2:00 PM</small></div></article></div></section>
          <section className={styles.clientContactCard}><p className={styles.eyebrow}>Primary contact</p><h2>Amara Johnson</h2><span>amara@example.com</span><span>(202) 555-0147</span><button type="button" onClick={() => onNotice("Client profile editor is ready for backend connection.")}>Edit client profile</button></section>
        </div>
      </div>
    </>
  );
}

function AdminStates() {
  return (
    <section className={styles.stateGrid} aria-label="Portal interface states">
      <article className={styles.stateCard}>
        <header><span>01</span><div><p className={styles.eyebrow}>Loading</p><h2>Gathering your details</h2></div></header>
        <div className={styles.loadingState}><span /><i /><i /><i /></div>
        <p>Used briefly while invoices, documents, or payment history are being retrieved.</p>
      </article>
      <article className={styles.stateCard}>
        <header><span>02</span><div><p className={styles.eyebrow}>Empty</p><h2>Your archive is ready</h2></div></header>
        <div className={styles.emptyState}><span>＋</span><strong>No documents yet</strong><small>Files shared by the studio will appear here.</small><button type="button">Message the studio</button></div>
        <p>New clients see a reassuring empty state instead of a confusing blank page.</p>
      </article>
      <article className={styles.stateCard}>
        <header><span>03</span><div><p className={styles.eyebrow}>Needs attention</p><h2>We couldn’t finish that</h2></div></header>
        <div className={styles.errorState}><span>!</span><div><strong>Upload paused</strong><small>One invoice could not be read. Try a clearer PDF or enter the details manually.</small></div><button type="button">Try again</button></div>
        <p>Errors explain what happened and give Irene or the client a clear next step.</p>
      </article>
      <article className={styles.stateCard}>
        <header><span>04</span><div><p className={styles.eyebrow}>Success</p><h2>Everything is complete</h2></div></header>
        <div className={styles.successState}><span>✓</span><strong>Payment received</strong><small>Your balance has been updated and receipt RCT-2019 is ready.</small><button type="button">View receipt</button></div>
        <p>Successful actions confirm exactly what changed and where to find the record.</p>
      </article>
    </section>
  );
}
