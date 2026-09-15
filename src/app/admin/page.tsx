import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken, homePathForRole } from "@/lib/admin-auth";
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

  // The studio overview remains owner-only; planners and inquiry staff use their scoped workspaces.
  if (user.role !== "owner") redirect(homePathForRole(user.role));

  const leads = await getAdminLeads();
  return <AdminHome initialLeads={leads} user={user} nowIso={new Date().toISOString()} />;
}
