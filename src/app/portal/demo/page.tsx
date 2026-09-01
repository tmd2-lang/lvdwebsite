import Link from "next/link";
import { money, portalClient, portalInvoices } from "@/data/portal-demo";
import styles from "../portal.module.css";

export default function PortalDashboardPage() {
  const total = portalInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = portalInvoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const remaining = total - paid;
  const recentInvoices = portalInvoices.slice(0, 3);

  return (
    <div className={styles.content}>
      <section className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>Client planning portal</p>
          <h1>Welcome back, <em>{portalClient.firstName}.</em></h1>
          <p>Everything for your celebration, thoughtfully gathered in one place.</p>
        </div>
        <div className={styles.countdown}>
          <strong>{portalClient.daysToGo}</strong>
          <span>days to go</span>
        </div>
      </section>

      <section className={styles.balanceCard} aria-labelledby="balance-title">
        <div className={styles.balanceLead}>
          <p>Celebration investment</p>
          <h2 id="balance-title">{money(remaining)} <span>remaining</span></h2>
          <div className={styles.balanceTrack} aria-label={`${Math.round((paid / total) * 100)} percent paid`}>
            <span style={{ width: `${(paid / total) * 100}%` }} />
          </div>
          <div className={styles.balanceLegend}>
            <span><b>{money(paid)}</b> paid</span>
            <span><b>{money(total)}</b> total</span>
          </div>
        </div>
        <div className={styles.nextPayment}>
          <span>Next payment</span>
          <strong>{money(portalInvoices[0].amount)}</strong>
          <p>{portalInvoices[0].name} · {portalInvoices[0].statusLabel}</p>
          <Link href={`/portal/demo/invoices/${portalInvoices[0].id}`}>Review balance <i aria-hidden="true">→</i></Link>
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>Financials</p><h2>Recent invoices</h2></div>
            <Link href="/portal/demo/invoices">View all <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.invoiceList}>
            {recentInvoices.map((invoice, index) => (
              <Link href={`/portal/demo/invoices/${invoice.id}`} key={invoice.id}>
                <span className={styles.invoiceIndex}>0{index + 1}</span>
                <div><strong>{invoice.name}</strong><small>{invoice.id} · {invoice.phase}</small></div>
                <b>{money(invoice.amount)}</b>
                <span className={invoice.status === "Paid" ? styles.statusPaid : styles.statusDue}>{invoice.statusLabel}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.nextSteps}`}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>This week</p><h2>Next steps</h2></div>
            <Link href="/portal/demo/planning">Open plan <span aria-hidden="true">→</span></Link>
          </div>
          <ol>
            <li><span>01</span><div><strong>Review floral proposal</strong><small>2 selections need your approval</small></div></li>
            <li><span>02</span><div><strong>Upload guest count</strong><small>Requested by September 6</small></div></li>
            <li><span>03</span><div><strong>Design call</strong><small>September 12 · 2:00 PM</small></div></li>
          </ol>
        </section>
      </div>
    </div>
  );
}
