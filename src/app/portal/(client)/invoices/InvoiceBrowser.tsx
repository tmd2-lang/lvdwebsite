"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Invoice } from "@/lib/invoice-types";
import { invoiceOutstanding, invoiceTotal, money } from "@/lib/invoice-types";
import styles from "@/app/portal/portal.module.css";

function shortDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

export default function InvoiceBrowser({ invoices }: { invoices: Invoice[] }) {
  const [status, setStatus] = useState("All");
  const [phase, setPhase] = useState("All phases");
  const [query, setQuery] = useState("");

  const phases = ["All phases", ...Array.from(new Set(invoices.map((i) => i.phase).filter(Boolean) as string[]))];

  const filtered = useMemo(() => invoices.filter((invoice) => {
    const outstanding = invoiceOutstanding(invoice);
    const matchesStatus =
      status === "All" ||
      (status === "Paid" && outstanding === 0) ||
      (status === "Due" && outstanding > 0);
    const matchesPhase = phase === "All phases" || invoice.phase === phase;
    const haystack = `${invoice.reference} ${invoice.name} ${invoice.category || ""}`.toLowerCase();
    return matchesStatus && matchesPhase && haystack.includes(query.toLowerCase());
  }), [invoices, phase, query, status]);

  return (
    <section className={styles.invoiceTablePanel}>
      <div className={styles.invoiceToolbar}>
        <div className={styles.filterTabs} aria-label="Filter invoices by status">
          {["All", "Due", "Paid"].map((item) => (
            <button
              className={status === item ? styles.filterActive : undefined}
              type="button"
              onClick={() => setStatus(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.invoiceControls}>
          <label>
            <span className={styles.srOnly}>Search invoices</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoices" />
          </label>
          {phases.length > 1 && (
            <label>
              <span className={styles.srOnly}>Filter by project phase</span>
              <select value={phase} onChange={(e) => setPhase(e.target.value)}>
                {phases.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>

      <div className={styles.invoiceTableHeader} aria-hidden="true">
        <span>Invoice</span><span>Phase</span><span>Status</span><span>Amount</span><span />
      </div>
      <div className={styles.invoiceTable}>
        {filtered.map((invoice) => {
          const outstanding = invoiceOutstanding(invoice);
          return (
            <Link href={`/portal/invoices/${invoice.id}`} key={invoice.id}>
              <div className={styles.invoiceName}>
                <span>{invoice.reference}</span>
                <strong>{invoice.name}</strong>
                <small>{invoice.category ? `${invoice.category} · ` : ""}Issued {shortDate(invoice.issued_on)}</small>
              </div>
              <span className={styles.tablePhase}>{invoice.phase || "—"}</span>
              <span className={outstanding === 0 ? styles.statusPaid : styles.statusDue}>
                {outstanding === 0 ? "Paid" : invoice.due_on ? `Due ${shortDate(invoice.due_on)}` : "Due"}
              </span>
              <strong className={styles.tableAmount}>{money(invoiceTotal(invoice))}</strong>
              <span className={styles.tableArrow} aria-hidden="true">→</span>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className={styles.noResults}>
            <strong>{invoices.length === 0 ? "No invoices yet" : "No matching invoices"}</strong>
            <span>{invoices.length === 0 ? "Your invoices will appear here once the studio prepares them." : "Try changing a filter or search term."}</span>
          </div>
        )}
      </div>
    </section>
  );
}
