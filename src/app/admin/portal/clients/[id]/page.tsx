import { notFound, redirect } from "next/navigation";
import { canManageClientPortal, getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById, getClientMembers } from "@/lib/client-data";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDeletedDocumentsForClient, getDocumentsForClient } from "@/lib/document-data";
import { getDeletedImagesForClient, getImagesForClient, withSignedUrls } from "@/lib/image-data";
import { getTasksForClient } from "@/lib/task-data";
import { getChecklistRows } from "@/lib/checklist-data";
import { buildChecklist } from "@/lib/checklist-view";
import ClientWorkspace from "./ClientWorkspace";

export const dynamic = "force-dynamic";

const WORKSPACE_TABS = ["overview", "checklist", "tasks", "invoices", "documents", "images", "access"] as const;
type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getAdminUser();
  const { id } = await params;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=/admin/portal/clients/${id}`);
    redirect("/admin/login");
  }
  if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");

  // Links from the studio-wide libraries say which tab they meant.
  const requestedTab = (await searchParams).tab;
  const initialTab = WORKSPACE_TABS.includes(requestedTab as WorkspaceTab)
    ? (requestedTab as WorkspaceTab)
    : "overview";

  const client = await getClientById(id);
  if (!client) notFound();

  const [members, invoices, documents, removedDocuments, images, removedImages, tasks] = await Promise.all([
    getClientMembers(client.id),
    getInvoicesForClient(client.id).catch(() => []),
    getDocumentsForClient(client.id).catch(() => []),
    getDeletedDocumentsForClient(client.id).catch(() => []),
    getImagesForClient(client.id).then(withSignedUrls).catch(() => []),
    getDeletedImagesForClient(client.id).then(withSignedUrls).catch(() => []),
    getTasksForClient(client.id).catch(() => []),
  ]);

  // The checklist still renders from the template if its table is missing,
  // with the reason shown, so the studio can see it before setup is done.
  const checklistLoad = await getChecklistRows(client.id)
    .then((rows) => ({ rows, error: "" }))
    .catch((error: unknown) => ({
      rows: [],
      error: error instanceof Error ? error.message : "Could not load the planning checklist.",
    }));
  const checklist = buildChecklist(client, checklistLoad.rows);
  const checklistError = checklistLoad.error;

  return <ClientWorkspace client={client} members={members} invoices={invoices} documents={documents} removedDocuments={removedDocuments} images={images} removedImages={removedImages} tasks={tasks} checklist={checklist} checklistError={checklistError} initialTab={initialTab} />;
}
