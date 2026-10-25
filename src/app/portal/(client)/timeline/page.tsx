import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getCoupleTimeline } from "@/lib/couple-planning-data";
import CoupleTimeline from "@/components/portal/CoupleTimeline";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";
export default async function PortalTimelinePage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");
  const result = await getCoupleTimeline(session.client).then((timeline) => ({ timeline, error: false })).catch(() => ({ timeline: null, error: true }));
  return <div className={styles.content}>
    <header className={styles.sectionHero}><div><p className={styles.eyebrow}>Your event day</p><h1>A day to <em>remember.</em></h1></div><p>Your confirmed celebration schedule, gathered in one place.</p></header>
    {result.error ? <p role="alert">Your timeline could not be loaded. Please refresh to try again.</p> : <CoupleTimeline timeline={result.timeline} />}
  </div>;
}
