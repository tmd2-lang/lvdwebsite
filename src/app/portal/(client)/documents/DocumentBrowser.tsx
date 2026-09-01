"use client";

import { useMemo, useState } from "react";
import styles from "@/app/portal/portal.module.css";

type DocumentCard = {
  id: string;
  name: string;
  category: string;
  note: string | null;
  size: string;
  format: string;
  updated: string;
};

const CATEGORIES = ["All files", "Contracts", "Design", "Planning", "Invoices"];

export default function DocumentBrowser({ documents }: { documents: DocumentCard[] }) {
  const [category, setCategory] = useState("All files");

  const filtered = useMemo(
    () => category === "All files" ? documents : documents.filter((d) => d.category === category),
    [category, documents],
  );

  return (
    <>
      <div className={styles.documentToolbar}>
        <div className={styles.filterTabs} aria-label="Filter documents by category">
          {CATEGORIES.map((item) => (
            <button
              className={category === item ? styles.filterActive : undefined}
              type="button"
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <section className={styles.documentEmpty}>
          <strong>{documents.length === 0 ? "Nothing here yet" : "Nothing in this category"}</strong>
          <span>
            {documents.length === 0
              ? "As the studio shares contracts, proposals, and planning materials, they will appear here."
              : "Try another category."}
          </span>
        </section>
      ) : (
        <section className={styles.documentGrid} aria-label="Planning documents">
          {filtered.map((document) => (
            <article className={styles.documentCard} key={document.id}>
              <div className={styles.filePreview}><span>{document.format}</span><i aria-hidden="true" /></div>
              <div className={styles.documentInfo}>
                <span>{document.category}</span>
                <h2>{document.name}</h2>
                {document.note && <p>{document.note}</p>}
                <small>Added {document.updated} · {document.size}</small>
              </div>
              <a
                href={`/api/portal/documents/${document.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${document.name}`}
              >
                ↓
              </a>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
