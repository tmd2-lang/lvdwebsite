import Image from "next/image";
import Link from "next/link";
import WelcomeForm from "./WelcomeForm";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function PortalWelcomePage() {
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
          <p className={styles.eyebrow}>Welcome to your portal</p>
          <h1>Let&rsquo;s get you <em>set up.</em></h1>
          <p>Choose a password and your private planning space is ready. It takes a moment.</p>
          <WelcomeForm />
        </div>
      </section>
    </main>
  );
}
