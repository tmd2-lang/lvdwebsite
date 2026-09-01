import Link from "next/link";
import styles from "../login/login.module.css";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <p className={styles.brand}>Lady Victoria Designs</p>
        <div><p className={styles.script}>A fresh start</p><h1>Back into<br />your studio.</h1><p className={styles.introCopy}>We’ll send a secure link to the email connected to your private studio account.</p></div>
        <p className={styles.privateNote}>Private studio access</p>
      </section>
      <section className={styles.formSide}><div className={styles.formWrap}>
        <p className={styles.kicker}>Password recovery</p><h2>Reset your password.</h2>
        <p className={styles.formCopy}>Enter your admin email and we’ll send a reset link if it belongs to the studio.</p>
        <ForgotPasswordForm /><Link className={styles.siteLink} href="/admin/login">← Back to sign in</Link>
      </div></section>
    </main>
  );
}
