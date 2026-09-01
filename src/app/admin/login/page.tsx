import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect("/admin");

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <p className={styles.brand}>Lady Victoria Designs</p>
        <div>
          <p className={styles.script}>Welcome back</p>
          <h1>Your studio,<br />beautifully organized.</h1>
          <p className={styles.introCopy}>One private workspace for inquiries, client portals, payments, documents, images, and every planning detail.</p>
        </div>
        <p className={styles.privateNote}>Private studio access</p>
      </section>
      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <p className={styles.kicker}>Studio administration</p>
          <h2>Good to see you.</h2>
          <p className={styles.formCopy}>Sign in with your approved administrator email and password.</p>
          <LoginForm />
          <Link className={styles.siteLink} href="/">← Back to the website</Link>
        </div>
      </section>
    </main>
  );
}
