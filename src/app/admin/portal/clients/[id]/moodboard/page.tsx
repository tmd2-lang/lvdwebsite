import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUser, canManageClientPortal } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { getMoodboards, getMoodboardProduction } from "@/lib/moodboard-data";
import { getImagesForClient, withSignedUrls } from "@/lib/image-data";
import MoodboardReview from "@/components/portal/MoodboardReview";
import MoodboardEditor from "@/components/portal/MoodboardEditor";
import styles from "../../../portal-admin.module.css";
export const dynamic = "force-dynamic";
export default async function MoodboardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser(); if (!user) redirect("/admin/login"); if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");
  const { id } = await params; const client = await getClientById(id); if (!client) notFound();
  const result = await Promise.all([getMoodboards(id), getMoodboardProduction(id), getImagesForClient(id).then((images) => withSignedUrls(images.filter((image) => image.album === "Design" && image.visible_to_client)))]).then(([versions, production, images]) => ({ versions, production, images })).catch((error) => ({ error: error instanceof Error ? error.message : "Could not load moodboard." }));
  return <main className={styles.workspacePage}><Link href={`/admin/portal/clients/${id}?tab=images&album=Design`}>Back to Images</Link><h1>Moodboard · {client.display_name}</h1>{"error" in result ? <p role="alert">{result.error}</p> : <><MoodboardReview versions={result.versions} preview /><MoodboardEditor clientId={id} current={result.versions[0] ?? null} production={result.production} images={result.images.map((image) => ({ id: image.id, name: image.name, url: image.url }))} /></>}</main>;
}
