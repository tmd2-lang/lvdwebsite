"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import GalleryManager from "./GalleryManager";
import styles from "./media-admin.module.css";

export type Slot = {
  id: string;
  label: string;
  group: string;
  note: string;
  value: string;
};

export type Asset = {
  src: string;
  name: string;
  folder: string;
};

type MediaResponse = {
  writable: boolean;
  slots: Slot[];
  assets: Asset[];
};

const PAGE_SIZE = 80;

async function responseJson<T>(response: Response): Promise<T> {
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Something went wrong.");
  return payload;
}

export default function MediaAdmin() {
  const [activeWorkspace, setActiveWorkspace] = useState<"site" | "gallery">("site");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("All folders");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [dragSlot, setDragSlot] = useState<string | null>(null);
  const [pendingUploadSlot, setPendingUploadSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/media", { cache: "no-store" })
      .then((response) => responseJson<MediaResponse>(response))
      .then((data) => {
        setSlots(data.slots);
        setAssets(data.assets);
      })
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => ["All", ...new Set(slots.map((slot) => slot.group))], [slots]);
  const folders = useMemo(() => ["All folders", ...new Set(assets.map((asset) => asset.folder))], [assets]);
  const displayedSlots = activeGroup === "All" ? slots : slots.filter((slot) => slot.group === activeGroup);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesFolder = folder === "All folders" || asset.folder === folder;
      const matchesSearch = !query || asset.src.toLowerCase().includes(query);
      return matchesFolder && matchesSearch;
    });
  }, [assets, folder, search]);

  function announce(text: string) {
    setError(null);
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3200);
  }

  async function assignImage(slot: Slot, src: string) {
    setBusySlot(slot.id);
    setError(null);
    try {
      await responseJson(await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, src })
      }));
      setSlots((current) => current.map((item) => item.id === slot.id ? { ...item, value: src } : item));
      setActiveSlot(null);
      announce(`${slot.label} updated.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update that image.");
    } finally {
      setBusySlot(null);
    }
  }

  async function uploadImage(file: File, slotId: string | null) {
    setBusySlot(slotId || "library");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (slotId) formData.append("slotId", slotId);

      const result = await responseJson<{ asset: Asset; slotId: string | null }>(await fetch("/api/media", {
        method: "POST",
        body: formData
      }));

      setAssets((current) => [result.asset, ...current]);
      if (result.slotId) {
        setSlots((current) => current.map((slot) => slot.id === result.slotId ? { ...slot, value: result.asset.src } : slot));
        setActiveSlot(null);
        const target = slots.find((slot) => slot.id === result.slotId);
        announce(`${target?.label || "Image"} uploaded and updated.`);
      } else {
        announce("Image added to your media library.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload that image.");
    } finally {
      setBusySlot(null);
      setPendingUploadSlot(null);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  function openUpload(slotId: string | null) {
    setPendingUploadSlot(slotId);
    uploadInputRef.current?.click();
  }

  function openLibrary(slot: Slot) {
    setSearch("");
    setFolder("All folders");
    setVisibleCount(PAGE_SIZE);
    setActiveSlot(slot);
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadImage(file, pendingUploadSlot);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, slot: Slot) {
    event.preventDefault();
    setDragSlot(null);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadImage(file, slot.id);
  }

  return (
    <main className={styles.shell} data-lenis-prevent>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className={styles.hiddenInput}
        onChange={handleUploadChange}
      />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Lady Victoria Designs</p>
          <h1>Media Studio</h1>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.localBadge}>Local editor</span>
          {activeWorkspace === "site" && (
            <button type="button" className={styles.secondaryButton} onClick={() => openUpload(null)} disabled={Boolean(busySlot)}>
              Upload to library
            </button>
          )}
          <Link href={activeWorkspace === "gallery" ? "/gallery" : "/"} target="_blank" className={styles.primaryButton}>
            {activeWorkspace === "gallery" ? "View gallery" : "View site"}
          </Link>
        </div>
      </header>

      <nav className={styles.workspaceTabs} aria-label="Media Studio views">
        <button type="button" className={activeWorkspace === "site" ? styles.workspaceTabActive : styles.workspaceTab} onClick={() => setActiveWorkspace("site")}>
          Site images
        </button>
        <button type="button" className={activeWorkspace === "gallery" ? styles.workspaceTabActive : styles.workspaceTab} onClick={() => setActiveWorkspace("gallery")}>
          Gallery
        </button>
      </nav>

      {activeWorkspace === "site" ? <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Page sections">
          <p className={styles.sidebarLabel}>Site sections</p>
          <nav className={styles.groupNav}>
            {groups.map((group) => {
              const count = group === "All" ? slots.length : slots.filter((slot) => slot.group === group).length;
              return (
                <button
                  type="button"
                  key={group}
                  className={activeGroup === group ? styles.groupButtonActive : styles.groupButton}
                  onClick={() => setActiveGroup(group)}
                >
                  <span>{group}</span>
                  <span>{count}</span>
                </button>
              );
            })}
          </nav>
          <div className={styles.sidebarNote}>
            <strong>Publish workflow</strong>
            <span>Make changes here, then commit and push them with the rest of the site.</span>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.contentHeading}>
            <div>
              <p className={styles.eyebrow}>{activeGroup === "All" ? "All pages" : activeGroup}</p>
              <h2>{activeGroup === "All" ? "Editable images" : `${activeGroup} images`}</h2>
              <p>Choose from the library or drop a new image directly onto any slot.</p>
            </div>
            <span className={styles.slotCount}>{displayedSlots.length} slots</span>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Loading your media library...</div>
          ) : error && slots.length === 0 ? (
            <div className={styles.errorState}>{error}</div>
          ) : (
            <div className={styles.slotGrid}>
              {displayedSlots.map((slot) => (
                <article key={slot.id} className={styles.slotCard}>
                  <div
                    className={`${styles.slotPreview} ${dragSlot === slot.id ? styles.slotPreviewDragging : ""}`}
                    onDragEnter={(event) => { event.preventDefault(); setDragSlot(slot.id); }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragSlot(null);
                    }}
                    onDrop={(event) => handleDrop(event, slot)}
                  >
                    <Image src={slot.value} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" className={styles.slotImage} />
                    <div className={styles.dropOverlay}>Drop to replace</div>
                    {busySlot === slot.id && <div className={styles.busyOverlay}>Saving...</div>}
                  </div>
                  <div className={styles.slotBody}>
                    <div className={styles.slotTitleRow}>
                      <div>
                        <h3>{slot.label}</h3>
                        <p>{slot.note}</p>
                      </div>
                      <span>{slot.group}</span>
                    </div>
                    <p className={styles.filePath} title={slot.value}>{slot.value}</p>
                    <div className={styles.slotActions}>
                      <button type="button" onClick={() => openLibrary(slot)} disabled={busySlot === slot.id}>Choose from library</button>
                      <button type="button" onClick={() => openUpload(slot.id)} disabled={busySlot === slot.id}>Upload new</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div> : (
        <GalleryManager
          assets={assets}
          slots={slots}
          onAssetAdded={(asset) => setAssets((current) => [asset, ...current.filter((item) => item.src !== asset.src)])}
          onAssetDeleted={(src) => setAssets((current) => current.filter((asset) => asset.src !== src))}
        />
      )}

      {activeWorkspace === "site" && activeSlot && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveSlot(null);
        }}>
          <section className={styles.libraryModal} role="dialog" aria-modal="true" aria-labelledby="library-title">
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Replacing</p>
                <h2 id="library-title">{activeSlot.label}</h2>
              </div>
              <div className={styles.modalHeaderActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => openUpload(activeSlot.id)} disabled={Boolean(busySlot)}>
                  Upload new
                </button>
                <button type="button" className={styles.closeButton} onClick={() => setActiveSlot(null)} aria-label="Close media library" title="Close">×</button>
              </div>
            </div>

            <div className={styles.libraryToolbar}>
              <label>
                <span>Search</span>
                <input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search filenames and folders" autoFocus />
              </label>
              <label>
                <span>Folder</span>
                <select value={folder} onChange={(event) => { setFolder(event.target.value); setVisibleCount(PAGE_SIZE); }}>
                  {folders.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <p>{filteredAssets.length} images</p>
            </div>

            <div className={styles.libraryGrid}>
              {filteredAssets.slice(0, visibleCount).map((asset) => {
                const selected = asset.src === activeSlot.value;
                return (
                  <button
                    type="button"
                    key={asset.src}
                    className={selected ? styles.assetSelected : styles.asset}
                    onClick={() => void assignImage(activeSlot, asset.src)}
                    disabled={Boolean(busySlot)}
                    title={asset.src}
                  >
                    <span className={styles.assetImageWrap}>
                      <Image src={asset.src} alt={asset.name} fill sizes="180px" className={styles.assetImage} />
                    </span>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetFolder}>{asset.folder}</span>
                    {selected && <span className={styles.selectedMark}>Current</span>}
                  </button>
                );
              })}
            </div>

            {filteredAssets.length === 0 && <div className={styles.emptyState}>No images match those filters.</div>}
            {visibleCount < filteredAssets.length && (
              <button type="button" className={styles.loadMore} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Load more images
              </button>
            )}
          </section>
        </div>
      )}

      {(message || (error && slots.length > 0)) && (
        <div className={error ? styles.toastError : styles.toast} role="status">
          {error || message}
          {error && <button type="button" onClick={() => setError(null)} aria-label="Dismiss message">×</button>}
        </div>
      )}
    </main>
  );
}
