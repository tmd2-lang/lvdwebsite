"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  BUDGET_CATEGORIES,
  BUDGET_SIDES,
  BUDGET_SIDE_LABELS,
  LINE_STATUSES,
  LINE_STATUS_LABELS,
  PAYER_LABELS,
  PAYERS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPES,
  PAYMENT_TYPE_LABELS,
  budgetTotals,
  categoryRollup,
  centsToInput,
  isLvdSide,
  lineForecast,
  linePaid,
  parseDollars,
  paymentBalance,
  paymentStatus,
  type BudgetLine,
  type BudgetPayment,
  type BudgetSetup,
  type PaymentStatus,
} from "@/lib/budget-view";
import { money } from "@/lib/invoice-types";
import styles from "../../portal-admin.module.css";

const STATUS_CLASS: Partial<Record<PaymentStatus, string>> = {
  due_soon: styles.checklistStatusProgress,
  overdue: styles.checklistStatusRisk,
  paid: styles.checklistStatusDone,
  disputed: styles.checklistStatusWaiting,
  waived: styles.checklistStatusNa,
};

function formatDate(date: string | null) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

function todayIso() {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
}

/** Reads a dollar box from a form, or throws a sentence the studio can act on. */
function dollars(data: FormData, name: string, label: string) {
  const value = parseDollars(String(data.get(name) || ""));
  if (value === null) throw new Error(`${label} needs to be a dollar amount, like 12500 or 12,500.50.`);
  return value;
}

