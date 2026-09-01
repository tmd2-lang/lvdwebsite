import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import NewInvoiceForm from "./NewInvoiceForm";
import styles from "../../../../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  const { id } = await params;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=/admin/portal/clients/${id}/invoices/new`);
    redirect("/admin/login");
  }

  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href={`/admin/portal/clients/${client.id}`}><span aria-hidden="true">←</span> {client.display_name}</Link>
        <p className={styles.eyebrow}>New invoice</p>
        <h1>Bill this celebration.</h1>
        <p className={styles.formIntro}>
          It appears in their portal as soon as you save it, and the totals update on their own.
        </p>
      </div>
      <NewInvoiceForm clientId={client.id} clientName={client.partner_one_name} />
    </main>
  );
}
