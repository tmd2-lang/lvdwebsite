import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById, getClientMembers } from "@/lib/client-data";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDocumentsForClient } from "@/lib/document-data";
import DocumentPanel from "./DocumentPanel";
import { celebrationTotals, invoiceOutstanding, invoiceTotal, money } from "@/lib/invoice-types";
import { INVOICE_STATUS_LABELS } from "@/lib/invoice-types";
import {
  CLIENT_STATUS_LABELS,
  DESIGN_TIER_LABELS,
  PLANNING_PACKAGE_LABELS,
} from "@/lib/client-types";
import InviteForm from "./InviteForm";
import styles from "../../portal-admin.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Date still open";
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  const { id } = await params;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=/admin/portal/clients/${id}`);
    redirect("/admin/login");
  }

  const client = await getClientById(id);
  if (!client) notFound();

  const members = await getClientMembers(client.id);
  const invoices = await getInvoicesForClient(client.id).catch(() => []);
  const totals = celebrationTotals(invoices);
  const documents = await getDocumentsForClient(client.id).catch(() => []);

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href="/admin/portal/clients"><span aria-hidden="true">←</span> All clients</Link>
        <p className={styles.eyebrow}>{CLIENT_STATUS_LABELS[client.status]}</p>
        <h1>{client.display_name}</h1>
        <p className={styles.formIntro}>
          {formatDate(client.event_date)}{client.venue ? ` · ${client.venue}` : ""}{client.location ? ` · ${client.location}` : ""}
        </p>
      </div>

      <section className={styles.detailPanel}>
        <h2>What they booked</h2>
        <dl className={styles.detailList}>
          <div><dt>Planning package</dt><dd>{PLANNING_PACKAGE_LABELS[client.planning_package]}</dd></div>
          <div><dt>Design tier</dt><dd>{client.design_tier ? DESIGN_TIER_LABELS[client.design_tier] : "None"}</dd></div>
          <div><dt>Guest count</dt><dd>{client.guest_count || "Not set"}</dd></div>
          <div><dt>Email</dt><dd>{client.email || "Not set"}</dd></div>
          <div><dt>Phone</dt><dd>{client.phone || "Not set"}</dd></div>
        </dl>
        {client.notes && <p className={styles.detailNotes}>{client.notes}</p>}
      </section>

      <section className={styles.detailPanel}>
        <h2>Invoices</h2>
        {invoices.length > 0 && (
          <div className={styles.invoiceTotals}>
            <div><span>Total</span><strong>{money(totals.total)}</strong></div>
            <div><span>Paid</span><strong>{money(totals.paid)}</strong></div>
            <div><span>Remaining</span><strong>{money(totals.remaining)}</strong></div>
          </div>
        )}
        {invoices.length === 0 ? (
          <p className={styles.detailEmpty}>No invoices yet.</p>
        ) : (
          <ul className={styles.invoiceRows}>
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <div className={styles.invoiceRowName}>
                  <strong>{invoice.name}</strong>
                  <small>{invoice.reference}{invoice.phase ? ` · ${invoice.phase}` : ""} · {invoice.invoice_items.length} item{invoice.invoice_items.length === 1 ? "" : "s"}</small>
                </div>
                <span className={styles.invoiceRowAmount}>{money(invoiceTotal(invoice))}</span>
                <span className={`${styles.invoiceRowStatus} ${invoiceOutstanding(invoice) === 0 ? styles.invoiceRowPaid : ""}`}>
                  {invoiceOutstanding(invoice) === 0 ? "Paid" : INVOICE_STATUS_LABELS[invoice.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link className={styles.primaryAction} href={`/admin/portal/clients/${client.id}/invoices/new`}>Create an invoice <span aria-hidden="true">→</span></Link>
      </section>

      <DocumentPanel clientId={client.id} documents={documents} />

      <section className={styles.detailPanel}>
        <h2>Portal access</h2>
        {members.length === 0 ? (
          <p className={styles.detailEmpty}>Nobody can sign in to this celebration yet.</p>
        ) : (
          <ul className={styles.memberList}>
            {members.map((member) => (
              <li key={member.id}>
                <strong>{member.invited_email || "Linked account"}</strong>
                <span>{member.relationship}</span>
              </li>
            ))}
          </ul>
        )}
        <InviteForm clientId={client.id} />
      </section>
    </main>
  );
}
