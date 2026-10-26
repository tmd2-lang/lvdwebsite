"use client";
import { useState, type FormEvent } from "react";
import { useSaveStatus } from "./useSaveStatus";
import { DESIGN_FIELDS, type MoodboardVersion } from "@/lib/moodboard-view";
import styles from "./couple-planning.module.css";
import board from "./moodboard.module.css";
export default function MoodboardEditor({ clientId, current, images, production }: { clientId: string; current: MoodboardVersion | null; images: { id: string; name: string; url: string | null }[]; production: string }) {
  const { saved, saveLabel } = useSaveStatus(); const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>, action: "publish" | "production") {
    event.preventDefault(); const form = event.currentTarget, fields = new FormData(form);
    setBusy(true); setError(""); setMessage("");
    try {
      const body = action === "production" ? { note: fields.get("note") } : { title: fields.get("title"), summary: fields.get("summary"), design: Object.fromEntries(Object.keys(DESIGN_FIELDS).map((key) => [key, fields.get(key)])), images: fields.getAll("images"), expected: current?.id ?? null };
      const response = await fetch("/api/admin/moodboards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, action, clientId }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not save.");
      setMessage(action === "publish" ? "New version shared. A partner must explicitly approve it." : "Studio production notes saved. Approval is unchanged."); saved();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save."); } finally { setBusy(false); }
  }
  return <section className={`${styles.card} ${board.editor}`}>
    <h2>{current ? "Prepare the next design version" : "Share the first moodboard"}</h2>
    <p>Upload images to Design and make them visible to the couple, then select the exact set below. Submitted versions retain their images and details. Library changes do not rewrite a submitted design.</p>
    <p>Palette, furniture/inventory, floral or price changes must be submitted as a new version. Production details within the approved design belong in the separate studio notes below.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.success}>{message}{saveLabel === "Saved. Updating…" ? " Updating…" : ""}</p>}
    <form key={current?.id ?? "first"} onSubmit={(event) => void save(event, "publish")}>
      <fieldset disabled={busy}><legend>Version {(current?.version ?? 0) + 1} · requires approval</legend>
        {/* A new version starts with a blank title so it can't go out labeled as the last one. */}
        <label>Title<input type="text" name="title" required maxLength={160} defaultValue={current ? "" : "Wedding design moodboard"} placeholder={current ? `New title. Last version was "${current.title}"` : undefined} /></label>
        <label>{current ? `What changed since version ${current.version}?` : "What is being submitted?"} (shown to the couple)<textarea name="summary" required minLength={10} maxLength={2000} placeholder={current ? "For example: swapped the blush roses for garden roses, added two lounge sets, updated the price." : "For example: first look at the palette, florals and lounge furniture."} /></label>
        {(Object.keys(DESIGN_FIELDS) as (keyof typeof DESIGN_FIELDS)[]).map((key) => <label key={key}>{DESIGN_FIELDS[key]}<textarea name={key} maxLength={4000} defaultValue={current?.design[key] ?? ""} /></label>)}
        <div className={board.choices}>{images.map((image) => <label key={image.id}><input type="checkbox" name="images" value={image.id} defaultChecked={current?.images.some((selected) => selected.id === image.id)} /> {image.name}{image.url && <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt="" loading="lazy" /></>}</label>)}</div>
        {!images.length && <p>Add visible Design images in the Images tab before submitting a moodboard.</p>}
        <button type="submit" disabled={!images.length}>Share version {(current?.version ?? 0) + 1} for approval</button>
      </fieldset>
    </form>
    <form onSubmit={(event) => void save(event, "production")}><label>Studio production notes · never shown to the couple<textarea name="note" maxLength={8000} defaultValue={production} /></label><button disabled={busy} type="submit">Save production notes</button></form>
  </section>;
}
