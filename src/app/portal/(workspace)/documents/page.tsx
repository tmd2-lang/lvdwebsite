import DocumentCenter from "@/components/portal/DocumentCenter";
import styles from "../../portal.module.css";

export default function DocumentsPage() {
  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div><p className={styles.eyebrow}>Your archive</p><h1>Documents, <em>beautifully organized.</em></h1></div>
        <p>Contracts, proposals, floorplans, and every planning file—always in their latest version.</p>
      </header>
      <DocumentCenter />
    </div>
  );
}
