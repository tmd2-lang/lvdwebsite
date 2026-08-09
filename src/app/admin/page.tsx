import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getAdminLeads } from "@/lib/admin-data";
import AdminHome from "./AdminHome";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) {
      redirect("/api/admin/auth/refresh?next=/admin");
    }
    redirect("/admin/login");
  }

  const leads = await getAdminLeads();
  return <AdminHome initialLeads={leads} user={user} nowIso={new Date().toISOString()} />;
}
