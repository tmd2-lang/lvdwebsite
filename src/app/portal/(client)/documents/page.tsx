import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getDocumentsForClient, readableSize } from "@/lib/document-data";
import DocumentBrowser from "./DocumentBrowser";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const documents = await getDocumentsForClient(session.client.id).catch(() => []);

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your files</p>
          <h1>Everything, <em>in one place.</em></h1>
        </div>
        <p>Contracts, proposals, and planning materials for your celebration, ready whenever you need them.</p>
      </header>

      <DocumentBrowser
        documents={documents.map((document) => ({
          id: document.id,
          name: document.name,
          category: document.category,
          note: document.note,
          size: readableSize(document.size_bytes),
          format: (document.name.split(".").pop() || "FILE").toUpperCase().slice(0, 4),
          updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
            .format(new Date(document.created_at)),
        }))}
      />
    </div>
  );
}
