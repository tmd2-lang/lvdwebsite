"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PortalPayment } from "@/data/portal-demo";
import { money, portalPayments } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

export default function PaymentHistory() {
  const [receipt, setReceipt] = useState<PortalPayment | null>(null);
  const [notice, setNotice] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const paidTotal = portalPayments.reduce((sum, payment) => sum + payment.amount, 0);

  useEffect(() => {
    if (!receipt) return;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && setReceipt(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [receipt]);

  function demoDownload(id: string) {
    setNotice(`${id} will download when receipt storage is connected.`);
    window.setTimeout(() => setNotice(""), 3400);
  }

  return (
    <>
      <section className={styles.paymentHistorySummary}>
        <article className={styles.paymentHistoryPrimary}><span>Paid to date</span><strong>{money(paidTotal)}</strong><small>32% of your celebration investment</small></article>
        <article><span>Receipts available</span><strong>{portalPayments.length}</strong><small>Every completed payment, stored here</small></article>
        <article><span>Next payment</span><strong>$12,500</strong><small>Due September 10 · LVD-1028</small></article>
      </section>

      <section className={styles.receiptPanel}>
        <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Payment archive</p><h2>Receipts &amp; payment history</h2></div><button type="button" onClick={() => demoDownload("All receipts")}>Download all</button></div>
        <div className={styles.receiptTableHeader} aria-hidden="true"><span>Receipt</span><span>Payment method</span><span>Amount</span><span /></div>
        <div className={styles.receiptTable}>
          {portalPayments.map((payment) => (
            <article key={payment.id}>
              <span className={styles.receiptMark}>✓</span>
              <div><strong>{payment.invoiceName}</strong><small>{payment.id} · {payment.date} · {payment.invoiceId}</small></div>
              <span className={styles.receiptMethod}>{payment.method}<small>{payment.reference}</small></span>
              <b>{money(payment.amount)}</b>
              <button type="button" onClick={() => setReceipt(payment)}>View receipt</button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.autopayNote}><div><span aria-hidden="true">i</span><p><strong>Payments stay under your control.</strong><small>Nothing is charged automatically. You choose exactly which invoice items to pay and when.</small></p></div><Link href="/portal/invoices">View open invoices <span>→</span></Link></section>

      {receipt && <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && setReceipt(null)}>
        <section className={`${styles.paymentModal} ${styles.receiptModal}`} role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <button className={styles.modalClose} ref={closeRef} type="button" onClick={() => setReceipt(null)} aria-label="Close receipt">×</button>
          <div className={styles.receiptSuccessMark}>✓</div>
          <p className={styles.eyebrow}>Payment complete</p>
          <h2 id="receipt-title">Thank you, Amara.</h2>
          <p className={styles.modalIntro}>Your payment was received and applied to {receipt.invoiceId}.</p>
          <div className={styles.receiptAmount}><span>Amount paid</span><strong>{money(receipt.amount)}</strong><small>{receipt.date}</small></div>
          <dl className={styles.receiptDetails}><div><dt>Receipt</dt><dd>{receipt.id}</dd></div><div><dt>Invoice</dt><dd>{receipt.invoiceId}</dd></div><div><dt>Payment method</dt><dd>{receipt.reference}</dd></div><div><dt>Status</dt><dd>Paid in full</dd></div></dl>
          <button className={styles.primaryButton} type="button" onClick={() => demoDownload(receipt.id)}>Download receipt</button>
        </section>
      </div>}
      <div className={`${styles.toast} ${notice ? styles.toastVisible : ""}`} role="status" aria-live="polite">{notice}</div>
    </>
  );
}
