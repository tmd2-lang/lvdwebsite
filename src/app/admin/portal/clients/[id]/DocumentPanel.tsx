"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DOCUMENT_CATEGORIES, readableSize, type ClientDocument } from "@/lib/document-data";
import styles from "../../portal-admin.module.css";

export default function DocumentPanel({
  clientId,
  documents,
}: {
  clientId: string;
  documents: ClientDocument[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("clientId", clientId);
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/documents", { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not upload that file.");
      setMessage(`${result.document?.name || "File"} uploaded.`);
      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload that file.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Remove "${name}"? The client will no longer see it.`)) return;
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove that document.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove that document.");
    }
  }

  return (
    <section className={styles.detailPanel}>
      <h2>Documents</h2>

      {documents.length === 0 ? (
        <p className={styles.detailEmpty}>No documents yet.</p>
      ) : (
        <ul className={styles.documentRows}>
          {documents.map((document) => (
            <li key={document.id}>
              <div>
                <strong>{document.name}</strong>
                <small>{document.category} · {readableSize(document.size_bytes)}{document.note ? ` · ${document.note}` : ""}</small>
              </div>
              <button type="button" onClick={() => void remove(document.id, document.name)} aria-label={`Remove ${document.name}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.uploadForm} onSubmit={upload}>
        <div className={styles.uploadRow}>
          <label className={styles.fileField}>
            <span>File</span>
            <input name="file" type="file" required disabled={busy} />
          </label>
          <label>
            <span>Category</span>
            <select name="category" defaultValue="Planning" disabled={busy}>
              {DOCUMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.uploadRow}>
          <label>
            <span>Name shown to the client</span>
            <input name="name" placeholder="Leave empty to use the file name" disabled={busy} />
          </label>
          <label>
            <span>Note</span>
            <input name="note" placeholder="Optional" disabled={busy} />
          </label>
        </div>
        <div className={styles.uploadActions}>
          <p>Up to 25 MB. Only this celebration can open it.</p>
          <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload document"}</button>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        {message && <p className={styles.formSuccess} role="status">{message}</p>}
      </form>
    </section>
  );
}
