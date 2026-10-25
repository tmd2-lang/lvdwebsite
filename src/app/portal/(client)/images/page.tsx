import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getVisibleImagesForClient, withSignedUrls } from "@/lib/image-data";
import MoodboardReview from "@/components/portal/MoodboardReview";
import { getMoodboards } from "@/lib/moodboard-data";
import { isMoodboardApprover } from "@/lib/moodboard-view";
import ImageGallery from "./ImageGallery";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalImagesPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  // Only what the studio has chosen to reveal, and only for this celebration.
  const images = await getVisibleImagesForClient(session.client.id)
    .then(withSignedUrls)
    .catch(() => []);

  const boards = await getMoodboards(session.client.id).then((versions) => ({ versions, error: false })).catch(() => ({ versions: [], error: true }));

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your images</p>
          <h1>The look, <em>coming together.</em></h1>
        </div>
        <p>Inspiration, design references, and photographs from your celebration.</p>
      </header>

      {boards.error ? <p role="alert">Your moodboard could not be loaded. Please refresh before approving.</p> : <MoodboardReview versions={boards.versions} canApprove={isMoodboardApprover(session.relationship)} />}
      <ImageGallery images={images} />
    </div>
  );
}
