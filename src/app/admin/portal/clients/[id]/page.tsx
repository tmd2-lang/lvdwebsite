import { notFound, redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById, getClientMembers } from "@/lib/client-data";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDeletedDocumentsForClient, getDocumentsForClient } from "@/lib/document-data";
import { getDeletedImagesForClient, getImagesForClient, withSignedUrls } from "@/lib/image-data";
import ClientWorkspace from "./ClientWorkspace";

export const dynamic = "force-dynamic";

const WORKSPACE_TABS = ["overview", "invoices", "documents", "images", "access"] as const;
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

  // Links from the studio-wide libraries say which tab they meant.
  const requestedTab = (await searchParams).tab;
  const initialTab = WORKSPACE_TABS.includes(requestedTab as WorkspaceTab)
    ? (requestedTab as WorkspaceTab)
    : "overview";

  const client = await getClientById(id);
  if (!client) notFound();

  const [members, invoices, documents, removedDocuments, images, removedImages] = await Promise.all([
    getClientMembers(client.id),
    getInvoicesForClient(client.id).catch(() => []),
    getDocumentsForClient(client.id).catch(() => []),
    getDeletedDocumentsForClient(client.id).catch(() => []),
    getImagesForClient(client.id).then(withSignedUrls).catch(() => []),
    getDeletedImagesForClient(client.id).then(withSignedUrls).catch(() => []),
  ]);

  return <ClientWorkspace client={client} members={members} invoices={invoices} documents={documents} removedDocuments={removedDocuments} images={images} removedImages={removedImages} initialTab={initialTab} />;
}
