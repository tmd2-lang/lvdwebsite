"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { normalizePhotographerGallery, type ClientPostEvent } from "@/lib/client-resources-view";
import styles from "./resources.module.css";

export default function PostEventPanel({ clientId, initial, loadError }: { clientId: string; initial: ClientPostEvent | null; loadError?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(initial?.photographer_gallery_url ?? "");
  const [savedUrl, setSavedUrl] = useState(initial?.photographer_gallery_url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const normalized = normalizePhotographerGallery(url);
      setBusy(true);
      const response = await fetch("/api/admin/client-resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, action: "save_gallery", url: normalized ?? "" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the gallery link.");
      setUrl(normalized ?? ""); setSavedUrl(normalized ?? "");
      setMessage(normalized ? "Gallery saved. The gallery-request checklist task is complete." : "Gallery link cleared. Any unchanged automatic checklist completion has been undone.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the gallery link."); }
    finally { setBusy(false); }
  }
  return <section id="photographer-gallery" className={styles.card} aria-labelledby="gallery-heading">
    <p className={styles.eyebrow}>Post-event · Studio only</p><h2 id="gallery-heading">Photographer gallery</h2>
    <p>Keep the photographer’s full gallery here for portfolio and website work. Saving a link completes checklist task LVD-116.</p>
    {loadError && <p role="alert" className={styles.error}>{loadError}</p>}
    <form onSubmit={save}>
      <label htmlFor="photographer-gallery-url">Full gallery link</label>
      <div className={styles.row}><input id="photographer-gallery-url" type="url" inputMode="url" placeholder="https://…" maxLength={2048} value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy || Boolean(loadError)} />
        <button type="submit" disabled={busy || Boolean(loadError)}>{busy ? "Saving…" : "Save gallery link"}</button></div>
      <p className={styles.hint}>Leave blank and save to clear. This link stays with the studio; saving it does not publish photos.</p>
    </form>
    {savedUrl && <a href={savedUrl} target="_blank" rel="noopener noreferrer">Open photographer gallery ↗</a>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {message && <p role="status" className={styles.success}>{message}</p>}
  </section>;
}
