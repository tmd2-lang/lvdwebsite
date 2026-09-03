"use client";

import { useState } from "react";
import { IMAGE_ALBUMS, type ViewableImage } from "@/lib/image-view";
import styles from "../../portal.module.css";

export default function ImageGallery({ images }: { images: ViewableImage[] }) {
  const [album, setAlbum] = useState<string>("All");
  const [open, setOpen] = useState<ViewableImage | null>(null);

  // Only offer a filter for albums that actually hold something.
  const albums = ["All", ...IMAGE_ALBUMS.filter((name) => images.some((image) => image.album === name))];
  const shown = album === "All" ? images : images.filter((image) => image.album === album);

  if (images.length === 0) {
    return (
      <div className={styles.documentEmpty}>
        <h2>Nothing here yet.</h2>
        <p>Your inspiration boards and event galleries will appear here as we build them together.</p>
      </div>
    );
  }

  return (
    <>
      {albums.length > 2 && (
        <div className={styles.filterTabs}>
          {albums.map((name) => (
            <button key={name} type="button" className={album === name ? styles.customCheck : undefined} onClick={() => setAlbum(name)}>
              {name}
            </button>
          ))}
        </div>
      )}

      <ul className={styles.portalImageGrid}>
        {shown.map((image) => (
          <li key={image.id}>
            <button type="button" onClick={() => setOpen(image)} aria-label={`Open ${image.name}`}>
              {image.url ? (
                // Signed storage links expire, so Next's optimiser cannot cache these.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt={image.name} loading="lazy" width={image.width || undefined} height={image.height || undefined} />
              ) : (
                <span className={styles.portalImageMissing}>Preview unavailable</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={open.name} onClick={() => setOpen(null)}>
          <div className={styles.portalImageViewer} onClick={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={() => setOpen(null)} aria-label="Close">×</button>
            {open.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.url} alt={open.name} />
            )}
            <div className={styles.portalImageCaption}>
              <strong>{open.name}</strong>
              {open.note && <p>{open.note}</p>}
              <small>{open.album}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
