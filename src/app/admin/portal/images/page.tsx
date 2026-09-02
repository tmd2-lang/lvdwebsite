import Link from "next/link";
import styles from "../portal-admin.module.css";

export default function ImagesPage() {
  return (
    <main className={styles.libraryPage}>
      <header className={styles.libraryHeader}>
        <div><p className={styles.eyebrow}>Image administration</p><h1>Images</h1><p>Client inspiration, design references, and event galleries will live here.</p></div>
        <Link className={styles.newClientAction} href="/admin/portal/clients">Choose a client</Link>
      </header>

      <section className={styles.libraryEmpty}>
        <span aria-hidden="true">03</span>
        <div><p className={styles.eyebrow}>Nothing here yet</p><h2>No client images have been added.</h2><p>Images will stay organized by client once gallery uploads are connected.</p></div>
        <Link href="/admin/portal/clients">View clients <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
