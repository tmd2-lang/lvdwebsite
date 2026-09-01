import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { celebrationTotals, money } from "@/lib/invoice-types";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

function paidOn(value: string | null) {
  if (!value) return "Date not recorded";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })
    .format(new Date(value));
}

export default async function PortalPaymentsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const invoices = (await getInvoicesForClient(session.client.id).catch(() => []))
    .filter((invoice) => invoice.status !== "draft" && invoice.status !== "void");
  const totals = celebrationTotals(invoices);

  // Every settled line, newest first. This is the record of what has been paid.
  const settled = invoices
    .flatMap((invoice) => invoice.invoice_items
      .filter((item) => item.paid)
      .map((item) => ({ item, invoice })))
    .sort((a, b) => (b.item.paid_at || "").localeCompare(a.item.paid_at || ""));

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Payment history</p>
          <h1>What you&rsquo;ve <em>settled.</em></h1>
        </div>
        <p>Every payment received against your celebration, kept here for your records.</p>
      </header>

      <section className={styles.paymentHistorySummary}>
        <article className={styles.paymentHistoryPrimary}>
          <span>Paid to date</span>
          <strong>{money(totals.paid)}</strong>
          <small>{totals.total > 0 ? `${Math.round((totals.paid / totals.total) * 100)}% of your celebration investment` : "Nothing billed yet"}</small>
        </article>
        <article>
          <span>Payments recorded</span>
          <strong>{settled.length}</strong>
          <small>Across {totals.count} {totals.count === 1 ? "invoice" : "invoices"}</small>
        </article>
        <article>
          <span>Remaining</span>
          <strong>{money(totals.remaining)}</strong>
          <small>{totals.remaining > 0 ? "Still to be settled" : "Fully settled"}</small>
        </article>
      </section>

      <section className={styles.receiptPanel}>
        <div className={styles.panelHeading}>
          <div><p className={styles.eyebrow}>Payment archive</p><h2>Everything received</h2></div>
        </div>

        {settled.length === 0 ? (
          <p className={styles.panelEmpty}>
            No payments have been recorded yet. They will be listed here as the studio receives them.
          </p>
        ) : (
          <div className={styles.receiptTable}>
            {settled.map(({ item, invoice }) => (
              <article key={item.id}>
                <span className={styles.receiptMark}>✓</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{invoice.reference} · {invoice.name} · {paidOn(item.paid_at)}</small>
                </div>
                <b>{money(item.amount_cents)}</b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.autopayNote}>
        <div>
          <span aria-hidden="true">i</span>
          <p>
            <strong>Payments stay under your control.</strong>
            <small>Nothing is ever charged automatically. Your card details are never stored on this site.</small>
          </p>
        </div>
        <Link href="/portal/invoices">View open invoices <span>→</span></Link>
      </section>
    </div>
  );
}
