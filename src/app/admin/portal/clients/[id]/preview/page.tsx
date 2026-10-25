import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { getCoupleChecklist, getCoupleTimeline } from "@/lib/couple-planning-data";
import { getCoupleGuests } from "@/lib/couple-guests-data";
import CoupleChecklist from "@/components/portal/CoupleChecklist";
import CoupleTimeline from "@/components/portal/CoupleTimeline";
import CoupleGuestManager from "@/components/portal/CoupleGuestManager";
import styles from "@/components/portal/couple-planning.module.css";
import portalStyles from "../../../portal-admin.module.css";

export const dynamic = "force-dynamic";
export default async function CouplePreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  const requested = (await searchParams).view;
  const view = ["guests", "timeline"].includes(requested ?? "") ? requested : "checklist";
  const result = await (async () => {
    if (view === "guests") return { kind: "guests" as const, guests: await getCoupleGuests(client.id) };
    if (view === "timeline") return { kind: "timeline" as const, timeline: await getCoupleTimeline(client) };
    return { kind: "checklist" as const, checklist: await getCoupleChecklist(client) };
  })().catch(() => null);
  const content = !result ? <p role="alert">This couple view could not be loaded. Please refresh to try again.</p>
    : result.kind === "guests" ? <CoupleGuestManager initial={result.guests} readOnly />
    : result.kind === "timeline" ? <CoupleTimeline timeline={result.timeline} />
    : <CoupleChecklist items={result.checklist} />;
  return <main className={portalStyles.workspacePage}>
    <div className={styles.preview}><strong>Couple preview · {client.display_name}</strong><p>This uses the same filtered content as their portal. Changes are disabled.</p><nav aria-label="Couple preview"><Link href={`/admin/portal/clients/${id}`}>Back to studio record</Link>{["checklist", "guests", "timeline"].map((tab) => <Link aria-current={tab === view ? "page" : undefined} href={`/admin/portal/clients/${id}/preview?view=${tab}`} key={tab}>{tab === "checklist" ? "Checklist" : tab === "guests" ? "Guests" : "Timeline"}</Link>)}</nav></div>
    {content}
  </main>;
}
