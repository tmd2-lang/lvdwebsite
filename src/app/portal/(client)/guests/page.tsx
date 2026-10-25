import { redirect } from "next/navigation";
import { getPortalSession, canEditGuestList } from "@/lib/portal-auth";
import { getCoupleGuests } from "@/lib/couple-guests-data";
import CoupleGuestManager from "@/components/portal/CoupleGuestManager";
import styles from "../../portal.module.css";

export const dynamic = "force-dynamic";
export default async function PortalGuestsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");
  const result = await getCoupleGuests(session.client.id).then((data) => ({ data, error: false })).catch(() => ({ data: null, error: true }));
  return <div className={styles.content}>
    <header className={styles.sectionHero}><div><p className={styles.eyebrow}>Your people</p><h1>Everyone you <em>love.</em></h1></div><p>Keep your guests, households, meals and travel details together.</p></header>
    {result.error || !result.data ? <p role="alert">Your guest list could not be loaded. Please refresh to try again.</p> : <CoupleGuestManager initial={result.data} readOnly={!canEditGuestList(session.relationship)} />}
  </div>;
}
