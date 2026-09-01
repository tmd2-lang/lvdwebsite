"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../../../../portal-admin.module.css";

type Line = { key: number; name: string; detail: string; amount: string };

let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, name: "", detail: "", amount: "" });

function centsOf(amount: string) {
  const cleaned = amount.replace(/[$,\s]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: Number.isInteger(cents / 100) ? 0 : 2,
  }).format(cents / 100);
}

export default function NewInvoiceForm({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = lines.reduce((sum, line) => sum + centsOf(line.amount), 0);

  function updateLine(key: number, field: keyof Line, value: string) {
    setLines((current) => current.map((line) => line.key === key ? { ...line, [field]: value } : line));
  }

  function removeLine(key: number) {
    setLines((current) => current.length > 1 ? current.filter((line) => line.key !== key) : current);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          name: data.get("name"),
          category: data.get("category"),
          phase: data.get("phase"),
          dueOn: data.get("dueOn"),
          notes: data.get("notes"),
          items: lines.map((line) => ({ name: line.name, detail: line.detail, amount: line.amount })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save this invoice.");

      router.push(`/admin/portal/clients/${clientId}`);
      router.refresh();
    } catch (submitError) {
      setBusy(false);
      setError(submitError instanceof Error ? submitError.message : "Could not save this invoice.");
    }
  }

  return (
    <form className={styles.clientForm} onSubmit={handleSubmit}>
      <fieldset disabled={busy}>
        <legend>The invoice</legend>
        <div className={styles.formRow}>
          <label>
            <span>What is this for?<b aria-hidden="true">*</b></span>
            <input name="name" required placeholder="Floral &amp; spatial design" />
          </label>
          <label>
            <span>Due date</span>
            <input name="dueOn" type="date" />
          </label>
        </div>
        <div className={styles.formRow}>
          <label>
            <span>Category</span>
            <input name="category" placeholder="Florals" />
          </label>
          <label>
            <span>Phase</span>
            <input name="phase" placeholder="Design development" />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={busy}>
        <legend>Line items</legend>
        <p className={styles.lineHint}>
          {clientName} can pay these individually, so split the work the way you would want it paid.
        </p>

        <div className={styles.lineItems}>
          {lines.map((line, index) => (
            <div className={styles.lineItem} key={line.key}>
              <span className={styles.lineNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.lineFields}>
                <input
                  value={line.name}
                  onChange={(event) => updateLine(line.key, "name", event.target.value)}
                  placeholder="Ceremony meadow installation"
                  aria-label={`Line ${index + 1} name`}
                />
                <input
                  value={line.detail}
                  onChange={(event) => updateLine(line.key, "detail", event.target.value)}
                  placeholder="What this covers (optional)"
                  aria-label={`Line ${index + 1} detail`}
                />
              </div>
              <input
                className={styles.lineAmount}
                value={line.amount}
                onChange={(event) => updateLine(line.key, "amount", event.target.value)}
                placeholder="3,200"
                inputMode="decimal"
                aria-label={`Line ${index + 1} amount`}
              />
              <button
                className={styles.lineRemove}
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length === 1}
                aria-label={`Remove line ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.lineActions}>
          <button type="button" onClick={() => setLines((current) => [...current, emptyLine()])}>
            + Add another line
          </button>
          <div className={styles.lineTotal}>
            <span>Invoice total</span>
            <strong>{money(total)}</strong>
          </div>
        </div>

        <label className={styles.fullWidth}>
          <span>Notes</span>
          <textarea name="notes" rows={2} placeholder="Anything the client should know." />
        </label>
      </fieldset>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      <div className={styles.formActions}>
        <Link href={`/admin/portal/clients/${clientId}`}>Cancel</Link>
        <button type="submit" disabled={busy || total === 0}>
          {busy ? "Saving…" : `Create invoice · ${money(total)}`}
          <span aria-hidden="true">{busy ? "" : "→"}</span>
        </button>
      </div>
    </form>
  );
}
