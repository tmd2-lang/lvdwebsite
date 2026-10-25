import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getCoupleChecklist } from "@/lib/couple-planning-data";
import CoupleChecklist from "@/components/portal/CoupleChecklist";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalTasksPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const result = await getCoupleChecklist(session.client).then((items) => ({ items, error: false })).catch(() => ({ items: [], error: true }));

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your planning checklist</p>
          <h1>What&rsquo;s <em>next.</em></h1>
        </div>
        <p>Your tasks and the decisions your team is preparing for you.</p>
      </header>

      {result.error ? <p role="alert">Your checklist could not be loaded. Please refresh to try again.</p> : <CoupleChecklist items={result.items} />}
    </div>
  );
}
