import type { CoupleTimeline as Timeline } from "@/lib/couple-planning-view";
import { formatTime } from "@/lib/timeline-view";
import styles from "./couple-planning.module.css";

export default function CoupleTimeline({ timeline }: { timeline: Timeline | null }) {
  if (!timeline) return <section className={styles.card}><h2>Your timeline is being prepared.</h2><p>Your planning team will share it here once the schedule is confirmed.</p></section>;
  return <section className={styles.card}>
    <div className={styles.heading}><h2>Your celebration schedule</h2><span className={styles.badge}>Confirmed · Version {timeline.version}</span></div>
    <p className={styles.notice}>Confirmed {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(new Date(timeline.confirmedAt))}</p>
    {!timeline.cues.length && <p className={styles.empty}>Your team has no shared schedule items yet.</p>}
    <ol className={styles.timeline}>{timeline.cues.map((cue) => <li key={cue.ref}>
      <time>{formatTime(cue.start)}{cue.end ? ` – ${formatTime(cue.end)}` : ""}</time>
      <div><span className={styles.eyebrow}>{cue.phase}</span><h3>{cue.activity}</h3>{cue.location && <p>{cue.location}</p>}</div>
    </li>)}</ol>
  </section>;
}
