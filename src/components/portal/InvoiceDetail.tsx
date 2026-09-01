"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PortalInvoice } from "@/data/portal-demo";
import { money } from "@/data/portal-demo";
import styles from "@/app/portal/portal.module.css";

type PaymentMethod = "card" | "ach" | "wallet";

export default function InvoiceDetail({ invoice }: { invoice: PortalInvoice }) {
  const unpaidItems = invoice.lineItems.filter((item) => !item.paid);
  const [selected, setSelected] = useState(() => unpaidItems.map((item) => item.id));
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [complete, setComplete] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const selectedTotal = useMemo(() => invoice.lineItems
    .filter((item) => selected.includes(item.id) && !item.paid)
    .reduce((sum, item) => sum + item.amount, 0), [invoice.lineItems, selected]);

  useEffect(() => {
    if (!paymentOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPaymentOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentOpen]);

  function toggleItem(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function openPayment() {
    setComplete(false);
    setPaymentOpen(true);
  }

  return (
    <>
      <div className={styles.invoiceDetailTopline}>
        <Link href="/portal/demo/invoices"><span aria-hidden="true">←</span> All invoices</Link>
        <button type="button">Download PDF</button>
      </div>

      <section className={styles.invoicePaper}>
        <header className={styles.invoicePaperHeader}>
          <div>
            <p className={styles.eyebrow}>Lady Victoria Designs</p>
            <h1>{invoice.name}</h1>
            <span>{invoice.id} · {invoice.phase}</span>
          </div>
          <div className={styles.invoicePaperMeta}>
            <span className={invoice.status === "Paid" ? styles.statusPaid : invoice.status === "Due" ? styles.statusDue : styles.statusUpcoming}>{invoice.statusLabel}</span>
            <dl><div><dt>Issued</dt><dd>{invoice.issued}</dd></div><div><dt>Due</dt><dd>{invoice.due}</dd></div></dl>
          </div>
        </header>

        <div className={styles.invoiceBillTo}>
          <div><span>Prepared for</span><strong>Amara &amp; Julien</strong><small>Meridian House · May 17, 2027</small></div>
          <div><span>Invoice total</span><strong>{money(invoice.amount)}</strong><small>{invoice.lineItems.length} item{invoice.lineItems.length === 1 ? "" : "s"}</small></div>
        </div>

        <div className={styles.lineItemHeading}>
          <div><span>Select</span><span>Item</span></div><span>Amount</span>
        </div>
        <div className={styles.lineItems}>
          {invoice.lineItems.map((item) => (
            <label className={item.paid ? styles.lineItemPaid : undefined} key={item.id}>
              <input type="checkbox" checked={item.paid || selected.includes(item.id)} disabled={item.paid} onChange={() => toggleItem(item.id)} />
              <span className={styles.customCheck} aria-hidden="true">{item.paid || selected.includes(item.id) ? "✓" : ""}</span>
              <span className={styles.lineItemCopy}><strong>{item.name}</strong><small>{item.detail}</small>{item.paid && <em>Paid</em>}</span>
              <b>{money(item.amount)}</b>
            </label>
          ))}
        </div>

        <footer className={styles.invoicePaperFooter}>
          <p>Select any unpaid items above, or leave everything selected to pay the full invoice.</p>
          <div><span>Invoice total</span><strong>{money(invoice.amount)}</strong></div>
        </footer>
      </section>

      <aside className={styles.paymentBar} aria-live="polite">
        <div><span>Selected to pay</span><strong>{money(selectedTotal)}</strong><small>{selected.length} selected item{selected.length === 1 ? "" : "s"}</small></div>
        {invoice.status === "Paid" ? <button type="button">Download receipt</button> : <button type="button" disabled={selectedTotal === 0} onClick={openPayment}>Review payment <span aria-hidden="true">→</span></button>}
      </aside>

      {paymentOpen && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && setPaymentOpen(false)}>
          <section className={styles.paymentModal} role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <button className={styles.modalClose} ref={closeButtonRef} type="button" onClick={() => setPaymentOpen(false)} aria-label="Close payment preview">×</button>
            {!complete ? (
              <>
                <p className={styles.eyebrow}>Payment preview</p>
                <h2 id="payment-title">Choose how you’d like to pay.</h2>
                <p className={styles.modalIntro}>This is a visual prototype. No payment information will be collected or processed.</p>

                <div className={styles.paymentAmount}><span>Payment amount</span><strong>{money(selectedTotal)}</strong><small>{selected.length} item{selected.length === 1 ? "" : "s"} from {invoice.id}</small></div>

                <fieldset className={styles.paymentMethods}>
                  <legend>Payment method</legend>
                  <button className={method === "card" ? styles.methodActive : undefined} type="button" onClick={() => setMethod("card")}><span>Card</span><small>Credit or debit</small><b>{method === "card" ? "✓" : ""}</b></button>
                  <button className={method === "ach" ? styles.methodActive : undefined} type="button" onClick={() => setMethod("ach")}><span>Bank</span><small>ACH transfer</small><b>{method === "ach" ? "✓" : ""}</b></button>
                  <button className={method === "wallet" ? styles.methodActive : undefined} type="button" onClick={() => setMethod("wallet")}><span>Wallet</span><small>Apple Pay or Google Pay</small><b>{method === "wallet" ? "✓" : ""}</b></button>
                </fieldset>

                {method === "card" && <div className={styles.fakeFields}><label>Card number<input disabled value="•••• •••• •••• 4242" aria-label="Example card number" /></label><div><label>Expiration<input disabled value="05 / 29" aria-label="Example expiration" /></label><label>Security code<input disabled value="•••" aria-label="Example security code" /></label></div></div>}
                {method === "ach" && <div className={styles.methodNote}><strong>Secure bank connection</strong><span>A real version would open the payment provider’s verified bank-linking flow.</span></div>}
                {method === "wallet" && <div className={styles.methodNote}><strong>Express checkout</strong><span>Apple Pay or Google Pay would appear when supported on the client’s device.</span></div>}

                <button className={styles.primaryButton} type="button" onClick={() => setComplete(true)}>Preview confirmation · {money(selectedTotal)}</button>
                <p className={styles.secureNote}>Prototype only · Nothing will be charged</p>
              </>
            ) : (
              <div className={styles.paymentSuccess}>
                <span aria-hidden="true">✓</span>
                <p className={styles.eyebrow}>Confirmation state</p>
                <h2 id="payment-title">Payment received.</h2>
                <p>In the finished portal, the balance would update instantly and a receipt would be emailed automatically.</p>
                <div><span>Receipt total</span><strong>{money(selectedTotal)}</strong><small>Demo receipt · {invoice.id}</small></div>
                <button className={styles.primaryButton} type="button" onClick={() => setPaymentOpen(false)}>Return to invoice</button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