export default function BudgetPanel({
  clientId,
  designBooked,
  guestCount,
  setup,
  lines,
  payments,
  loadError,
}: {
  clientId: string;
  designBooked: boolean;
  guestCount: number | null;
  setup: BudgetSetup;
  lines: BudgetLine[];
  payments: BudgetPayment[];
  loadError?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState(loadError || "");
  const [editingLine, setEditingLine] = useState("");
  const [editingPayment, setEditingPayment] = useState("");
  const [confirming, setConfirming] = useState("");

  const totals = budgetTotals(setup, lines, payments, guestCount);
  const rollup = categoryRollup(setup, lines, payments);
  const lineById = new Map(lines.map((line) => [line.id, line]));
  const hasLvdLine = lines.some((line) => isLvdSide(line.side));

  async function run(key: string, action: string, payload: Record<string, unknown>) {
    setBusy(key);
    setError("");
    try {
      const response = await fetch("/api/admin/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, action, ...payload }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save that.");
      router.refresh();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that.");
      return false;
    } finally {
      setBusy("");
    }
  }

  /** Runs a form's save, turning a bad dollar amount into an on-screen message. */
  function submit(handler: (data: FormData) => Promise<unknown>) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      handler(data).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not save that."));
    };
  }

  /** Two taps to remove, same as the task list. */
  function confirmFirst(key: string, action: () => void) {
    if (confirming !== key) {
      setConfirming(key);
      return;
    }
    setConfirming("");
    action();
  }

  const saveSetup = submit(async (data) => {
    const contingency = Number(String(data.get("contingency") || "0"));
    if (!Number.isFinite(contingency)) throw new Error("Contingency needs to be a number, like 10.");
    await run("setup", "setup", { approved_cents: dollars(data, "approved", "Approved budget"), contingency_percent: contingency });
  });

  async function saveTarget(category: string, raw: string) {
    const trimmed = raw.trim();
    const next = { ...setup.category_targets };
    if (trimmed === "") delete next[category];
    else {
      const value = Number(trimmed);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        setError(`The target for ${category} should be 0–100%.`);
        return;
      }
      if (next[category] === value) return;
      next[category] = value;
    }
    await run(`target-${category}`, "setup", { category_targets: next });
  }

  async function addLvdLines() {
    const ok = await run("seed", "addLine", { category: "Planning & Management", side: "lvd_planning", vendor: "Lady Victoria Designs", description: "Planning package per the Planning Investment Guide" });
    if (ok && designBooked) {
      await run("seed", "addLine", { category: "Floral & Decor", side: "lvd_design", vendor: "Lady Victoria Designs", description: "Design & florals contract (design tier per What They Booked)" });
    }
  }

  const addLine = submit(async (data) => {
    const form = document.getElementById("budget-add-line") as HTMLFormElement | null;
    const ok = await run("addLine", "addLine", {
      vendor: String(data.get("vendor") || ""),
      category: String(data.get("category") || ""),
      side: String(data.get("side") || "external"),
      estimated_cents: dollars(data, "estimated", "Estimated"),
    });
    if (ok) form?.reset();
  });

  const saveLine = (line: BudgetLine) => submit(async (data) => {
    const ok = await run(line.id, "updateLine", {
      lineId: line.id,
      vendor: String(data.get("vendor") || ""),
      description: String(data.get("description") || ""),
      category: String(data.get("category") || ""),
      side: String(data.get("side") || ""),
      status: String(data.get("status") || ""),
      estimated_cents: dollars(data, "estimated", "Estimated"),
      contracted_cents: dollars(data, "contracted", "Contracted"),
      changes_cents: dollars(data, "changes", "Approved changes"),
      notes: String(data.get("notes") || ""),
    });
    if (ok) setEditingLine("");
  });

  const addPayment = (line: BudgetLine) => submit(async (data) => {
    const form = document.getElementById(`budget-add-payment-${line.id}`) as HTMLFormElement | null;
    const ok = await run(`pay-${line.id}`, "addPayment", {
      lineId: line.id,
      payment_type: String(data.get("type") || "installment"),
      payer: String(data.get("payer") || "client"),
      due_on: String(data.get("due") || ""),
      amount_cents: dollars(data, "amount", "Amount due"),
    });
    if (ok) form?.reset();
  });

  const savePayment = (payment: BudgetPayment) => submit(async (data) => {
    const manual = String(data.get("manual") || "");
    const ok = await run(payment.id, "updatePayment", {
      paymentId: payment.id,
      payment_type: String(data.get("type") || ""),
      payer: String(data.get("payer") || ""),
      due_on: String(data.get("due") || ""),
      amount_cents: dollars(data, "amount", "Amount due"),
      paid_cents: dollars(data, "paid", "Amount paid"),
      paid_on: String(data.get("paidOn") || ""),
      manual_status: manual || null,
      notes: String(data.get("notes") || ""),
    });
    if (ok) setEditingPayment("");
  });

  const stats: { label: string; value: string; note: string; warn?: boolean }[] = [
    { label: "Approved budget", value: money(totals.approved), note: `${money(totals.reserve)} held as contingency (${setup.contingency_percent}%)` },
    { label: "Forecast", value: money(totals.forecast), note: `${money(totals.contracted)} under contract` },
    { label: "Paid", value: money(totals.paid), note: `${money(totals.remaining)} still to pay` },
    {
      label: totals.unallocated < 0 ? "Over budget" : "Unallocated",
      value: money(Math.abs(totals.unallocated)),
      note: totals.unallocated < 0 ? "Forecast is past the budget after contingency" : "Left to plan with, after contingency",
      warn: totals.unallocated < 0,
    },
    { label: "Overdue", value: money(totals.overdue), note: `${money(totals.dueSoon)} due in the next 14 days`, warn: totals.overdue > 0 },
    { label: "Per guest", value: totals.perGuest === null ? "—" : money(totals.perGuest), note: guestCount ? `Forecast across ${guestCount} guests` : "Add a guest count on this client" },
  ];

  return (
    <section className={styles.workspaceCard}>
      <div className={styles.workspaceCardHeader}>
        <div><p className={styles.eyebrow}>Client budget</p><h2>Budget</h2></div>
      </div>

      {lines.some(line => line.id.startsWith("wave:")) && <p>Wave lines and installment allocations are read-only. Update the invoice in Wave, then refresh under <a href="/admin/portal/wave">Wave invoice sync</a>.</p>}
      <div className={`${styles.checklistSummary} ${styles.budgetStats}`}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong className={stat.warn ? styles.checklistLate : undefined}>{stat.value}</strong>
            <small>{stat.note}</small>
          </div>
        ))}
      </div>

      {error && <p className={`${styles.formError} ${styles.budgetError}`} role="alert">{error}</p>}

      <form className={styles.budgetSetup} onSubmit={saveSetup} key={`${setup.approved_cents}-${setup.contingency_percent}`}>
        <label><span>Approved budget ($)</span><input name="approved" inputMode="decimal" defaultValue={setup.approved_cents ? centsToInput(setup.approved_cents) : ""} placeholder="150000" /></label>
        <label><span>Contingency %</span><input name="contingency" inputMode="decimal" defaultValue={String(setup.contingency_percent)} /></label>
        <button type="submit" disabled={busy === "setup"}>{busy === "setup" ? "Saving…" : "Save"}</button>
      </form>

      <section className={styles.budgetSection}>
        <header><h3>Budget lines</h3><span>{lines.length} {lines.length === 1 ? "line" : "lines"}</span></header>

        {!hasLvdLine && (
          <div className={styles.budgetPrompt}>
            <p>Start with the studio&rsquo;s own {designBooked ? "two lines (planning, and design & florals)" : "planning line"}. Each one can make its 40/30/30 payment schedule.</p>
            <button type="button" onClick={() => void addLvdLines()} disabled={busy === "seed"}>{busy === "seed" ? "Adding…" : "Add LVD lines"}</button>
          </div>
        )}

        <ul className={styles.checklistRows}>
          {lines.map((line) => {
            const forecast = lineForecast(line);
            const paid = linePaid(line, payments);
            const linePayments = payments.filter((payment) => payment.line_id === line.id);
            return (
              <li key={line.id} className={line.status === "canceled" ? styles.taskDone : undefined}>
                <div className={styles.budgetLine}>
                  <div className={styles.checklistText}>
                    <strong>{line.vendor}</strong>{line.wave_url && <a href={line.wave_url} target="_blank" rel="noreferrer">Open Wave invoice →</a>}
                    <small>
                      {line.category} · {LINE_STATUS_LABELS[line.status]}
                      {isLvdSide(line.side) ? <em className={styles.checklistTag}>{BUDGET_SIDE_LABELS[line.side]}</em> : ` · ${BUDGET_SIDE_LABELS[line.side]}`}
                    </small>
                    {line.description && <p className={styles.checklistNote}>{line.description}</p>}
                  </div>
                  <dl className={styles.budgetFigures}>
                    <div><dt>Forecast</dt><dd>{money(forecast)}</dd></div>
                    <div><dt>Paid</dt><dd>{money(paid)}</dd></div>
                    <div><dt>Left</dt><dd>{money(Math.max(forecast - paid, 0))}</dd></div>
                  </dl>
                  <button disabled={line.id.startsWith("wave:")} type="button" onClick={() => setEditingLine((current) => (current === line.id ? "" : line.id))} aria-expanded={editingLine === line.id}>
                    {line.id.startsWith("wave:") ? "Wave · read-only" : editingLine === line.id ? "Close" : "Edit"}
                  </button>
                </div>

                {editingLine === line.id && (
                  <div className={styles.checklistEditor}>
                    <form onSubmit={saveLine(line)} className={styles.budgetForm}>
                      <div className={styles.uploadRow}>
                        <label><span>Vendor / expense</span><input name="vendor" defaultValue={line.vendor} required maxLength={200} /></label>
                        <label><span>Description</span><input name="description" defaultValue={line.description ?? ""} maxLength={500} /></label>
                      </div>
                      <div className={styles.budgetGrid3}>
                        <label><span>Category</span><select name="category" defaultValue={line.category}>{BUDGET_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
                        <label><span>Paid to</span><select name="side" defaultValue={line.side}>{BUDGET_SIDES.map((side) => <option key={side} value={side}>{BUDGET_SIDE_LABELS[side]}</option>)}</select></label>
                        <label><span>Status</span><select name="status" defaultValue={line.status}>{LINE_STATUSES.map((status) => <option key={status} value={status}>{LINE_STATUS_LABELS[status]}</option>)}</select></label>
                      </div>
                      <div className={styles.budgetGrid3}>
                        <label><span>Estimated ($)</span><input name="estimated" inputMode="decimal" defaultValue={centsToInput(line.estimated_cents)} /></label>
                        <label><span>Contracted ($)</span><input name="contracted" inputMode="decimal" defaultValue={centsToInput(line.contracted_cents)} /></label>
                        <label><span>Approved changes ($)</span><input name="changes" inputMode="decimal" defaultValue={centsToInput(line.changes_cents)} /></label>
                      </div>
                      <label className={styles.checklistNotesField}><span>Studio notes</span><textarea name="notes" rows={2} maxLength={2000} defaultValue={line.notes ?? ""} /></label>
                      <div className={styles.uploadActions}>
                        <button
                          type="button"
                          className={styles.budgetDanger}
                          onClick={() => confirmFirst(`line-${line.id}`, () => void run(line.id, "deleteLine", { lineId: line.id }))}
                          onBlur={() => setConfirming((current) => (current === `line-${line.id}` ? "" : current))}
                        >
                          {confirming === `line-${line.id}` ? "Tap again to remove line and its payments" : "Remove line"}
                        </button>
                        <button type="submit" disabled={busy === line.id}>{busy === line.id ? "Saving…" : "Save line"}</button>
                      </div>
                    </form>

                    <div className={styles.budgetLinePayments}>
                      <h4>Payments for this line</h4>
                      {linePayments.length === 0 ? <p>No payments scheduled yet.</p> : (
                        <ul>{linePayments.map((payment) => <li key={payment.id}>{PAYMENT_TYPE_LABELS[payment.payment_type]} · {money(payment.amount_cents)} · {formatDate(payment.due_on)} · {PAYMENT_STATUS_LABELS[paymentStatus(payment)]}</li>)}</ul>
                      )}
                      {isLvdSide(line.side) && linePayments.length === 0 && (
                        <button type="button" className={styles.budgetSecondary} disabled={busy === `lvd-${line.id}`} onClick={() => void run(`lvd-${line.id}`, "lvdSchedule", { lineId: line.id })}>
                          {busy === `lvd-${line.id}` ? "Making schedule…" : `Make 40/30/30 schedule from ${money(forecast)}`}
                        </button>
                      )}
                      <form id={`budget-add-payment-${line.id}`} onSubmit={addPayment(line)} className={styles.budgetGrid4}>
                        <label><span>Type</span><select name="type" defaultValue="installment">{PAYMENT_TYPES.map((type) => <option key={type} value={type}>{PAYMENT_TYPE_LABELS[type]}</option>)}</select></label>
                        <label><span>Payer</span><select name="payer" defaultValue="client">{PAYERS.map((payer) => <option key={payer} value={payer}>{PAYER_LABELS[payer]}</option>)}</select></label>
                        <label><span>Due</span><input name="due" type="date" /></label>
                        <label><span>Amount ($)</span><input name="amount" inputMode="decimal" required /></label>
                        <button type="submit" disabled={busy === `pay-${line.id}`}>{busy === `pay-${line.id}` ? "Adding…" : "Add payment"}</button>
                      </form>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <form id="budget-add-line" className={`${styles.budgetGrid4} ${styles.budgetAddLine}`} onSubmit={addLine}>
          <label><span>Vendor / expense</span><input name="vendor" required maxLength={200} placeholder="Ritz-Carlton catering" /></label>
          <label><span>Category</span><select name="category" defaultValue="Catering & Food">{BUDGET_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span>Paid to</span><select name="side" defaultValue="external">{BUDGET_SIDES.map((side) => <option key={side} value={side}>{BUDGET_SIDE_LABELS[side]}</option>)}</select></label>
          <label><span>Estimated ($)</span><input name="estimated" inputMode="decimal" placeholder="0" /></label>
          <button type="submit" disabled={busy === "addLine"}>{busy === "addLine" ? "Adding…" : "Add line"}</button>
        </form>
      </section>

      <section className={styles.budgetSection}>
        <header><h3>Payment schedule</h3><span>{payments.length} {payments.length === 1 ? "payment" : "payments"}</span></header>
        {payments.length === 0 ? (
          <p className={styles.budgetEmpty}>No payments yet. Open a budget line to schedule them, or make the 40/30/30 schedule on an LVD line.</p>
        ) : (
          <ul className={styles.checklistRows}>
            {payments.map((payment) => {
              const status = paymentStatus(payment);
              const line = lineById.get(payment.line_id);
              return (
                <li key={payment.id}>
                  <div className={styles.budgetPayment}>
                    <span className={`${styles.checklistStatus} ${styles.budgetPill} ${STATUS_CLASS[status] || ""}`}>{PAYMENT_STATUS_LABELS[status]}</span>
                    <div className={styles.checklistText}>
                      <strong>{line?.vendor ?? "Removed line"} · {PAYMENT_TYPE_LABELS[payment.payment_type]}</strong>
                      <small>
                        Due {formatDate(payment.due_on)} · {money(payment.amount_cents)}
                        {payment.paid_cents > 0 && status !== "paid" ? ` · ${money(paymentBalance(payment))} left` : ""}
                        {status === "paid" && payment.paid_on ? ` · paid ${formatDate(payment.paid_on)}` : ""}
                        {" · "}{PAYER_LABELS[payment.payer]}
                      </small>
                    </div>
                    <div className={styles.budgetPaymentActions}>
                      {status !== "paid" && status !== "waived" && (
                        <button
                          type="button"
                          disabled={payment.id.startsWith("wave:") || busy === payment.id}
                          onClick={() => void run(payment.id, "updatePayment", { paymentId: payment.id, paid_cents: payment.amount_cents, paid_on: todayIso() })}
                        >
                          Mark paid
                        </button>
                      )}
                      <button disabled={payment.id.startsWith("wave:")} type="button" onClick={() => setEditingPayment((current) => (current === payment.id ? "" : payment.id))} aria-expanded={editingPayment === payment.id}>
                        {editingPayment === payment.id ? "Close" : "Edit"}
                      </button>
                    </div>
                  </div>

                  {editingPayment === payment.id && (
                    <form className={styles.checklistEditor} onSubmit={savePayment(payment)}>
                      <div className={styles.budgetGrid3}>
                        <label><span>Type</span><select name="type" defaultValue={payment.payment_type}>{PAYMENT_TYPES.map((type) => <option key={type} value={type}>{PAYMENT_TYPE_LABELS[type]}</option>)}</select></label>
                        <label><span>Payer</span><select name="payer" defaultValue={payment.payer}>{PAYERS.map((payer) => <option key={payer} value={payer}>{PAYER_LABELS[payer]}</option>)}</select></label>
                        <label><span>Due</span><input name="due" type="date" defaultValue={payment.due_on ?? ""} /></label>
                      </div>
                      <div className={styles.budgetGrid3}>
                        <label><span>Amount due ($)</span><input name="amount" inputMode="decimal" defaultValue={centsToInput(payment.amount_cents)} /></label>
                        <label><span>Amount paid ($)</span><input name="paid" inputMode="decimal" defaultValue={centsToInput(payment.paid_cents)} /></label>
                        <label><span>Paid on</span><input name="paidOn" type="date" defaultValue={payment.paid_on ?? ""} /></label>
                      </div>
                      <div className={styles.uploadRow}>
                        <label><span>Set by hand</span><select name="manual" defaultValue={payment.manual_status ?? ""}><option value="">Work it out from dates</option><option value="disputed">Disputed</option><option value="waived">Waived</option></select></label>
                        <label><span>Notes</span><input name="notes" defaultValue={payment.notes ?? ""} maxLength={2000} /></label>
                      </div>
                      <div className={styles.uploadActions}>
                        <button
                          type="button"
                          className={styles.budgetDanger}
                          onClick={() => confirmFirst(`payment-${payment.id}`, () => void run(payment.id, "deletePayment", { paymentId: payment.id }))}
                          onBlur={() => setConfirming((current) => (current === `payment-${payment.id}` ? "" : current))}
                        >
                          {confirming === `payment-${payment.id}` ? "Tap again to remove" : "Remove payment"}
                        </button>
                        <button type="submit" disabled={busy === payment.id}>{busy === payment.id ? "Saving…" : "Save payment"}</button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.budgetSection}>
        <header><h3>By category</h3><span>Targets are set per couple</span></header>
        {rollup.length === 0 ? (
          <p className={styles.budgetEmpty}>Categories appear here as budget lines are added.</p>
        ) : (
          <div className={styles.budgetTableWrap}>
            <table className={styles.budgetTable}>
              <thead><tr><th>Category</th><th>Target %</th><th>Target</th><th>Forecast</th><th>Paid</th><th>Variance</th><th>% of budget</th></tr></thead>
              <tbody>
                {rollup.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{row.category}</th>
                    <td>
                      <input
                        aria-label={`Target percent for ${row.category}`}
                        inputMode="decimal"
                        defaultValue={row.targetPercent ?? ""}
                        key={`${row.category}-${row.targetPercent}`}
                        placeholder="—"
                        disabled={busy === `target-${row.category}`}
                        onBlur={(event) => void saveTarget(row.category, event.target.value)}
                      />
                    </td>
                    <td>{row.targetCents === null ? "—" : money(row.targetCents)}</td>
                    <td>{money(row.forecast)}</td>
                    <td>{money(row.paid)}</td>
                    <td className={row.variance !== null && row.variance < 0 ? styles.checklistLate : undefined}>{row.variance === null ? "—" : money(row.variance)}</td>
                    <td>{row.shareOfBudget === null ? "—" : `${row.shareOfBudget}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
