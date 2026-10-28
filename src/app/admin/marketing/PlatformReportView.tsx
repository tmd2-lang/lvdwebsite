"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlatformReport, PlatformReportRow } from "@/lib/platform-stats";
import styles from "./dashboard.module.css";

export type PlatformReportData = { available: boolean; report: PlatformReport; showInquiries: boolean };

const money = (value: number | null) => (value == null ? "—" : value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }));
const whole = (value: number) => value.toLocaleString("en-US");
const percent = (value: number | null) => (value == null ? "—" : `${(value * 100).toFixed(2)}%`);

function shortDay(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** The tag reads as a fixed label; Edit turns it into a box. Enter or Save keeps the change, Esc cancels. */
function TagCell({ row, onError }: { row: PlatformReportRow; onError: (message: string | null) => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(row.tag || "");
  const [saving, setSaving] = useState(false);

  function start() { setValue(row.tag || ""); setEditing(true); }

  async function save() {
    const next = value.trim();
    if (next === (row.tag || "")) { setEditing(false); return; }
    onError(null); setSaving(true);
    try {
      const response = await fetch("/api/admin/marketing/platform-stats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: row.platform, campaign: row.campaign, ad_group: row.ad_group, ad_name: row.ad_name, utmContent: next }),
      });
      if (!response.ok) { onError((await response.json().catch(() => null))?.error || "Could not save that link tag."); return; }
      setEditing(false);
      router.refresh();
    } finally { setSaving(false); }
  }

  if (editing) {
    return (
      <span className={styles.tagCell}>
        <input className={styles.tagInput} value={value} autoFocus aria-label={`Link tag for ${row.ad_name}`}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") save(); if (event.key === "Escape") setEditing(false); }} />
        <button type="button" className={styles.tagAction} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.tagAction} disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
      </span>
    );
  }
  return (
    <span className={styles.tagCell}>
      {row.tag ? <code className={styles.tagChip}>{row.tag}</code> : <span className={styles.tagGuess}>no tag yet</span>}
      {row.tagGuessed && <small className={styles.tagGuess}>matched by name</small>}
      <button type="button" className={styles.tagAction} onClick={start} aria-label={`${row.tag ? "Edit" : "Add"} link tag for ${row.ad_name}`}>{row.tag ? "Edit" : "Add tag"}</button>
    </span>
  );
}

export default function PlatformReportView({ data, channelName, onUpload }: { data: PlatformReportData; channelName: string; onUpload: () => void }) {
  const { report, showInquiries, available } = data;
  const [error, setError] = useState<string | null>(null);

  if (!available) {
    return <div className={styles.panel}><div className={styles.tableEmpty}><span className={styles.emptyGlyph}>▤</span><strong>One setup step left</strong>
      <p>Run <code>supabase/ad-platform-stats-schema.sql</code> in the Supabase SQL editor, then reload this page.</p></div></div>;
  }
  if (!report.rows.length || !report.period) {
    return <div className={styles.panel}><div className={styles.tableEmpty}><span className={styles.emptyGlyph}>▤</span><strong>No {channelName} numbers yet</strong>
      <p>Upload the per-ad CSV from {channelName} and it shows up here.</p><button type="button" className={styles.textAction} onClick={onUpload}>Go to Uploads →</button></div></div>;
  }

  const { totals, unmatched } = report;
  const cards = [
    { label: "Spent", value: money(totals.spend), note: `${shortDay(report.period.start)} – ${shortDay(report.period.end)}` },
    { label: "Clicks", value: whole(totals.clicks), note: `${money(totals.clicks ? totals.spend / totals.clicks : null)} per click` },
    ...(showInquiries ? [
      { label: "Inquiries", value: whole(totals.inquiries), note: "Tagged to this channel" },
      { label: "Cost per inquiry", value: money(totals.costPerInquiry), note: "Spend ÷ inquiries" },
    ] : [
      { label: "Impressions", value: whole(totals.impressions), note: "Times your ads were shown" },
      { label: "CTR", value: percent(totals.impressions ? totals.clicks / totals.impressions : null), note: "Clicks ÷ impressions" },
    ]),
  ];
  const columns = ["Ad", "Link tag", "Spent", "Impressions", "Clicks", "CTR", "CPC", ...(showInquiries ? ["Inquiries", "$20k+", "Consults", "Booked", "Cost / inquiry"] : [])];

  return <>
    <div className={styles.metricGrid}>{cards.map((card) => <div className={styles.metricCard} key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div>)}</div>
    {error && <p className={styles.setupError} role="alert">{error}</p>}
    <div className={styles.panel} style={{ marginTop: ".75rem" }}>
      <div className={styles.tableToolbar}><strong className={styles.toolbarTitle}>By ad</strong>
        <span>{shortDay(report.period.start)} – {shortDay(report.period.end)} · imported {report.importedAt ? shortDay(report.importedAt.slice(0, 10)) : ""}</span></div>
      <div className={styles.tableScroll}><table className={styles.table}>
        <thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {report.rows.map((row) => <tr key={`${row.campaign}|${row.ad_group}|${row.ad_name}`}>
            <td>{row.ad_name}</td>
            <td><TagCell key={`${row.utm_content}|${row.tag}`} row={row} onError={setError} /></td>
            <td>{money(row.spend)}</td><td>{whole(row.impressions)}</td><td>{whole(row.clicks)}</td><td>{percent(row.ctr)}</td><td>{money(row.cpc)}</td>
            {showInquiries && <><td>{row.inquiries}</td><td>{row.highBudget}</td><td>{row.consults}</td><td>{row.booked ? `${row.booked}${row.bookedAmount ? ` · ${money(row.bookedAmount)}` : ""}` : 0}</td><td>{money(row.costPerInquiry)}</td></>}
          </tr>)}
          {showInquiries && unmatched.inquiries > 0 && <tr><td>Inquiries with no matching ad</td><td>{unmatched.tags.join(", ") || "no tag"}</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>{unmatched.inquiries}</td><td colSpan={4}>Type that tag next to the right ad above</td></tr>}
          <tr className={styles.totalRow}><td>All ads</td><td />
            <td>{money(totals.spend)}</td><td>{whole(totals.impressions)}</td><td>{whole(totals.clicks)}</td><td>{percent(totals.impressions ? totals.clicks / totals.impressions : null)}</td><td>{money(totals.clicks ? totals.spend / totals.clicks : null)}</td>
            {showInquiries && <><td>{totals.inquiries}</td><td>{report.rows.reduce((sum, row) => sum + row.highBudget, 0)}</td><td>{report.rows.reduce((sum, row) => sum + row.consults, 0)}</td><td>{report.rows.reduce((sum, row) => sum + row.booked, 0)}</td><td>{money(totals.costPerInquiry)}</td></>}
          </tr>
        </tbody>
      </table></div>
    </div>
    {showInquiries && <p className={styles.panelFoot} style={{ marginTop: ".9rem" }}>Inquiries come from our own site: each one is matched to an ad by the utm_content tag on the link it clicked. Edit a tag above if a match is wrong.</p>}
  </>;
}
