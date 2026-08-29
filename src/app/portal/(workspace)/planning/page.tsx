import Link from "next/link";
import { portalPhases } from "@/data/portal-demo";
import styles from "../../portal.module.css";

export default function PlanningPage() {
  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div><p className={styles.eyebrow}>The celebration plan</p><h1>From first vision to <em>final flourish.</em></h1></div>
        <p>See what’s complete, what needs your attention, and what the Lady Victoria team is preparing next.</p>
      </header>

      <section className={styles.phasePanel}>
        <div className={styles.phasePanelHeader}><div><p className={styles.eyebrow}>Project journey</p><h2>Your planning phases</h2></div><span>32% complete</span></div>
        <ol className={styles.phaseTimeline}>
          {portalPhases.map((phase, index) => (
            <li className={phase.status === "In progress" ? styles.phaseCurrent : phase.status === "Complete" ? styles.phaseComplete : undefined} key={phase.number}>
              <div className={styles.phaseMarker}><span>{phase.status === "Complete" ? "✓" : phase.number}</span>{index < portalPhases.length - 1 && <i />}</div>
              <div className={styles.phaseCopy}><div><span>{phase.date}</span><b>{phase.status}</b></div><h3>{phase.name}</h3><p>{phase.description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.planningGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Your attention</p><h2>Open approvals</h2></div><span className={styles.countBadge}>3</span></div>
          <div className={styles.approvalList}>
            <article><span>01</span><div><strong>Floral direction proposal</strong><small>Approve ceremony meadow and head table direction</small></div><Link href="/portal/documents">Review <i aria-hidden="true">→</i></Link></article>
            <article><span>02</span><div><strong>Reception floorplan v3</strong><small>Confirm dance floor and lounge placement</small></div><Link href="/portal/documents">Review <i aria-hidden="true">→</i></Link></article>
            <article><span>03</span><div><strong>Guest count</strong><small>Upload your current estimate by September 6</small></div><button type="button">Upload <i aria-hidden="true">→</i></button></article>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.meetingPanel}`}>
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Up next</p><h2>Design call</h2></div></div>
          <div className={styles.meetingDate}><strong>12</strong><span>September<br />2026</span></div>
          <h3>Floral &amp; tabletop review</h3>
          <p>2:00 PM · 60 minutes · Video call</p>
          <button type="button">Add to calendar</button>
        </section>
      </div>
    </div>
  );
}
