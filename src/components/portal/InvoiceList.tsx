"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money, portalInvoices } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

export default function InvoiceList() {
  const [status, setStatus] = useState("All");
  const [phase, setPhase] = useState("All phases");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const phases = ["All phases", ...Array.from(new Set(portalInvoices.map((invoice) => invoice.phase)))];
  const filtered = useMemo(() => portalInvoices.filter((invoice) => {
    const matchesStatus = status === "All" || invoice.status === status;
    const matchesPhase = phase === "All phases" || invoice.phase === phase;
    const haystack = `${invoice.id} ${invoice.name} ${invoice.category}`.toLowerCase();
    return matchesStatus && matchesPhase && haystack.includes(query.toLowerCase());
  }), [phase, query, status]);

  const total = portalInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = portalInvoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const due = portalInvoices.filter((invoice) => invoice.status !== "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);

  function demoDownload() {
    setNotice("The combined invoice download is ready for backend connection.");
    window.setTimeout(() => setNotice(""), 3500);
  }

  return (
    <>
      <section className={styles.invoiceSummary} aria-label="Invoice summary">
        <article><span>Full investment</span><strong>{money(total)}</strong><small>Across {portalInvoices.length} invoices</small></article>
        <article><span>Paid to date</span><strong>{money(paid)}</strong><small>2 completed payments</small></article>
        <article className={styles.invoiceSummaryDark}><span>Remaining balance</span><strong>{money(due)}</strong><small>Next payment due September 10</small></article>
      </section>

      <section className={styles.invoiceTablePanel}>
        <div className={styles.invoiceToolbar}>
          <div className={styles.filterTabs} aria-label="Filter invoices by status">
            {["All", "Due", "Upcoming", "Paid"].map((item) => (
              <button className={status === item ? styles.filterActive : undefined} type="button" onClick={() => setStatus(item)} key={item}>{item}</button>
            ))}
          </div>
          <div className={styles.invoiceControls}>
            <label>
              <span className={styles.srOnly}>Search invoices</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices" />
            </label>
            <label>
              <span className={styles.srOnly}>Filter by project phase</span>
              <select value={phase} onChange={(event) => setPhase(event.target.value)}>
                {phases.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button className={styles.secondaryButton} type="button" onClick={demoDownload}>Download all</button>
          </div>
        </div>

        <div className={styles.invoiceTableHeader} aria-hidden="true">
          <span>Invoice</span><span>Phase</span><span>Status</span><span>Amount</span><span />
        </div>
        <div className={styles.invoiceTable}>
          {filtered.map((invoice) => (
            <Link href={`/portal/demo/invoices/${invoice.id}`} key={invoice.id}>
              <div className={styles.invoiceName}>
                <span>{invoice.id}</span>
                <strong>{invoice.name}</strong>
                <small>{invoice.category} · Issued {invoice.issued}</small>
              </div>
              <span className={styles.tablePhase}>{invoice.phase}</span>
              <span className={invoice.status === "Paid" ? styles.statusPaid : invoice.status === "Due" ? styles.statusDue : styles.statusUpcoming}>{invoice.statusLabel}</span>
              <strong className={styles.tableAmount}>{money(invoice.amount)}</strong>
              <span className={styles.tableArrow} aria-hidden="true">→</span>
            </Link>
          ))}
          {filtered.length === 0 && <div className={styles.noResults}><strong>No matching invoices</strong><span>Try changing a filter or search term.</span></div>}
        </div>
      </section>
      <div className={`${styles.toast} ${notice ? styles.toastVisible : ""}`} role="status" aria-live="polite">{notice}</div>
    </>
  );
}
