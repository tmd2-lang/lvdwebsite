"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DOCUMENT_CATEGORIES, readableSize, type ClientDocument } from "@/lib/document-data";
import styles from "../../portal-admin.module.css";

export default function DocumentPanel({
  clientId,
  documents,
  removedDocuments,
}: {
  clientId: string;
  documents: ClientDocument[];
  removedDocuments: ClientDocument[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // Two-step delete instead of window.confirm(): embedded browsers suppress the
  // native dialog and silently return false, so the click did nothing at all.
  const [confirming, setConfirming] = useState("");
  const [purging, setPurging] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  // The last removal, kept so it can be put back without hunting for it.
  const [undoable, setUndoable] = useState<{ id: string; name: string } | null>(null);

  // Restoring the last removed document takes the toggle away with it, so the
  // trash view is only ever active while there is something in it.
  const inTrash = showRemoved && removedDocuments.length > 0;

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
    if (confirming !== id) {
      setConfirming(id);
      return;
    }
    setConfirming("");
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove that document.");
      setUndoable({ id, name });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove that document.");
    }
  }

  async function restore(id: string, name: string) {
    setError("");
    try {
      const response = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, restore: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not bring that document back.");
      setUndoable(null);
      setMessage(`${name} restored.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not bring that document back.");
    }
  }

  /** Destroys the file and the row. There is no coming back from this one. */
  async function purge(id: string, name: string) {
    if (purging !== id) {
      setPurging(id);
      return;
    }
    setPurging("");
    setError("");
    try {
      const response = await fetch(`/api/admin/documents?id=${encodeURIComponent(id)}&purge=true`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not delete that document.");
      setMessage(`${name} deleted for good.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete that document.");
    }
  }

  return (
    <section className={styles.detailPanel}>
      <div className={styles.documentPanelHeader}>
        <h2>Documents</h2>
        {removedDocuments.length > 0 && (
          <button
            type="button"
            className={inTrash ? styles.imageFilterActive : undefined}
            onClick={() => setShowRemoved((current) => !current)}
          >
            {inTrash ? "Back to documents" : `Removed (${removedDocuments.length})`}
          </button>
        )}
      </div>

      {undoable && (
        <div className={styles.undoBar} role="status">
          <span>&ldquo;{undoable.name}&rdquo; removed.</span>
          <button type="button" onClick={() => void restore(undoable.id, undoable.name)}>Undo</button>
          <button type="button" onClick={() => setUndoable(null)} aria-label="Dismiss">Dismiss</button>
        </div>
      )}

      {inTrash ? (
        <ul className={styles.documentRows}>
          {removedDocuments.map((document) => (
            <li key={document.id}>
              <div>
                <strong>{document.name}</strong>
                <small>{document.category} · {readableSize(document.size_bytes)}</small>
              </div>
              <button type="button" onClick={() => void restore(document.id, document.name)}>Restore</button>
              <button
                type="button"
                className={purging === document.id ? styles.imageConfirm : undefined}
                onClick={() => void purge(document.id, document.name)}
                onBlur={() => setPurging((current) => (current === document.id ? "" : current))}
                aria-label={purging === document.id ? `Confirm deleting ${document.name} for good` : `Delete ${document.name} for good`}
              >
                {purging === document.id ? "Tap again" : "Delete forever"}
              </button>
            </li>
          ))}
        </ul>
      ) : documents.length === 0 ? (
        <p className={styles.detailEmpty}>No documents yet.</p>
      ) : (
        <ul className={styles.documentRows}>
          {documents.map((document) => (
            <li key={document.id}>
              <div>
                <strong>{document.name}</strong>
                <small>{document.category} · {readableSize(document.size_bytes)}{document.note ? ` · ${document.note}` : ""}</small>
              </div>
              <button
                type="button"
                className={confirming === document.id ? styles.imageConfirm : undefined}
                onClick={() => void remove(document.id, document.name)}
                onBlur={() => setConfirming((current) => (current === document.id ? "" : current))}
                aria-label={confirming === document.id ? `Confirm removing ${document.name}` : `Remove ${document.name}`}
              >
                {confirming === document.id ? "Tap again" : "Remove"}
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
