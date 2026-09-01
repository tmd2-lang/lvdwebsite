import Link from "next/link";
import { getPortalSession } from "@/lib/portal-auth";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDocumentsForClient } from "@/lib/document-data";
import { celebrationTotals, invoiceOutstanding, invoiceTotal, money } from "@/lib/invoice-types";
import { DESIGN_TIER_LABELS, PLANNING_PACKAGE_LABELS } from "@/lib/client-types";
import { redirect } from "next/navigation";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

function daysUntil(eventDate: string | null) {
  if (!eventDate) return null;
  const event = new Date(`${eventDate}T00:00:00Z`).getTime();
  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((event - startOfToday) / 86400000);
  return days >= 0 ? days : null;
}

function shortDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

export default async function PortalOverviewPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const { user, client } = session;
  const countdown = daysUntil(client.event_date);

  const invoices = (await getInvoicesForClient(client.id).catch(() => []))
    .filter((invoice) => invoice.status !== "draft" && invoice.status !== "void");
  const documents = await getDocumentsForClient(client.id).catch(() => []);

  const totals = celebrationTotals(invoices);
  const percentPaid = totals.total > 0 ? (totals.paid / totals.total) * 100 : 0;
  const recent = invoices.slice(0, 3);
  const nextDue = invoices.find((invoice) => invoiceOutstanding(invoice) > 0);

  return (
    <div className={styles.content}>
      <section className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>Client planning portal</p>
          <h1>
            {user.firstName ? <>Welcome back, <em>{user.firstName}.</em></> : <>Welcome <em>back.</em></>}
          </h1>
          <p>Everything for your celebration, thoughtfully gathered in one place.</p>
        </div>
        {countdown !== null && (
          <div className={styles.countdown}>
            <strong>{countdown}</strong>
            <span>{countdown === 1 ? "day to go" : "days to go"}</span>
          </div>
        )}
      </section>

      {totals.count > 0 ? (
        <section className={styles.balanceCard} aria-labelledby="balance-title">
          <div className={styles.balanceLead}>
            <p>Celebration investment</p>
            <h2 id="balance-title">{money(totals.remaining)} <span>remaining</span></h2>
            <div className={styles.balanceTrack} aria-label={`${Math.round(percentPaid)} percent paid`}>
              <span style={{ width: `${percentPaid}%` }} />
            </div>
            <div className={styles.balanceLegend}>
              <span><b>{money(totals.paid)}</b> paid</span>
              <span><b>{money(totals.total)}</b> total</span>
            </div>
          </div>
          {nextDue && (
            <div className={styles.nextPayment}>
              <span>Next payment</span>
              <strong>{money(invoiceOutstanding(nextDue))}</strong>
              <p>{nextDue.name}{nextDue.due_on ? ` · Due ${shortDate(nextDue.due_on)}` : ""}</p>
              <Link href={`/portal/invoices/${nextDue.id}`}>Review balance <i aria-hidden="true">→</i></Link>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.balanceCard}>
          <div className={styles.balanceLead}>
            <p>Celebration investment</p>
            <h2>No invoices yet</h2>
            <div className={styles.balanceLegend}>
              <span>Your balance will appear here as the studio prepares it.</span>
            </div>
          </div>
        </section>
      )}

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>Financials</p><h2>Recent invoices</h2></div>
            <Link href="/portal/invoices">View all <span aria-hidden="true">→</span></Link>
          </div>
          {recent.length === 0 ? (
            <p className={styles.panelEmpty}>Nothing has been billed yet.</p>
          ) : (
            <div className={styles.invoiceList}>
              {recent.map((invoice, index) => {
                const outstanding = invoiceOutstanding(invoice);
                return (
                  <Link href={`/portal/invoices/${invoice.id}`} key={invoice.id}>
                    <span className={styles.invoiceIndex}>0{index + 1}</span>
                    <div>
                      <strong>{invoice.name}</strong>
                      <small>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""}</small>
                    </div>
                    <b>{money(invoiceTotal(invoice))}</b>
                    <span className={outstanding === 0 ? styles.statusPaid : styles.statusDue}>
                      {outstanding === 0 ? "Paid" : nextDueLabel(invoice.due_on)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className={`${styles.panel} ${styles.nextSteps}`}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>Your celebration</p><h2>At a glance</h2></div>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div><strong>{PLANNING_PACKAGE_LABELS[client.planning_package]}</strong><small>Your planning package</small></div>
            </li>
            {client.design_tier && (
              <li>
                <span>02</span>
                <div><strong>{DESIGN_TIER_LABELS[client.design_tier]}</strong><small>Design and florals</small></div>
              </li>
            )}
            <li>
              <span>{client.design_tier ? "03" : "02"}</span>
              <div>
                <strong>{documents.length} {documents.length === 1 ? "document" : "documents"}</strong>
                <small>{documents.length > 0 ? "Ready for you to read" : "Nothing shared yet"}</small>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function nextDueLabel(dueOn: string | null) {
  const label = shortDate(dueOn);
  return label ? `Due ${label}` : "Due";
}
