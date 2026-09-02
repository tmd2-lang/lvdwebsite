import Image from "next/image";
import Link from "next/link";
import UpdatePasswordForm from "./UpdatePasswordForm";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function PortalUpdatePasswordPage() {
  return (
    <main className={styles.loginShell}>
      <section className={styles.loginVisual}>
        <Image src="/gallery/amber-kendall/amber-kendall-23.jpeg" alt="A refined lounge setting designed by Lady Victoria Designs" fill priority sizes="(max-width: 820px) 100vw, 48vw" />
        <div className={styles.loginOverlay} />
        <Link href="/" className={styles.loginBrand}><span>LVD</span><b>Lady Victoria Designs</b></Link>
        <div className={styles.loginQuote}><p>Every detail, every decision, <em>beautifully held.</em></p><span>Your private planning atelier</span></div>
      </section>
      <section className={styles.loginPanel}>
        <div className={styles.loginPanelInner}>
          <p className={styles.eyebrow}>Client planning portal</p>
          <h1>Choose a <em>new password.</em></h1>
          <p>Pick something only you would know. We&rsquo;ll take you straight into your portal.</p>
          <UpdatePasswordForm />
        </div>
      </section>
    </main>
  );
}
