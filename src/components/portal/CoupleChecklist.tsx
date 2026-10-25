import type { CoupleChecklistItem } from "@/lib/couple-planning-view";
import { CHECKLIST_STATUS_LABELS, formatChecklistDate } from "@/lib/checklist-view";
import styles from "./couple-planning.module.css";

export default function CoupleChecklist({ items }: { items: CoupleChecklistItem[] }) {
  const phases = [...new Set(items.map((item) => item.phase))];
  const complete = items.filter((item) => item.status === "complete").length;
  return <div className={styles.stack}>
    <p className={styles.notice}>{complete} of {items.length} shared items complete. Your planning team keeps statuses and dates up to date.</p>
    {!items.length && <p className={styles.empty}>Your team will share your next planning steps here.</p>}
    {phases.map((phase) => <section className={styles.card} key={phase}>
      <h2>{phase}</h2><ul className={styles.list}>
        {items.filter((item) => item.phase === phase).map((item) => <li key={item.id}>
          <div><span className={styles.eyebrow}>{item.kind === "your_task" ? "Your task" : "For your review"}</span><h3>{item.title}</h3>
            <p>{item.dueOn ? `Due ${formatChecklistDate(item.dueOn)}${item.suggested ? " · Suggested" : ""}` : "Your team will confirm a date"}</p></div>
          <span className={styles.badge}>{item.status === "waiting_client" ? "Waiting on you" : CHECKLIST_STATUS_LABELS[item.status]}</span>
        </li>)}
      </ul>
    </section>)}
  </div>;
}
