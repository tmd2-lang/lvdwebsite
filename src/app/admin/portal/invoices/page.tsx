import Link from "next/link";
import { getClients } from "@/lib/client-data";
import { getInvoices } from "@/lib/invoice-data";
import { INVOICE_STATUS_LABELS, invoiceTotal, money } from "@/lib/invoice-types";
import styles from "../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([
    getInvoices().catch(() => []),
    getClients().catch(() => []),
  ]);
  const clientNames = new Map(clients.map((client) => [client.id, client.display_name]));

  return (
    <main className={styles.libraryPage}>
      <header className={styles.libraryHeader}>
        <div><p className={styles.eyebrow}>Financial administration</p><h1>Invoices</h1><p>Review every client invoice from one organized studio view.</p></div>
        <Link className={styles.newClientAction} href="/admin/portal/clients">Choose a client</Link>
      </header>

      {invoices.length === 0 ? (
        <section className={styles.libraryEmpty}>
          <span aria-hidden="true">01</span>
          <div><p className={styles.eyebrow}>Nothing here yet</p><h2>No invoices have been created.</h2><p>Open a client record to create their first itemized invoice.</p></div>
          <Link href="/admin/portal/clients">View clients <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <section className={styles.libraryPanel}>
          <div className={styles.libraryTableHeader}><span>Invoice</span><span>Client</span><span>Status</span><span>Amount</span></div>
          <div className={styles.libraryRows}>
            {invoices.map((invoice) => (
              <Link href={`/admin/portal/clients/${invoice.client_id}`} key={invoice.id}>
                <div><strong>{invoice.name}</strong><small>{invoice.reference}</small></div>
                <span>{clientNames.get(invoice.client_id) || "Client record"}</span>
                <span>{INVOICE_STATUS_LABELS[invoice.status]}</span>
                <b>{money(invoiceTotal(invoice))}</b>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
