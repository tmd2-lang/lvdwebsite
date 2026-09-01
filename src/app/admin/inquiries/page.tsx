import { redirect } from "next/navigation";
import { canSeeInquiries, getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getAdminLeads } from "@/lib/admin-data";
import InquiriesDashboard from "./InquiriesDashboard";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string | string[] }>;
}) {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) {
      redirect("/api/admin/auth/refresh?next=/admin/inquiries");
    }
    redirect("/admin/login");
  }

  if (!canSeeInquiries(user)) redirect("/admin/portal");

  const leads = await getAdminLeads();
  const leadParam = (await searchParams).lead;
  const requestedLeadId = typeof leadParam === "string" ? leadParam : "";
  const initialSelectedId = leads.some((lead) => lead.id === requestedLeadId) ? requestedLeadId : undefined;

  return <InquiriesDashboard initialLeads={leads} user={user} initialSelectedId={initialSelectedId} />;
}
