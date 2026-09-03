import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import PortalProfileForm from "./ProfileForm";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const { user } = session;

  return (
    <div className={styles.content}>
      <header className={styles.sectionHero}>
        <div>
          <p className={styles.eyebrow}>Your account</p>
          <h1>Your <em>details.</em></h1>
        </div>
        <p>This is you, not your celebration. Change your name or your password here.</p>
      </header>

      <PortalProfileForm currentName={user.displayName || user.firstName} email={user.email} />
    </div>
  );
}
