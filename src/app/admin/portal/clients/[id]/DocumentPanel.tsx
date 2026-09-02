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
    const fields = new FormData(form);
    const files = fields.getAll("file").filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      setError("Choose at least one file to upload.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    // One request per file so a single bad file cannot fail the whole batch.
    const failures: string[] = [];
    let uploaded = 0;

    for (const [index, file] of files.entries()) {
      setMessage(`Uploading ${index + 1} of ${files.length}…`);

      const data = new FormData();
      data.set("clientId", clientId);
      data.set("file", file);
      data.set("category", String(fields.get("category") || "Planning"));
      data.set("note", String(fields.get("note") || ""));
      // A typed name only makes sense for a single file; a batch keeps its own file names.
      if (files.length === 1) data.set("name", String(fields.get("name") || ""));

      try {
        const response = await fetch("/api/admin/documents", { method: "POST", body: data });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Could not upload that file.");
        uploaded += 1;
      } catch (caught) {
        failures.push(`${file.name} — ${caught instanceof Error ? caught.message : "upload failed"}`);
      }
    }

    setError(failures.length > 0 ? `Could not upload: ${failures.join("; ")}` : "");
    setMessage(uploaded > 0 ? `${uploaded} ${uploaded === 1 ? "file" : "files"} uploaded.` : "");
    if (failures.length === 0) form.reset();
    setBusy(false);
    router.refresh();
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
            <span>Files</span>
            <input name="file" type="file" multiple required disabled={busy} />
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
            <input name="name" placeholder="Single file only — otherwise file names are used" disabled={busy} />
          </label>
          <label>
            <span>Note</span>
            <input name="note" placeholder="Optional" disabled={busy} />
          </label>
        </div>
        <div className={styles.uploadActions}>
          <p>Select several files at once. Up to 25 MB each. Only this celebration can open them.</p>
          <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload documents"}</button>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        {message && <p className={styles.formSuccess} role="status">{message}</p>}
      </form>
    </section>
  );
}
