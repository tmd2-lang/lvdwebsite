import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getAdminLeads } from "@/lib/admin-data";
import InquiriesDashboard from "./InquiriesDashboard";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) {
      redirect("/api/admin/auth/refresh?next=/admin/inquiries");
    }
    redirect("/admin/login");
  }

  const leads = await getAdminLeads();
  return <InquiriesDashboard initialLeads={leads} user={user} />;
}
