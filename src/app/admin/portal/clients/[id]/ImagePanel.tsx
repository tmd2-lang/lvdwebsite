"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { IMAGE_ALBUMS, readableImageSize, type ViewableImage } from "@/lib/image-view";
import styles from "../../portal-admin.module.css";

/**
 * Reads the picture's real dimensions in the browser. Storage cannot measure
 * an image, and knowing the shape up front lets the grid reserve the right
 * space instead of jumping about as each one arrives.
 */
function measure(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth || null, height: image.naturalHeight || null });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: null, height: null });
    };
    image.src = objectUrl;
  });
}

const REMOVED = "Removed";

export default function ImagePanel({
  clientId,
  images,
  removedImages,
}: {
  clientId: string;
  images: ViewableImage[];
  removedImages: ViewableImage[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [album, setAlbum] = useState<string>("All");
  // Two-step delete instead of window.confirm(): embedded browsers suppress the
  // native dialog and silently return false, so the click did nothing at all.
  const [confirming, setConfirming] = useState<string>("");
  // The last removal, kept so it can be put back. Removal is reversible: the
  // file stays in storage and only the row is stamped as deleted.
  const [undoable, setUndoable] = useState<{ id: string; name: string } | null>(null);
  const [purging, setPurging] = useState<string>("");

  // Restoring the last removed image takes the Removed chip away with it, so
  // the trash view is only ever active while there is something in it.
  const inTrash = album === REMOVED && removedImages.length > 0;
  const shown = inTrash
    ? removedImages
    : album === "All" || album === REMOVED
      ? images
      : images.filter((image) => image.album === album);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const files = fields.getAll("file").filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      setError("Choose at least one image to upload.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    // One request per image so a single bad file cannot fail the whole board.
    const failures: string[] = [];
    let uploaded = 0;

    for (const [index, file] of files.entries()) {
      setMessage(`Uploading ${index + 1} of ${files.length}…`);
      const { width, height } = await measure(file);

      const data = new FormData();
      data.set("clientId", clientId);
      data.set("file", file);
      data.set("album", String(fields.get("album") || "Inspiration"));
      data.set("note", String(fields.get("note") || ""));
      if (width) data.set("width", String(width));
      if (height) data.set("height", String(height));

      try {
        const response = await fetch("/api/admin/images", { method: "POST", body: data });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Could not upload that image.");
        uploaded += 1;
      } catch (caught) {
        failures.push(caught instanceof Error ? caught.message : `${file.name} failed`);
      }
    }

    setError(failures.length > 0 ? failures.join(" ") : "");
    setMessage(uploaded > 0 ? `${uploaded} ${uploaded === 1 ? "image" : "images"} uploaded.` : "");
    if (failures.length === 0) form.reset();
    setBusy(false);
    router.refresh();
  }

  async function toggleVisibility(image: ViewableImage) {
    setError("");
    try {
      const response = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, visibleToClient: !image.visible_to_client }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not update that image.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update that image.");
    }
  }

  async function remove(image: ViewableImage) {
    if (confirming !== image.id) {
      setConfirming(image.id);
      return;
    }
    setConfirming("");
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/images?id=${encodeURIComponent(image.id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not remove that image.");
      setUndoable({ id: image.id, name: image.name });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove that image.");
    }
  }

  /** Destroys the file and the row. There is no coming back from this one. */
  async function purge(image: ViewableImage) {
    if (purging !== image.id) {
      setPurging(image.id);
      return;
    }
    setPurging("");
    setError("");
    try {
      const response = await fetch(`/api/admin/images?id=${encodeURIComponent(image.id)}&purge=true`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not delete that image.");
      setMessage(`${image.name} deleted for good.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete that image.");
    }
  }

  async function restore(image: ViewableImage) {
    setError("");
    try {
      const response = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, restore: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not bring that image back.");
      setMessage(`${image.name} restored.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not bring that image back.");
    }
  }

  async function undoRemove() {
    if (!undoable) return;
    setError("");
    try {
      const response = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: undoable.id, restore: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not bring that image back.");
      setUndoable(null);
      setMessage(`${undoable.name} restored.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not bring that image back.");
    }
  }

  return (
    <section className={styles.workspaceCard}>
      <div className={`${styles.workspaceCardHeader} ${styles.imageCardHeader}`}>
        <div><p className={styles.eyebrow}>Visual library</p><h2>Client Images</h2></div>
        <div className={styles.imageFilter}>
          {["All", ...IMAGE_ALBUMS, ...(removedImages.length > 0 ? [REMOVED] : [])].map((name) => (
            <button
              key={name}
              type="button"
              className={album === name ? styles.imageFilterActive : undefined}
              onClick={() => setAlbum(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {undoable && (
        <div className={styles.undoBar} role="status">
          <span>&ldquo;{undoable.name}&rdquo; removed.</span>
          <button type="button" onClick={() => void undoRemove()}>Undo</button>
          <button type="button" onClick={() => setUndoable(null)} aria-label="Dismiss">Dismiss</button>
        </div>
      )}

      {shown.length === 0 ? (
        <div className={styles.workspaceEmpty}>
          <span>＋</span>
          <h3>{images.length === 0 ? "No images yet." : `Nothing in ${album}.`}</h3>
          <p>Inspiration and gallery uploads stay attached to this client.</p>
        </div>
      ) : (
        <ul className={styles.imageGrid}>
          {shown.map((image) => (
            <li key={image.id} className={image.visible_to_client ? undefined : styles.imageHidden}>
              <figure>
                {image.url ? (
                  // Signed storage links expire, so Next's optimiser cannot cache these.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={image.name} loading="lazy" width={image.width || undefined} height={image.height || undefined} />
                ) : (
                  <div className={styles.imageMissing}>Preview unavailable</div>
                )}
                <figcaption>
                  <strong title={image.name}>{image.name}</strong>
                  <small>{image.album} · {readableImageSize(image.size_bytes)}</small>
                </figcaption>
              </figure>
              <div className={styles.imageActions}>
                {inTrash ? (
                  <>
                    <button type="button" onClick={() => void restore(image)}>Restore</button>
                    <button
                      type="button"
                      className={purging === image.id ? styles.imageConfirm : undefined}
                      onClick={() => void purge(image)}
                      onBlur={() => setPurging((current) => (current === image.id ? "" : current))}
                      aria-label={purging === image.id ? `Confirm deleting ${image.name} for good` : `Delete ${image.name} for good`}
                    >
                      {purging === image.id ? "Tap again" : "Delete forever"}
                    </button>
                  </>
                ) : (
                  <>
                <button type="button" onClick={() => void toggleVisibility(image)}>
                  {image.visible_to_client ? "Hide from couple" : "Show to couple"}
                </button>
                <button
                  type="button"
                  className={confirming === image.id ? styles.imageConfirm : undefined}
                  onClick={() => void remove(image)}
                  onBlur={() => setConfirming((current) => (current === image.id ? "" : current))}
                  aria-label={confirming === image.id ? `Confirm removing ${image.name}` : `Remove ${image.name}`}
                >
                  {confirming === image.id ? "Tap again" : "Remove"}
                </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.uploadForm} onSubmit={(event) => void upload(event)}>
        <div className={styles.uploadRow}>
          <label className={styles.fileField}>
            <span>Images</span>
            <input name="file" type="file" accept="image/*" multiple required disabled={busy} />
          </label>
          <label>
            <span>Album</span>
            <select name="album" defaultValue="Inspiration" disabled={busy}>
              {IMAGE_ALBUMS.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.uploadRow}>
          <label>
            <span>Note</span>
            <input name="note" placeholder="Optional — applies to everything in this upload" disabled={busy} />
          </label>
        </div>
        <div className={styles.uploadActions}>
          <p>Select several at once. Up to 15 MB each. Only this celebration can open them.</p>
          <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload images"}</button>
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        {message && <p className={styles.formSuccess} role="status">{message}</p>}
      </form>
    </section>
  );
}
