"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { GALLERY_CATEGORIES, type GalleryConfig, type ManagedGalleryImage } from "@/lib/gallery-types";
import type { Asset, Slot } from "./MediaAdmin";
import styles from "./media-admin.module.css";

type Props = {
  assets: Asset[];
  slots: Slot[];
  onAssetAdded: (asset: Asset) => void;
  onAssetDeleted: (src: string) => void;
};

type GalleryResponse = {
  config: GalleryConfig;
  selectedSlug?: string;
  asset?: Asset;
  error?: string;
  usages?: string[];
};

type CollectionForm = {
  mode: "create" | "edit";
  name: string;
  defaultCategory: string;
} | null;

type DeleteCandidate = {
  image: ManagedGalleryImage;
  usages: string[];
};

const LIBRARY_PAGE_SIZE = 80;

async function readResponse(response: Response) {
  const payload = await response.json() as GalleryResponse;
  if (!response.ok) {
    const error = new Error(payload.error || "Could not update the gallery.");
    Object.assign(error, { usages: payload.usages });
    throw error;
  }
  return payload;
}

export default function GalleryManager({ assets, slots, onAssetAdded, onAssetDeleted }: Props) {
  const [config, setConfig] = useState<GalleryConfig>({ collections: [] });
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionForm>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryFolder, setLibraryFolder] = useState("All folders");
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(LIBRARY_PAGE_SIZE);
  const [draggedSrc, setDraggedSrc] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<DeleteCandidate | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then(readResponse)
      .then((payload) => {
        setConfig(payload.config);
        setSelectedSlug(payload.config.collections[0]?.slug || "");
      })
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedCollection = useMemo(
    () => config.collections.find((collection) => collection.slug === selectedSlug) || null,
    [config, selectedSlug]
  );
  const folders = useMemo(() => ["All folders", ...new Set(assets.map((asset) => asset.folder))], [assets]);
  const collectionSources = useMemo(
    () => new Set(selectedCollection?.images.map((image) => image.src) || []),
    [selectedCollection]
  );
  const filteredAssets = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesFolder = libraryFolder === "All folders" || asset.folder === libraryFolder;
      const matchesSearch = !query || asset.src.toLowerCase().includes(query);
      return matchesFolder && matchesSearch;
    });
  }, [assets, libraryFolder, librarySearch]);

  function announce(text: string) {
    setError(null);
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3200);
  }

  async function patchGallery(body: Record<string, unknown>, successMessage?: string) {
    setBusyKey(String(body.src || body.action || "gallery"));
    setError(null);
    try {
      const payload = await readResponse(await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }));
      setConfig(payload.config);
      if (payload.selectedSlug) setSelectedSlug(payload.selectedSlug);
      if (successMessage) announce(successMessage);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the gallery.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  function openLibrary() {
    setLibrarySearch("");
    setLibraryFolder("All folders");
    setLibraryVisibleCount(LIBRARY_PAGE_SIZE);
    setLibraryOpen(true);
  }

  async function addFromLibrary(src: string) {
    if (!selectedCollection) return;
    await patchGallery(
      { action: "add-image", slug: selectedCollection.slug, src },
      collectionSources.has(src) ? undefined : "Image added to the collection."
    );
  }

  async function uploadImages(files: FileList) {
    if (!selectedCollection) return;
    setBusyKey("upload");
    setError(null);
    let uploaded = 0;

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", selectedCollection.slug);
        const payload = await readResponse(await fetch("/api/gallery", { method: "POST", body: formData }));
        setConfig(payload.config);
        if (payload.asset) onAssetAdded(payload.asset);
        uploaded += 1;
      }
      announce(`${uploaded} ${uploaded === 1 ? "image" : "images"} uploaded.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload those images.");
    } finally {
      setBusyKey(null);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) void uploadImages(event.target.files);
  }

  async function submitCollectionForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!collectionForm) return;

    const body = collectionForm.mode === "create"
      ? { action: "create-collection", name: collectionForm.name, defaultCategory: collectionForm.defaultCategory }
      : { action: "update-collection", slug: selectedCollection?.slug, name: collectionForm.name, defaultCategory: collectionForm.defaultCategory };
    const saved = await patchGallery(body, collectionForm.mode === "create" ? "Collection created." : "Collection updated.");
    if (saved) setCollectionForm(null);
  }

  async function reorderImages(targetSrc: string) {
    if (!selectedCollection || !draggedSrc || draggedSrc === targetSrc) return;
    const previousConfig = config;
    const fromIndex = selectedCollection.images.findIndex((image) => image.src === draggedSrc);
    const toIndex = selectedCollection.images.findIndex((image) => image.src === targetSrc);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...selectedCollection.images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setConfig((current) => ({
      collections: current.collections.map((collection) => collection.slug === selectedCollection.slug ? { ...collection, images: reordered } : collection)
    }));
    setDraggedSrc(null);

    const saved = await patchGallery({
      action: "reorder-images",
      slug: selectedCollection.slug,
      orderedSources: reordered.map((image) => image.src)
    }, "Gallery order saved.");
    if (!saved) setConfig(previousConfig);
  }

  async function moveImage(index: number, direction: -1 | 1) {
    if (!selectedCollection) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedCollection.images.length) return;

    const previousConfig = config;
    const reordered = [...selectedCollection.images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setConfig((current) => ({
      collections: current.collections.map((collection) => collection.slug === selectedCollection.slug ? { ...collection, images: reordered } : collection)
    }));

    const saved = await patchGallery({
      action: "reorder-images",
      slug: selectedCollection.slug,
      orderedSources: reordered.map((image) => image.src)
    }, "Gallery order saved.");
    if (!saved) setConfig(previousConfig);
  }

  function usagesFor(image: ManagedGalleryImage) {
    if (!selectedCollection) return [];
    const usages: string[] = [];
    for (const slot of slots) {
      if (slot.value === image.src) usages.push(`${slot.group}: ${slot.label}`);
    }
    for (const collection of config.collections) {
      if (collection.cover === image.src) usages.push(`Gallery cover: ${collection.name}`);
      if (collection.slug !== selectedCollection.slug && collection.images.some((item) => item.src === image.src)) {
        usages.push(`Gallery collection: ${collection.name}`);
      }
    }
    return usages;
  }

  async function permanentlyDelete() {
    if (!selectedCollection || !deleteCandidate || deleteCandidate.usages.length > 0) return;
    setBusyKey(deleteCandidate.image.src);
    setError(null);
    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedCollection.slug, src: deleteCandidate.image.src })
      });
      const payload = await response.json() as GalleryResponse;
      if (!response.ok) {
        if (payload.usages?.length) {
          setDeleteCandidate((current) => current ? { ...current, usages: payload.usages || [] } : current);
          return;
        }
        throw new Error(payload.error || "Could not delete that image.");
      }
      setConfig(payload.config);
      onAssetDeleted(deleteCandidate.image.src);
      setDeleteCandidate(null);
      announce("Image file permanently deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete that image.");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) return <div className={styles.galleryLoading}>Loading gallery collections...</div>;
  if (error && config.collections.length === 0) return <div className={styles.galleryLoading}>{error}</div>;

  return (
    <div className={styles.galleryWorkspace}>
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className={styles.hiddenInput}
        onChange={handleUploadChange}
      />

      <aside className={styles.collectionSidebar}>
        <div className={styles.collectionSidebarHeader}>
          <div>
            <p className={styles.sidebarLabel}>Collections</p>
            <strong>{config.collections.length}</strong>
          </div>
          <button
            type="button"
            className={styles.squareButton}
            onClick={() => setCollectionForm({ mode: "create", name: "", defaultCategory: "Artistry" })}
            aria-label="Create collection"
            title="Create collection"
          >+</button>
        </div>
        <nav className={styles.collectionNav}>
          {config.collections.map((collection) => (
            <button
              type="button"
              key={collection.slug}
              className={collection.slug === selectedSlug ? styles.collectionButtonActive : styles.collectionButton}
              onClick={() => setSelectedSlug(collection.slug)}
            >
              <span className={styles.collectionThumb}>
                {collection.cover ? <Image src={collection.cover} alt="" fill sizes="42px" /> : <span>+</span>}
              </span>
              <span className={styles.collectionButtonText}>
                <strong>{collection.name}</strong>
                <small>{collection.images.length} images{collection.visible ? "" : " · hidden"}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <section className={styles.galleryContent}>
        {selectedCollection ? (
          <>
            <div className={styles.galleryHeading}>
              <div className={styles.collectionIdentity}>
                <div className={styles.collectionCover}>
                  {selectedCollection.cover ? (
                    <Image src={selectedCollection.cover} alt="" fill sizes="72px" />
                  ) : <span>No cover</span>}
                </div>
                <div>
                  <p className={styles.eyebrow}>Gallery collection</p>
                  <h2>{selectedCollection.name}</h2>
                  <p>{selectedCollection.images.filter((image) => image.visible).length} published · {selectedCollection.images.length} total</p>
                </div>
              </div>
              <div className={styles.galleryHeadingActions}>
                <label className={styles.visibilityToggle}>
                  <input
                    type="checkbox"
                    checked={selectedCollection.visible}
                    onChange={(event) => void patchGallery({ action: "update-collection", slug: selectedCollection.slug, visible: event.target.checked }, event.target.checked ? "Collection published." : "Collection hidden.")}
                  />
                  <span>{selectedCollection.visible ? "Published" : "Hidden"}</span>
                </label>
                <button type="button" className={styles.secondaryButton} onClick={() => setCollectionForm({ mode: "edit", name: selectedCollection.name, defaultCategory: selectedCollection.defaultCategory })}>
                  Edit collection
                </button>
                <button type="button" className={styles.secondaryButton} onClick={openLibrary}>Add from All</button>
                <button type="button" className={styles.primaryButton} onClick={() => uploadInputRef.current?.click()} disabled={busyKey === "upload"}>
                  {busyKey === "upload" ? "Uploading..." : "Upload images"}
                </button>
              </div>
            </div>

            {selectedCollection.images.length ? (
              <div className={styles.galleryImageGrid}>
                {selectedCollection.images.map((image, index) => (
                  <article
                    key={image.src}
                    className={`${styles.galleryImageCard} ${image.visible ? "" : styles.galleryImageHidden} ${draggedSrc === image.src ? styles.galleryImageDragging : ""}`}
                    draggable
                    onDragStart={() => setDraggedSrc(image.src)}
                    onDragEnd={() => setDraggedSrc(null)}
                    onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
                    onDrop={(event: DragEvent<HTMLElement>) => { event.preventDefault(); void reorderImages(image.src); }}
                  >
                    <div className={styles.galleryImagePreview}>
                      <Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 50vw, 22vw" />
                      <span className={styles.orderBadge}>{String(index + 1).padStart(2, "0")}</span>
                      {selectedCollection.cover === image.src && <span className={styles.coverBadge}>Cover</span>}
                      {!image.visible && <span className={styles.hiddenBadge}>Hidden</span>}
                    </div>
                    <div className={styles.galleryImageBody}>
                      <p title={image.src}>{image.src.split("/").pop()}</p>
                      <select
                        aria-label={`Category for ${image.src.split("/").pop()}`}
                        value={image.category}
                        onChange={(event) => void patchGallery({ action: "update-image", slug: selectedCollection.slug, src: image.src, category: event.target.value }, "Image category updated.")}
                      >
                        {GALLERY_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      <div className={styles.galleryImageActions}>
                        <button type="button" onClick={() => void moveImage(index, -1)} disabled={index === 0} aria-label={`Move ${image.src.split("/").pop()} earlier`} title="Move earlier">↑</button>
                        <button type="button" onClick={() => void moveImage(index, 1)} disabled={index === selectedCollection.images.length - 1} aria-label={`Move ${image.src.split("/").pop()} later`} title="Move later">↓</button>
                        <button type="button" onClick={() => void patchGallery({ action: "set-cover", slug: selectedCollection.slug, src: image.src }, "Collection cover updated.")} disabled={selectedCollection.cover === image.src}>Set cover</button>
                        <button type="button" onClick={() => void patchGallery({ action: "update-image", slug: selectedCollection.slug, src: image.src, visible: !image.visible }, image.visible ? "Image hidden." : "Image published.")}>{image.visible ? "Hide" : "Show"}</button>
                        <button type="button" onClick={() => void patchGallery({ action: "remove-image", slug: selectedCollection.slug, src: image.src }, "Image removed from this collection.")}>Remove</button>
                        <button type="button" className={styles.dangerTextButton} onClick={() => setDeleteCandidate({ image, usages: usagesFor(image) })}>Delete file</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyCollection}>
                <h3>Empty collection</h3>
                <div>
                  <button type="button" className={styles.secondaryButton} onClick={openLibrary}>Add from All</button>
                  <button type="button" className={styles.primaryButton} onClick={() => uploadInputRef.current?.click()}>Upload images</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyCollection}><h3>Create your first collection</h3></div>
        )}
      </section>

      {libraryOpen && selectedCollection && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLibraryOpen(false); }}>
          <section className={styles.libraryModal} role="dialog" aria-modal="true" aria-labelledby="gallery-library-title">
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>All media</p>
                <h2 id="gallery-library-title">Add to {selectedCollection.name}</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setLibraryOpen(false)} aria-label="Close media library" title="Close">×</button>
            </div>
            <div className={styles.libraryToolbar}>
              <label>
                <span>Search</span>
                <input value={librarySearch} onChange={(event) => { setLibrarySearch(event.target.value); setLibraryVisibleCount(LIBRARY_PAGE_SIZE); }} placeholder="Search filenames and folders" autoFocus />
              </label>
              <label>
                <span>Folder</span>
                <select value={libraryFolder} onChange={(event) => { setLibraryFolder(event.target.value); setLibraryVisibleCount(LIBRARY_PAGE_SIZE); }}>
                  {folders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
                </select>
              </label>
              <p>{filteredAssets.length} images</p>
            </div>
            <div className={styles.libraryGrid}>
              {filteredAssets.slice(0, libraryVisibleCount).map((asset) => {
                const added = collectionSources.has(asset.src);
                return (
                  <button
                    type="button"
                    key={asset.src}
                    className={added ? styles.assetSelected : styles.asset}
                    onClick={() => void addFromLibrary(asset.src)}
                    disabled={added || Boolean(busyKey)}
                    title={asset.src}
                  >
                    <span className={styles.assetImageWrap}><Image src={asset.src} alt={asset.name} fill sizes="180px" className={styles.assetImage} /></span>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetFolder}>{asset.folder}</span>
                    {added && <span className={styles.selectedMark}>Added</span>}
                  </button>
                );
              })}
            </div>
            {libraryVisibleCount < filteredAssets.length && (
              <button type="button" className={styles.loadMore} onClick={() => setLibraryVisibleCount((count) => count + LIBRARY_PAGE_SIZE)}>Load more images</button>
            )}
          </section>
        </div>
      )}

      {collectionForm && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCollectionForm(null); }}>
          <form className={styles.formModal} onSubmit={submitCollectionForm}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>{collectionForm.mode === "create" ? "New" : "Edit"}</p>
                <h2>{collectionForm.mode === "create" ? "Create collection" : "Collection details"}</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setCollectionForm(null)} aria-label="Close collection form" title="Close">×</button>
            </div>
            <div className={styles.formFields}>
              <label>
                <span>Collection name</span>
                <input value={collectionForm.name} onChange={(event) => setCollectionForm({ ...collectionForm, name: event.target.value })} autoFocus required />
              </label>
              <label>
                <span>Default category</span>
                <select value={collectionForm.defaultCategory} onChange={(event) => setCollectionForm({ ...collectionForm, defaultCategory: event.target.value })}>
                  {GALLERY_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <button type="submit" className={styles.primaryButton} disabled={Boolean(busyKey)}>
                {collectionForm.mode === "create" ? "Create collection" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteCandidate && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteCandidate(null); }}>
          <section className={styles.deleteModal} role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Permanent deletion</p>
                <h2 id="delete-title">Delete image file?</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setDeleteCandidate(null)} aria-label="Close deletion dialog" title="Close">×</button>
            </div>
            <div className={styles.deleteBody}>
              <div className={styles.deletePreview}><Image src={deleteCandidate.image.src} alt="" fill sizes="160px" /></div>
              <div>
                <strong>{deleteCandidate.image.src.split("/").pop()}</strong>
                {deleteCandidate.usages.length > 0 ? (
                  <>
                    <p>This file is still being used and cannot be deleted:</p>
                    <ul>{deleteCandidate.usages.map((usage) => <li key={usage}>{usage}</li>)}</ul>
                  </>
                ) : (
                  <p>This removes the actual file from the project. The next Git commit will also remove it from Vercel.</p>
                )}
              </div>
            </div>
            <div className={styles.deleteActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setDeleteCandidate(null)}>Cancel</button>
              {deleteCandidate.usages.length === 0 && (
                <button type="button" className={styles.dangerButton} onClick={() => void permanentlyDelete()} disabled={Boolean(busyKey)}>Delete permanently</button>
              )}
            </div>
          </section>
        </div>
      )}

      {(message || error) && (
        <div className={error ? styles.toastError : styles.toast} role="status">
          {error || message}
          {error && <button type="button" onClick={() => setError(null)} aria-label="Dismiss message">×</button>}
        </div>
      )}
    </div>
  );
}
