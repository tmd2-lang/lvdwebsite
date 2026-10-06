"use client";

import { useMemo, useState } from "react";
import type { AdminLead } from "@/lib/admin-types";
import { buildAdReport, costPer, HIGH_BUDGET_FROM, type AdRow } from "@/lib/ad-report";
import { formatMoney, parseAmount } from "@/lib/sales-stage";
import styles from "./ad-report.module.css";

function money(value: number | null) {
  return value == null ? "—" : formatMoney(Math.round(value * 100) / 100);
}
function share(part: number, whole: number) {
  return whole ? `${part} (${Math.round((part / whole) * 100)}%)` : "0";
}

function SpendInput({ row, onSave }: { row: AdRow; onSave: (adId: string, spend: number | null) => Promise<void> }) {
  const [value, setValue] = useState(row.spend == null ? "" : String(row.spend));
  const [state, setState] = useState<"" | "saving" | "error">("");
  async function save() {
    const trimmed = value.trim();
    const spend = trimmed === "" ? null : parseAmount(trimmed) ?? (trimmed.replace(/[$,\s]/g, "") === "0" ? 0 : undefined);
    if (spend === undefined) { setState("error"); return; }
    if (spend === row.spend) return;
    setState("saving");
    try { await onSave(row.adId!, spend); setState(""); } catch { setState("error"); }
  }
  return (
    <label className={styles.spend} data-state={state}>
      <span>$</span>
      <input inputMode="decimal" aria-label={`Spend for ${row.label}`} placeholder="Add" value={value}
        onChange={(event) => { setValue(event.target.value); setState(""); }}
        onBlur={() => void save()} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
    </label>
  );
}

export default function AdReport({ leads, initialSpend, spendAvailable, names, metaSyncedAt }: {
  leads: AdminLead[]; initialSpend: Record<string, number>; spendAvailable: boolean; names: Record<string, string>; metaSyncedAt: string | null;
}) {
  const [spend, setSpend] = useState(initialSpend);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const fromMeta = Boolean(metaSyncedAt);
  const report = useMemo(() => buildAdReport(leads, spend, names), [leads, spend, names]);

  async function refreshFromMeta() {
    setSyncing(true); setError("");
    const response = await fetch("/api/admin/ad-spend/sync", { method: "POST" }).catch(() => null);
    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) { setError(result?.error || "Could not reach Meta."); setSyncing(false); return; }
    window.location.reload();
  }
  const { totals } = report;

  async function saveSpend(adId: string, value: number | null) {
    setError("");
    const response = await fetch("/api/admin/ad-spend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId, spend: value }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error || "Could not save spend."); throw new Error("save failed"); }
    setSpend((current) => {
      const next = { ...current };
      if (value === null) delete next[adId]; else next[adId] = value;
      return next;
    });
  }

  const tiles = [
    { label: "Spend entered", value: money(totals.spend) },
    { label: "Inquiries from Meta ads", value: String(totals.inquiries) },
    { label: `Picked $${HIGH_BUDGET_FROM / 1000}k+`, value: share(totals.highBudget, totals.inquiries) },
    { label: "Booked", value: `${totals.booked} · ${money(totals.bookedAmount)}` },
    { label: "Booked $ per $1 spent", value: totals.spend ? `$${(totals.bookedAmount / totals.spend).toFixed(2)}` : "—" },
  ];

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/admin/inquiries">← Inquiries</a>
      <p className={styles.eyebrow}>Only visible to you</p>
      <h1>Ad report</h1>
      <p className={styles.lede}>Every inquiry since tracking began (Aug 13, 2026), grouped by the Meta ad it first came from, and what happened next.</p>

      <section className={styles.tiles} aria-label="Totals for Meta ads">
        {tiles.map((tile) => <div key={tile.label}><span>{tile.label}</span><b>{tile.value}</b></div>)}
      </section>

      <div className={styles.syncBar}>
        <span>{fromMeta ? `Spend from Meta · updated ${new Date(metaSyncedAt!).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET · refreshes every morning` : "Spend is typed in by hand until Meta is connected."}</span>
        <button type="button" onClick={() => void refreshFromMeta()} disabled={syncing}>{syncing ? "Refreshing…" : "Refresh from Meta"}</button>
      </div>
      {!spendAvailable && <p className={styles.notice}>Spend can&apos;t be saved yet: run <code>supabase/ad-spend-schema.sql</code> in Supabase first.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Ad</th><th scope="col">Spend</th><th scope="col">Inquiries</th><th scope="col">Cost per inquiry</th>
              <th scope="col">Picked ${HIGH_BUDGET_FROM / 1000}k+</th><th scope="col">Consults</th><th scope="col">Completed</th>
              <th scope="col">Good fit</th><th scope="col">Proposals</th><th scope="col">Booked</th><th scope="col">Booked $</th>
              <th scope="col">Cost per booking</th><th scope="col">Lost</th>
            </tr>
          </thead>
          <tbody>
            {report.ads.map((row) => <tr key={row.key}>
              <th scope="row">{row.label}<small>{row.adId}</small></th>
              <td>{fromMeta ? money(row.spend) : spendAvailable ? <SpendInput row={row} onSave={saveSpend} /> : "—"}</td>
              <td>{row.inquiries}</td>
              <td>{money(costPer(row.spend, row.inquiries))}</td>
              <td>{share(row.highBudget, row.inquiries)}</td>
              <td>{row.consults}</td><td>{row.completed}</td><td>{row.goodFit}</td><td>{row.proposals}</td>
              <td>{row.booked}</td><td>{row.bookedAmount ? money(row.bookedAmount) : "—"}</td>
              <td>{money(costPer(row.spend, row.booked))}</td><td>{row.lost}</td>
            </tr>)}
            {report.ads.length === 0 && <tr><td colSpan={13}>No inquiries from Meta ads yet.</td></tr>}
          </tbody>
          <tbody className={styles.other}>
            <tr><th scope="rowgroup" colSpan={13}>Not from a Meta ad (for comparison)</th></tr>
            {report.other.map((row) => <tr key={row.key}>
              <th scope="row">{row.label}</th><td>—</td><td>{row.inquiries}</td><td>—</td>
              <td>{share(row.highBudget, row.inquiries)}</td><td>{row.consults}</td><td>{row.completed}</td><td>{row.goodFit}</td>
              <td>{row.proposals}</td><td>{row.booked}</td><td>{row.bookedAmount ? money(row.bookedAmount) : "—"}</td><td>—</td><td>{row.lost}</td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <section className={styles.notes} aria-label="How to read this">
        <h2>How to read this</h2>
        <ul>
          <li><b>Spend</b> counts from <b>Aug 13, 2026</b>, when inquiries started being saved. Lifetime spend would make older ads look worse than they are. {fromMeta ? "Meta sends it every morning." : "Until Meta is connected, type each ad's \u201cAmount spent\u201d for Aug 13 – today."}</li>
          <li><b>Inquiries</b> are real inquiries in the inbox, not Meta&apos;s &ldquo;leads&rdquo; number. An inquiry counts for the first ad she clicked.</li>
          <li><b>Consults, completed, good fit, proposals, booked</b> come from Calendly and the Sales buttons. They&apos;re only as complete as Irene and Tanah&apos;s clicks.</li>
          <li><b>Small numbers.</b> A few inquiries per ad is a hint, not proof. Compare ads once each has a few dozen.</li>
        </ul>
      </section>
    </main>
  );
}
