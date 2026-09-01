import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { countClients } from "@/lib/client-data";
import AdminPortalHome from "./AdminPortalHome";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const user = await getAdminUser();

  if (!user) {
    if (await hasAdminRefreshToken()) {
      redirect("/api/admin/auth/refresh?next=/admin/portal");
    }
    redirect("/admin/login");
  }

  const clientCount = await countClients().catch(() => 0);

  return <AdminPortalHome user={user} clientCount={clientCount} />;
}
