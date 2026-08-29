"use client";

import { useMemo, useState } from "react";
import { portalDocuments } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

export default function DocumentCenter() {
  const [category, setCategory] = useState("All files");
  const [notice, setNotice] = useState("");
  const categories = ["All files", "Contracts", "Design", "Planning", "Invoices"];
  const filtered = useMemo(() => category === "All files" ? portalDocuments : portalDocuments.filter((document) => document.category === category), [category]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  return (
    <>
      <div className={styles.documentToolbar}>
        <div className={styles.filterTabs} aria-label="Filter documents by category">
          {categories.map((item) => <button className={category === item ? styles.filterActive : undefined} type="button" onClick={() => setCategory(item)} key={item}>{item}</button>)}
        </div>
        <button className={styles.secondaryButton} type="button" onClick={() => showNotice("The complete document archive is ready for backend connection.")}>Download all files</button>
      </div>

      <section className={styles.documentGrid} aria-label="Planning documents">
        {filtered.map((document) => (
          <article className={styles.documentCard} key={document.id}>
            <div className={styles.filePreview}><span>{document.format}</span><i aria-hidden="true" /></div>
            <div className={styles.documentInfo}>
              <span>{document.category}</span>
              <h2>{document.name}</h2>
              <p>{document.note}</p>
              <small>Updated {document.updated} · {document.size}</small>
            </div>
            <button type="button" onClick={() => showNotice(`${document.name} will download once file storage is connected.`)} aria-label={`Download ${document.name}`}>↓</button>
          </article>
        ))}
      </section>

      <section className={styles.documentHelp}>
        <div><span aria-hidden="true">?</span><p><strong>Looking for something?</strong><small>Ask the Lady Victoria team and it will appear here once uploaded.</small></p></div>
        <button type="button" onClick={() => showNotice("Client messaging will be connected during the backend phase.")}>Message the studio</button>
      </section>
      <div className={`${styles.toast} ${notice ? styles.toastVisible : ""}`} role="status" aria-live="polite">{notice}</div>
    </>
  );
}
