import { notFound, redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getClientById, getClientMembers } from "@/lib/client-data";
import { getInvoicesForClient } from "@/lib/invoice-data";
import { getDocumentsForClient } from "@/lib/document-data";
import ClientWorkspace from "./ClientWorkspace";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  const { id } = await params;
  if (!user) {
    if (await hasAdminRefreshToken()) redirect(`/api/admin/auth/refresh?next=/admin/portal/clients/${id}`);
    redirect("/admin/login");
  }

  const client = await getClientById(id);
  if (!client) notFound();

  const [members, invoices, documents] = await Promise.all([
    getClientMembers(client.id),
    getInvoicesForClient(client.id).catch(() => []),
    getDocumentsForClient(client.id).catch(() => []),
  ]);

  return <ClientWorkspace client={client} members={members} invoices={invoices} documents={documents} />;
}
