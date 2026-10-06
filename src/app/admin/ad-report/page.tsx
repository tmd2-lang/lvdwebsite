import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getAdminLeads, getAdSpend } from "@/lib/admin-data";
import { canSeeMarketing } from "@/lib/marketing-access";
import AdReport from "./AdReport";

export const dynamic = "force-dynamic";

export default async function AdReportPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/ad-report");
    redirect("/admin/login");
  }
  if (!canSeeMarketing(user)) redirect("/admin/inquiries");

  const [leads, spend] = await Promise.all([getAdminLeads({ includeMarketing: true }), getAdSpend()]);
  return <AdReport leads={leads} initialSpend={spend.spend} spendAvailable={spend.available} names={spend.names} metaSyncedAt={spend.metaSyncedAt} />;
}
