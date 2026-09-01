import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDocumentsForClient, readableSize } from "@/lib/document-data";
import { celebrationTotals, invoiceOutstanding, invoiceTotal, money } from "@/lib/invoice-types";
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
  const invoices = (await getInvoicesForClient(client.id).catch(() => []))
    .filter((invoice) => invoice.status !== "draft" && invoice.status !== "void");
  const totals = celebrationTotals(invoices);
  const documents = await getDocumentsForClient(client.id).catch(() => []);

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

      {invoices.length > 0 ? (
        <>
          <section className={styles.realBalance} aria-labelledby="balance-heading">
            <div>
              <p className={styles.eyebrow}>Celebration investment</p>
              <h2 id="balance-heading">{money(totals.remaining)} <span>remaining</span></h2>
              <div className={styles.realTrack} aria-label={`${totals.total > 0 ? Math.round((totals.paid / totals.total) * 100) : 0} percent paid`}>
                <span style={{ width: `${totals.total > 0 ? (totals.paid / totals.total) * 100 : 0}%` }} />
              </div>
              <div className={styles.realLegend}>
                <span><b>{money(totals.paid)}</b> paid</span>
                <span><b>{money(totals.total)}</b> total</span>
              </div>
            </div>
          </section>

          <section className={styles.realInvoices}>
            <p className={styles.eyebrow}>Your invoices</p>
            <ul>
              {invoices.map((invoice) => {
                const outstanding = invoiceOutstanding(invoice);
                return (
                  <li key={invoice.id}>
                    <div>
                      <strong>{invoice.name}</strong>
                      <small>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""}</small>
                      <ol className={styles.realItems}>
                        {invoice.invoice_items.map((item) => (
                          <li key={item.id} className={item.paid ? styles.realItemPaid : undefined}>
                            <span>{item.name}</span>
                            <b>{money(item.amount_cents)}</b>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className={styles.realInvoiceMeta}>
                      <strong>{money(invoiceTotal(invoice))}</strong>
                      <span className={outstanding === 0 ? styles.realPaidTag : styles.realDueTag}>
                        {outstanding === 0 ? "Paid in full" : `${money(outstanding)} due`}
                      </span>
                      {outstanding > 0 && invoice.payment_url && (
                        <a className={styles.realPayButton} href={invoice.payment_url} target="_blank" rel="noopener noreferrer">
                          Pay this invoice <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className={styles.realPayNote}>
              {invoices.some((invoice) => invoice.payment_url && invoiceOutstanding(invoice) > 0)
                ? "Payments are handled securely by the studio’s billing provider. Your card details are never stored on this site."
                : "The studio will be in touch about how to settle each invoice."}
            </p>
          </section>
        </>
      ) : (
        <section className={styles.realPending}>
          <p className={styles.eyebrow}>Coming next</p>
          <h2>Your invoices, documents, and plan are on their way.</h2>
          <p>
            This is your private space. As the studio adds invoices, contracts, and planning
            materials for {client.display_name}, they will appear here.
          </p>
        </section>
      )}
      {documents.length > 0 && (
        <section className={styles.realDocuments}>
          <p className={styles.eyebrow}>Your documents</p>
          <ul>
            {documents.map((document) => (
              <li key={document.id}>
                <div>
                  <strong>{document.name}</strong>
                  <small>{document.category} · {readableSize(document.size_bytes)}{document.note ? ` · ${document.note}` : ""}</small>
                </div>
                <a href={`/api/portal/documents/${document.id}`} target="_blank" rel="noopener noreferrer">
                  Open <span aria-hidden="true">↓</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
