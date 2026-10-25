import { redirect } from "next/navigation";
import { canManageClientPortal, getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import { getStudioCalendar } from "@/lib/calendar-data";
import { studioToday, type CalendarData } from "@/lib/calendar-view";
import CalendarPanel from "./CalendarPanel";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/portal/calendar");
    redirect("/admin/login");
  }
  if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");
  let data: CalendarData;
  try {
    data = await getStudioCalendar();
  } catch {
    data = { clients: [], entries: [], warnings: ["The studio calendar could not be loaded. Refresh to try again."] };
  }
  return <CalendarPanel data={data} initialToday={studioToday()} />;
}
