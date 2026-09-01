import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import NewClientForm from "./NewClientForm";
import styles from "../../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/portal/clients/new");
    redirect("/admin/login");
  }

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href="/admin/portal/clients"><span aria-hidden="true">←</span> All clients</Link>
        <p className={styles.eyebrow}>New celebration</p>
        <h1>Create a client.</h1>
        <p className={styles.formIntro}>
          Their portal, invoices, documents, and gallery all connect back to this record.
        </p>
      </div>
      <NewClientForm />
    </main>
  );
}
