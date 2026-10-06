"use client";

import { useState } from "react";
import type { AdminLead } from "@/lib/admin-types";
import { formatMoney, LOST_REASONS, parseAmount, salesStep, type LostReason, type SalesAction } from "@/lib/sales-stage";
import styles from "./inquiries.module.css";

export type SalesUpdate = { action: SalesAction; amount?: number | null; reason?: LostReason | null; note?: string | null };

function shortDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }) : "";
}

/** Step 4: asks only the next question for this inquiry, with undo for the last answer. */
export default function SalesControls({ lead, onUpdate }: { lead: AdminLead; onUpdate: (update: SalesUpdate) => Promise<boolean> }) {
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState<"" | "booked" | "lost">("");
  const [reason, setReason] = useState<LostReason | "">("");
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const current = salesStep(lead);

  async function send(update: SalesUpdate) {
    setSaving(true);
    setProblem("");
    const ok = await onUpdate(update);
    setSaving(false);
    if (ok) { setAmount(""); setChoice(""); setReason(""); setNote(""); }
  }

  function sendAmount(action: "proposal_sent" | "booked", fallback = "") {
    const value = parseAmount(amount || fallback);
    if (value === null) { setProblem("Enter an amount, like 38,500."); return; }
    void send({ action, amount: value });
  }

  const history = [
    lead.consult_outcome === "completed" && `Consult completed ${shortDate(lead.consult_outcome_at)}`,
    lead.consult_outcome === "no_show" && `No-show ${shortDate(lead.consult_outcome_at)}`,
    lead.fit === "good_fit" && "Good fit",
    lead.fit === "not_fit" && "Not a fit",
    lead.proposal_amount != null && `Proposal ${formatMoney(lead.proposal_amount)} sent ${shortDate(lead.proposal_sent_at)}`,
  ].filter(Boolean).join(" · ");

  const undo = "undo" in current && (
    <button type="button" className={styles.salesUndo} disabled={saving} onClick={() => void send({ action: current.undo })}>Undo</button>
  );

  return (
    <section className={styles.salesBlock} aria-label="Sales progress">
      <h3>Sales</h3>
      {history && <p className={styles.salesHistory}>{history}</p>}

      {current.step === "consult" && <>
        <p>Did the consultation happen?</p>
        <div className={styles.salesButtons}>
          <button type="button" disabled={saving} onClick={() => void send({ action: "consult_completed" })}>Completed</button>
          <button type="button" disabled={saving} onClick={() => void send({ action: "consult_no_show" })}>No-show</button>
        </div>
      </>}

      {current.step === "no_show" && <p className={styles.salesDone}>Marked as a no-show. If they rebook and it happens, undo this first. {undo}</p>}

      {current.step === "fit" && <>
        <p>Was it a good fit? {undo}</p>
        <div className={styles.salesButtons}>
          <button type="button" disabled={saving} onClick={() => void send({ action: "fit_good" })}>Good fit</button>
          <button type="button" disabled={saving} onClick={() => void send({ action: "fit_not" })}>Not a fit</button>
        </div>
      </>}

      {current.step === "not_fit" && <p className={styles.salesDone}>Not a fit. {undo}</p>}

      {current.step === "proposal" && <>
        <p>When the proposal goes out, enter its amount. {undo}</p>
        <div className={styles.salesButtons}>
          <label className={styles.salesAmount}><span>$</span><input inputMode="decimal" placeholder="38,500" aria-label="Proposal amount" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <button type="button" disabled={saving} onClick={() => sendAmount("proposal_sent")}>Proposal sent</button>
        </div>
      </>}

      {current.step === "outcome" && <>
        <p>Did they book? {undo}</p>
        <div className={styles.salesButtons}>
          <button type="button" aria-pressed={choice === "booked"} disabled={saving} onClick={() => setChoice("booked")}>Booked</button>
          <button type="button" aria-pressed={choice === "lost"} disabled={saving} onClick={() => setChoice("lost")}>Lost</button>
        </div>
        {choice === "booked" && <div className={styles.salesButtons}>
          <label className={styles.salesAmount}><span>$</span><input inputMode="decimal" aria-label="Booked amount" placeholder={String(lead.proposal_amount ?? "")} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <button type="button" disabled={saving} onClick={() => sendAmount("booked", String(lead.proposal_amount ?? ""))}>Save booking</button>
        </div>}
        {choice === "lost" && <div className={styles.salesButtons}>
          <select aria-label="Why was it lost?" value={reason} onChange={(event) => setReason(event.target.value as LostReason)}>
            <option value="">Why?</option>
            {Object.entries(LOST_REASONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input aria-label="Optional note" placeholder="Note (optional)" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
          <button type="button" disabled={saving || !reason} onClick={() => reason && void send({ action: "lost", reason, note })}>Save</button>
        </div>}
        {choice === "booked" && <small>Leave blank to use the proposal amount.</small>}
      </>}

      {current.step === "booked" && <p className={styles.salesDone}><b>Booked · {formatMoney(lead.booked_amount)}</b> {shortDate(lead.sales_outcome_at)} {undo}</p>}
      {current.step === "lost" && <p className={styles.salesDone}><b>Lost · {lead.lost_reason ? LOST_REASONS[lead.lost_reason] : ""}</b>{lead.lost_note ? ` — ${lead.lost_note}` : ""} {undo}</p>}

      {problem && <p className={styles.toastError} role="alert">{problem}</p>}
      {saving && <small>Saving…</small>}
    </section>
  );
}
