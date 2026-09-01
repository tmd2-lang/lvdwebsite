import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { celebrationTotals, money } from "@/lib/invoice-types";
import InvoiceBrowser from "./InvoiceBrowser";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalInvoicesPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const invoices = (await getInvoicesForClient(session.client.id).catch(() => []))
    .filter((invoice) => invoice.status !== "draft" && invoice.status !== "void");
  const totals = celebrationTotals(invoices);

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your investment</p>
          <h1>Invoices &amp; <em>payments.</em></h1>
        </div>
        <p>Review every invoice, see what each one covers, and keep track of your celebration balance.</p>
      </header>

      <section className={styles.invoiceSummary} aria-label="Invoice summary">
        <article>
          <span>Full investment</span>
          <strong>{money(totals.total)}</strong>
          <small>Across {totals.count} {totals.count === 1 ? "invoice" : "invoices"}</small>
        </article>
        <article>
          <span>Paid to date</span>
          <strong>{money(totals.paid)}</strong>
          <small>{totals.total > 0 ? `${Math.round((totals.paid / totals.total) * 100)}% of your investment` : "Nothing billed yet"}</small>
        </article>
        <article className={styles.invoiceSummaryDark}>
          <span>Remaining balance</span>
          <strong>{money(totals.remaining)}</strong>
          <small>{totals.remaining > 0 ? "Still to be settled" : "Fully settled"}</small>
        </article>
      </section>

      <InvoiceBrowser invoices={invoices} />
    </div>
  );
}
