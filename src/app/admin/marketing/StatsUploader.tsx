"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isIsoDate, parseRedditAdCsv, periodFromFilename, type ParsedAdRow } from "@/lib/platform-stats";
import styles from "./dashboard.module.css";

const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function StatsUploader({ onImported }: { onImported: () => void }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedAdRow[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function choose(file: File | undefined) {
    setError(null); setRows([]);
    if (!file) return;
    setFileName(file.name);
    const parsed = parseRedditAdCsv(await file.text());
    if (parsed.error) { setError(parsed.error); return; }
    setRows(parsed.rows);
    const period = periodFromFilename(file.name);
    setStart(period?.start || ""); setEnd(period?.end || "");
  }

  async function save() {
    setError(null); setSaving(true);
    try {
      const response = await fetch("/api/admin/marketing/platform-stats", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "reddit", periodStart: start, periodEnd: end, rows }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) { setError(result?.error || "Could not import that file."); return; }
      setRows([]); setFileName("");
      router.refresh();
      onImported();
    } finally { setSaving(false); }
  }

  const periodOk = isIsoDate(start) && isIsoDate(end) && end >= start;
  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0);

  return (
    <section className={styles.uploadPanel}>
      <div>
        <p className={styles.micro}>Reddit Ads</p>
        <h2>Upload a report.</h2>
        <p>In Reddit Ads, export the report broken out by ad, then drop the CSV here. Importing again later replaces the numbers for the same ads.</p>
        <label className={styles.fileButton}>
          Choose a CSV
          <input type="file" accept=".csv,text/csv" onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ""; }} />
        </label>
        {error && <p className={styles.setupError} role="alert" style={{ marginTop: "1rem" }}>{error}</p>}
      </div>
      {rows.length > 0 && <div className={styles.preview}>
        <p className={styles.micro}>Preview · {fileName}</p>
        <div className={styles.tableScroll}><table className={styles.table} style={{ minWidth: 0 }}>
          <thead><tr><th scope="col">Ad</th><th scope="col">Spent</th><th scope="col">Impressions</th><th scope="col">Clicks</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`${row.campaign}|${row.ad_group}|${row.ad_name}`}><td>{row.ad_name}</td><td>{money(row.spend)}</td><td>{row.impressions.toLocaleString("en-US")}</td><td>{row.clicks.toLocaleString("en-US")}</td></tr>)}
            <tr className={styles.totalRow}><td>{rows.length} ads</td><td>{money(totalSpend)}</td><td>{rows.reduce((sum, row) => sum + row.impressions, 0).toLocaleString("en-US")}</td><td>{rows.reduce((sum, row) => sum + row.clicks, 0).toLocaleString("en-US")}</td></tr></tbody>
        </table></div>
        <div className={styles.periodRow}>
          <label>First day<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <label>Last day<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
          <button type="button" className={styles.importButton} disabled={!periodOk || saving} onClick={save}>{saving ? "Importing…" : "Import these numbers"}</button>
        </div>
        {!periodOk && <small className={styles.tagGuess}>Pick the first and last day this report covers.</small>}
      </div>}
    </section>
  );
}
