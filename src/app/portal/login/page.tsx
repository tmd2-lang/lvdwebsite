import Image from "next/image";
import Link from "next/link";
import ClientLogin from "@/components/portal/ClientLogin";
import styles from "../portal.module.css";

export default function PortalLoginPage() {
  return (
    <main className={styles.loginShell}>
      <section className={styles.loginVisual}>
        <Image src="/gallery/amber-kendall/amber-kendall-23.jpeg" alt="A refined lounge setting designed by Lady Victoria Designs" fill priority sizes="(max-width: 820px) 100vw, 48vw" />
        <div className={styles.loginOverlay} />
        <Link href="/" className={styles.loginBrand}><span>LVD</span><b>Lady Victoria Designs</b></Link>
        <div className={styles.loginQuote}><p>Every detail, every decision, <em>beautifully held.</em></p><span>Your private planning atelier</span></div>
      </section>
      <section className={styles.loginPanel}>
        <Link className={styles.demoLink} href="/portal/demo">Demo <span aria-hidden="true">↗</span></Link>
        <div className={styles.loginPanelInner}>
          <p className={styles.eyebrow}>Client planning portal</p>
          <h1>Welcome <em>back.</em></h1>
          <p>Sign in to view your celebration plan, invoices, approvals, and documents.</p>
          <ClientLogin />
        </div>
      </section>
    </main>
  );
}
