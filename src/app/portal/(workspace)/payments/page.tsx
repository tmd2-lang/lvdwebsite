import PaymentHistory from "@/components/portal/PaymentHistory";
import styles from "../../portal.module.css";

export default function PaymentsPage() {
  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div><p className={styles.eyebrow}>Your payment record</p><h1>Every payment, <em>clearly accounted for.</em></h1></div>
        <p>View payment history, open detailed receipts, and download a record whenever you need it.</p>
      </header>
      <PaymentHistory />
    </div>
  );
}
