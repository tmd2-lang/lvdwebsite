import { notFound, redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import MoodboardReview from "@/components/portal/MoodboardReview";
import { getMoodboards } from "@/lib/moodboard-data";
import { isMoodboardApprover } from "@/lib/moodboard-view";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalMoodboardPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const boards = await getMoodboards(session.client.id).then((versions) => ({ versions, error: false })).catch(() => ({ versions: [], error: true }));
  // Planning-only couples have no design to approve, unless one was shared anyway.
  if (!session.client.design_tier && !boards.versions.length && !boards.error) notFound();

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your design</p>
          <h1>Your <em>moodboard.</em></h1>
        </div>
        <p>Review each design version your team shares. One partner&apos;s approval is all it takes.</p>
      </header>

      {boards.error ? <p role="alert">Your moodboard could not be loaded. Please refresh before approving.</p> : <MoodboardReview versions={boards.versions} canApprove={isMoodboardApprover(session.relationship)} />}
    </div>
  );
}
