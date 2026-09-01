import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getInvoiceForClient } from "@/lib/invoice-data";
import { invoiceOutstanding, invoicePaid, invoiceTotal, money } from "@/lib/invoice-types";
import styles from "../../../portal.module.css";

export const dynamic = "force-dynamic";

function longDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

export default async function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const { invoiceId } = await params;
  const invoice = await getInvoiceForClient(invoiceId, session.client.id);
  if (!invoice) notFound();

  const total = invoiceTotal(invoice);
  const paid = invoicePaid(invoice);
  const outstanding = invoiceOutstanding(invoice);

  return (
    <div className={styles.content}>
      <div className={styles.invoiceDetailTopline}>
        <Link href="/portal/invoices"><span aria-hidden="true">←</span> All invoices</Link>
      </div>

      <section className={styles.invoicePaper}>
        <header className={styles.invoicePaperHeader}>
          <div>
            <p className={styles.eyebrow}>Lady Victoria Designs</p>
            <h1>{invoice.name}</h1>
            <span>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""}</span>
          </div>
          <div className={styles.invoicePaperMeta}>
            <span className={outstanding === 0 ? styles.statusPaid : styles.statusDue}>
              {outstanding === 0 ? "Paid in full" : `${money(outstanding)} due`}
            </span>
            <dl>
              <div><dt>Issued</dt><dd>{longDate(invoice.issued_on)}</dd></div>
              <div><dt>Due</dt><dd>{longDate(invoice.due_on)}</dd></div>
            </dl>
          </div>
        </header>

        <div className={styles.invoiceBillTo}>
          <div>
            <span>Prepared for</span>
            <strong>{session.client.display_name}</strong>
            <small>
              {[session.client.venue, longDate(session.client.event_date)].filter(Boolean).join(" · ")}
            </small>
          </div>
          <div>
            <span>Invoice total</span>
            <strong>{money(total)}</strong>
            <small>{invoice.invoice_items.length} item{invoice.invoice_items.length === 1 ? "" : "s"}</small>
          </div>
        </div>

        <div className={styles.lineItemHeading}>
          <div><span>Item</span></div><span>Amount</span>
        </div>
        <div className={styles.lineItems}>
          {invoice.invoice_items.map((item) => (
            <div className={item.paid ? styles.lineItemPaid : undefined} key={item.id}>
              <span className={styles.lineItemCopy}>
                <strong>{item.name}</strong>
                {item.detail && <small>{item.detail}</small>}
                {item.paid && <em>Paid</em>}
              </span>
              <b>{money(item.amount_cents)}</b>
            </div>
          ))}
        </div>

        <footer className={styles.invoicePaperFooter}>
          <p>
            {paid > 0
              ? `${money(paid)} of this invoice has been received. Thank you.`
              : "Payment is handled securely by the studio’s billing provider."}
          </p>
          <div><span>Invoice total</span><strong>{money(total)}</strong></div>
        </footer>
      </section>

      {invoice.notes && <p className={styles.invoiceNotes}>{invoice.notes}</p>}

      <aside className={styles.paymentBar}>
        <div>
          <span>{outstanding === 0 ? "Settled" : "Balance due"}</span>
          <strong>{money(outstanding)}</strong>
          <small>{invoice.reference}</small>
        </div>
        {outstanding > 0 && invoice.payment_url ? (
          <a href={invoice.payment_url} target="_blank" rel="noopener noreferrer">
            Pay this invoice <span aria-hidden="true">↗</span>
          </a>
        ) : outstanding > 0 ? (
          <span className={styles.paymentPending}>The studio will be in touch about payment</span>
        ) : (
          <span className={styles.paymentPending}>Paid in full</span>
        )}
      </aside>
    </div>
  );
}
