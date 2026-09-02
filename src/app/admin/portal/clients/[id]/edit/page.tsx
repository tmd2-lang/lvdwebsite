import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/client-data";
import EditClientForm from "./EditClientForm";
import styles from "../../../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <main className={styles.formShell}>
      <div className={styles.formHeader}>
        <Link className={styles.backLink} href={`/admin/portal/clients/${client.id}`}><span aria-hidden="true">←</span> {client.display_name}</Link>
        <p className={styles.eyebrow}>Client record</p>
        <h1>Edit the details.</h1>
        <p className={styles.formIntro}>Update what Tanah and the client see across this planning portal.</p>
      </div>
      <EditClientForm client={client} />
    </main>
  );
}
