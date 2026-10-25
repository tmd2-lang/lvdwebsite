"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { COUPLE_GUEST_GROUPS, COUPLE_HOUSEHOLD_FIELDS, blankCoupleRecord, fieldsForCouple, type CoupleGuestKind, type CoupleGuestRecord, type CoupleGuests } from "@/lib/couple-guests-view";
import { RSVP, text, type FieldDef, type GuestData } from "@/lib/guests-view";
import styles from "./couple-planning.module.css";

type Editor = { id: string | null; kind: CoupleGuestKind; data: GuestData; expectedUpdatedAt: string | null };
export default function CoupleGuestManager({ initial, readOnly = false }: { initial: CoupleGuests; readOnly?: boolean }) {
  const router = useRouter();
  const [records, setRecords] = useState(initial.records);
  const [kind, setKind] = useState<CoupleGuestKind>("guest");
  const [search, setSearch] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [limit, setLimit] = useState(40);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const guests = records.filter((r) => r.kind === "guest");
  const households = records.filter((r) => r.kind === "household");
  const name = (record: CoupleGuestRecord) => record.kind === "household" ? text(record.data, "name") : `${text(record.data, "first")} ${text(record.data, "last")}`.trim();
  const shown = records.filter((r) => r.kind === kind && (!rsvp || kind !== "guest" || text(r.data, "rsvp") === rsvp)
    && `${name(r)} ${text(r.data, "email")}`.toLowerCase().includes(search.trim().toLowerCase()));

  async function mutate(body: Record<string, unknown>) {
    const response = await fetch("/api/portal/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Your changes could not be saved.");
    return result;
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || readOnly) return;
    setBusy(true); setError(""); setMessage("");
    try {
      // Only writable fields travel. Seating and all studio-only fields stay out.
      const keys = new Set(fieldsForCouple(editor.kind).map((f) => f.key));
      if (editor.kind === "guest") keys.add("events");
      const data = Object.fromEntries(Object.entries(editor.data).filter(([key]) => keys.has(key)));
      const result = await mutate({ action: "save", kind: editor.kind, id: editor.id, data, expectedUpdatedAt: editor.expectedUpdatedAt });
      const record = result.record as CoupleGuestRecord;
      setRecords((current) => current.some((r) => r.id === record.id) ? current.map((r) => r.id === record.id ? record : r) : [...current, record]);
      setEditor(null); setMessage("Your guest list has been saved."); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Your changes could not be saved."); }
    finally { setBusy(false); }
  }
  async function remove(record: CoupleGuestRecord) {
    if (readOnly || busy) return;
    if (confirming !== record.id) { setConfirming(record.id); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await mutate({ action: "delete", id: record.id, kind: record.kind, expectedUpdatedAt: record.updated_at });
      setRecords((current) => current.filter((r) => r.id !== record.id).map((r) => record.kind === "household" && r.data.household_id === record.id ? { ...r, data: { ...r.data, household_id: "" } } : r));
      setConfirming(null); setMessage("Removed from your guest list."); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not remove this guest."); }
    finally { setBusy(false); }
  }
  function change(key: string, value: GuestData[string]) { setEditor((current) => current ? { ...current, data: { ...current.data, [key]: value } } : null); }
  function field(def: FieldDef) {
    if (!editor) return null;
    const value = editor.data[def.key];
    const id = `guest-edit-${def.key}`;
    const shared = { id, disabled: busy, required: def.required, "aria-label": def.label };
    let control;
    if (def.kind === "yesno") control = <select {...shared} value={value === true ? "yes" : "no"} onChange={(e) => change(def.key, e.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select>;
    else if (def.kind === "household") control = <select {...shared} value={typeof value === "string" ? value : ""} onChange={(e) => change(def.key, e.target.value)}><option value="">No household</option>{households.map((h) => <option key={h.id} value={h.id}>{name(h)}</option>)}</select>;
    else if (def.kind === "select") control = <select {...shared} value={typeof value === "string" ? value : ""} onChange={(e) => change(def.key, e.target.value)}>{(def.options ?? []).map((o) => <option key={o} value={o}>{o || "Choose a meal"}</option>)}</select>;
    else control = <input {...shared} type={def.kind === "date" ? "date" : def.kind === "email" ? "email" : "text"} maxLength={def.max ?? 500} value={typeof value === "string" ? value : ""} onChange={(e) => change(def.key, e.target.value)} />;
    return <label className={styles.field} key={def.key} htmlFor={id}>{def.label}{def.required ? " *" : ""}{control}</label>;
  }

  return <section className={styles.card}>
    <div className={styles.heading}><h2>Your guest list</h2><span className={styles.badge}>{guests.length} guests · {guests.filter((g) => text(g.data, "rsvp") === "Attending").length} attending</span></div>
    {initial.countsLocked && <p className={styles.notice}>Final counts have been sent. Changes to attendance, meals and allergy details are recorded for your planning team to review.</p>}
    {readOnly && <p className={styles.notice}>This view is read-only. Changes are disabled here.</p>}
    <div className={styles.actions}>
      <button type="button" aria-pressed={kind === "guest"} onClick={() => { setKind("guest"); setLimit(40); }}>Guests</button>
      <button type="button" aria-pressed={kind === "household"} onClick={() => { setKind("household"); setLimit(40); }}>Households & addresses</button>
      {!readOnly && <button type="button" disabled={busy} onClick={() => { setEditor({ id: null, kind, data: blankCoupleRecord(kind), expectedUpdatedAt: null }); setError(""); setMessage(""); }}>Add {kind === "guest" ? "guest" : "household"}</button>}
      <button type="button" onClick={() => window.location.reload()}>Refresh list</button>
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {message && <p role="status" className={styles.success}>{message}</p>}
    {editor && <form onSubmit={save} aria-label={editor.id ? "Edit guest record" : "Add guest record"}>
      {(editor.kind === "guest" ? COUPLE_GUEST_GROUPS : [{ title: "Household & mailing address", fields: COUPLE_HOUSEHOLD_FIELDS }]).map((group) => <fieldset className={styles.group} key={group.title}><legend>{group.title}</legend><div className={styles.formGrid}>{group.fields.map(field)}</div></fieldset>)}
      {editor.kind === "guest" && <fieldset className={styles.group}><legend>Event attendance</legend>{initial.events.map((event) => <label key={event} className={styles.eventChoice}><input type="checkbox" checked={typeof editor.data.events === "object" && editor.data.events[event] === true} onChange={(e) => change("events", { ...(typeof editor.data.events === "object" ? editor.data.events : {}), [event]: e.target.checked })} disabled={busy} />{event}</label>)}</fieldset>}
      <div className={styles.actions}><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save guest details"}</button><button type="button" disabled={busy} onClick={() => setEditor(null)}>Cancel</button></div>
    </form>}
    <div className={styles.filters}><label>Search guests<input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setLimit(40); }} /></label>{kind === "guest" && <label>RSVP<select value={rsvp} onChange={(e) => { setRsvp(e.target.value); setLimit(40); }}><option value="">All responses</option>{RSVP.map((s) => <option key={s}>{s}</option>)}</select></label>}</div>
    <p role="status">{shown.length} {kind === "guest" ? "guests" : "households"}</p>
    {!shown.length && <p className={styles.empty}>No {kind === "guest" ? "guests" : "households"} match this view.</p>}
    <ul className={styles.list}>{shown.slice(0, limit).map((record) => <li key={record.id}>
      <div><h3>{name(record) || "Unnamed"}</h3><p>{record.kind === "guest" ? [text(record.data, "rsvp"), text(record.data, "meal"), initial.tables.find((t) => t.id === text(record.data, "table_id"))?.name].filter(Boolean).join(" · ") : [text(record.data, "address"), text(record.data, "city"), text(record.data, "state"), text(record.data, "postal")].filter(Boolean).join(", ")}</p></div>
      {!readOnly && <div className={styles.actions}><button type="button" disabled={busy} aria-label={`Edit ${name(record)}`} onClick={() => { setEditor({ id: record.id, kind: record.kind as CoupleGuestKind, data: { ...record.data }, expectedUpdatedAt: record.updated_at }); setError(""); }}>Edit</button><button type="button" disabled={busy} aria-label={`${confirming === record.id ? "Confirm removal of" : "Remove"} ${name(record)}`} onClick={() => void remove(record)}>{confirming === record.id ? "Confirm removal" : "Remove"}</button>{confirming === record.id && <button type="button" onClick={() => setConfirming(null)}>Keep</button>}</div>}
    </li>)}</ul>
    {shown.length > limit && <button type="button" onClick={() => setLimit(limit + 40)}>Show more</button>}
  </section>;
}
