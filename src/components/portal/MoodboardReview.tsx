"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESIGN_FIELDS, type MoodboardVersion } from "@/lib/moodboard-view";
import styles from "./couple-planning.module.css";
import board from "./moodboard.module.css";
export default function MoodboardReview({ versions, canApprove = false, preview = false }: { versions: MoodboardVersion[]; canApprove?: boolean; preview?: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const current = versions[0];
  async function approve() {
    if (!current || !checked || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/portal/moodboards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: current.id, approved: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not record approval.");
      setChecked(false); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not record approval."); }
    finally { setBusy(false); }
  }
  if (!current) return <section className={styles.card}><h2>Your moodboard</h2><p>Your design team will share a version here when it is ready for review.</p></section>;
  const date = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value));
  function content(version: MoodboardVersion) {
    return <><p>{version.change_summary}</p><dl>{(Object.keys(DESIGN_FIELDS) as (keyof typeof DESIGN_FIELDS)[]).filter((key) => version.design[key]).map((key) => <div key={key}><dt><strong>{DESIGN_FIELDS[key]}</strong></dt><dd className={board.detail}>{version.design[key]}</dd></div>)}</dl><div className={board.grid}>{version.images.map((image) => <figure key={image.id}>{image.url ? <a href={image.url} target="_blank" rel="noreferrer" aria-label={`Open ${image.name}`}>
      {/* Signed private links must not be cached by the image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.name} loading="lazy" /></a> : <p role="alert">Image unavailable. Refresh before approving.</p>}<figcaption>{image.name}</figcaption></figure>)}</div>{version.approvals.map((approval, i) => <p className={styles.success} key={i}>Approved by {approval.approved_name} · {date(approval.approved_at)} ET · Version {version.version}</p>)}</>;
  }
  return <section className={styles.card}>
    <div className={styles.heading}><h2>{current.title}</h2><span className={styles.badge}>Version {current.version} · {current.approvals.length ? "Approved" : current.version > 1 ? "Reapproval required" : "Awaiting approval"}</span></div>
    {content(current)}
    {!current.approvals.length && <><p>Either partner may approve. One explicit approval is enough. Changes to the palette, furniture, florals or price require a new version and approval.</p>{canApprove && !preview ? <div className={board.approval}><label><input type="checkbox" checked={checked} disabled={busy} onChange={(event) => setChecked(event.target.checked)} /> I have reviewed version {current.version} and approve this design, including the price and scope shown above.</label><button type="button" disabled={!checked || busy || current.images.some((image) => !image.url)} onClick={() => void approve()}>{busy ? "Recording approval…" : `Approve version ${current.version}`}</button></div> : <p>{preview ? "Preview only. Approval must come from a partner’s own portal sign-in." : "A partner’s portal sign-in is required to approve."}</p>}</>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {versions.length > 1 && <details><summary>Previous versions ({versions.length - 1})</summary>{versions.slice(1).map((version) => <details key={version.id}><summary>Version {version.version} · {version.title} · {version.approvals.length ? "Previously approved" : "Superseded without approval"}</summary>{content(version)}</details>)}</details>}
  </section>;
}
