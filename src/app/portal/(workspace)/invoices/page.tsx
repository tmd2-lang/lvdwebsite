import InvoiceList from "@/components/portal/InvoiceList";
import styles from "../../portal.module.css";

export default function InvoicesPage() {
  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div><p className={styles.eyebrow}>Your investment</p><h1>Invoices &amp; <em>payments.</em></h1></div>
        <p>Review every invoice, select individual items, and keep track of your celebration balance.</p>
      </header>
      <InvoiceList />
    </div>
  );
}
