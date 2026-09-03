"use client";

import { useMemo, useState } from "react";
import { IMAGE_ALBUMS, type ViewableImage } from "@/lib/image-view";
import styles from "../../portal.module.css";

const ALL = "All images";

export default function ImageGallery({ images }: { images: ViewableImage[] }) {
  const [album, setAlbum] = useState(ALL);
  const [open, setOpen] = useState<ViewableImage | null>(null);

  const filtered = useMemo(
    () => (album === ALL ? images : images.filter((image) => image.album === album)),
    [album, images],
  );

  return (
    <>
      {/* Same toolbar the Documents page uses: every album is always offered,
          so the shape of the page does not change as images arrive. */}
      <div className={styles.documentToolbar}>
        <div className={styles.filterTabs} aria-label="Filter images by album">
          {[ALL, ...IMAGE_ALBUMS].map((item) => (
            <button
              className={album === item ? styles.filterActive : undefined}
              type="button"
              onClick={() => setAlbum(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <section className={styles.documentEmpty}>
          <strong>{images.length === 0 ? "Nothing here yet" : "Nothing in this album"}</strong>
          <span>
            {images.length === 0
              ? "As the studio shares inspiration, design references, and photographs, they will appear here."
              : "Try another album."}
          </span>
        </section>
      ) : (
        <section className={styles.documentGrid} aria-label="Celebration images">
          {filtered.map((image) => (
            <article className={styles.documentCard} key={image.id}>
              <button
                type="button"
                className={styles.imageCardPreview}
                onClick={() => setOpen(image)}
                aria-label={`Open ${image.name}`}
              >
                {image.url ? (
                  // Signed storage links expire, so Next's optimiser cannot cache these.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={image.name} loading="lazy" />
                ) : (
                  <span className={styles.portalImageMissing}>Preview unavailable</span>
                )}
              </button>
              <div className={styles.imageCardInfo}>
                <span>{image.album}</span>
                <h2 title={image.note || image.name}>{image.note || image.name}</h2>
                <small>
                  Added {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
                    .format(new Date(image.created_at))}
                </small>
              </div>
            </article>
          ))}
        </section>
      )}

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={open.name} onClick={() => setOpen(null)}>
          <div className={styles.portalImageViewer} onClick={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={() => setOpen(null)} aria-label="Close">×</button>
            {open.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.url} alt={open.name} />
            )}
            <div className={styles.portalImageCaption}>
              <strong>{open.note || open.name}</strong>
              <small>{open.album}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
