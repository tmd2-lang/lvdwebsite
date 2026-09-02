import Link from "next/link";
import { getClients } from "@/lib/client-data";
import { getDocuments, readableSize } from "@/lib/document-data";
import styles from "../portal-admin.module.css";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [documents, clients] = await Promise.all([
    getDocuments().catch(() => []),
    getClients().catch(() => []),
  ]);
  const clientNames = new Map(clients.map((client) => [client.id, client.display_name]));

  return (
    <main className={styles.libraryPage}>
      <header className={styles.libraryHeader}>
        <div><p className={styles.eyebrow}>Document administration</p><h1>Documents</h1><p>Contracts, proposals, floorplans, and planning files live here.</p></div>
        <Link className={styles.newClientAction} href="/admin/portal/clients">Choose a client</Link>
      </header>

      {documents.length === 0 ? (
        <section className={styles.libraryEmpty}>
          <span aria-hidden="true">02</span>
          <div><p className={styles.eyebrow}>Nothing here yet</p><h2>No documents have been uploaded.</h2><p>Open a client record to add their first private file.</p></div>
          <Link href="/admin/portal/clients">View clients <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <section className={styles.libraryPanel}>
          <div className={styles.libraryTableHeader}><span>Document</span><span>Client</span><span>Category</span><span>Size</span></div>
          <div className={styles.libraryRows}>
            {documents.map((document) => (
              <Link href={`/admin/portal/clients/${document.client_id}`} key={document.id}>
                <div><strong>{document.name}</strong><small>{new Date(document.created_at).toLocaleDateString("en-US")}</small></div>
                <span>{clientNames.get(document.client_id) || "Client record"}</span>
                <span>{document.category}</span>
                <b>{readableSize(document.size_bytes)}</b>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
