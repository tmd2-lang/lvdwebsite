import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect("/admin/inquiries");

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <p className={styles.brand}>Lady Victoria Designs</p>
        <div>
          <p className={styles.script}>Welcome back</p>
          <h1>Your inquiries,<br />beautifully organized.</h1>
          <p className={styles.introCopy}>A quiet place to review new celebrations, keep notes, and follow each client from first hello to booked.</p>
        </div>
        <p className={styles.privateNote}>Private studio access</p>
      </section>
      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <p className={styles.kicker}>Studio sign in</p>
          <h2>Good to see you.</h2>
          <p className={styles.formCopy}>Use the email and password created for your studio.</p>
          <LoginForm />
          <Link className={styles.siteLink} href="/">← Back to the website</Link>
        </div>
      </section>
    </main>
  );
}
