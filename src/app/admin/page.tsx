import { redirect } from "next/navigation";
import { canSeeInquiries, getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
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

  // Planners have no inquiry access, so the studio overview is not their home.
  if (!canSeeInquiries(user)) redirect("/admin/portal");

  const leads = await getAdminLeads();
  return <AdminHome initialLeads={leads} user={user} nowIso={new Date().toISOString()} />;
}
