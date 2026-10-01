import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken, homePathForRole } from "@/lib/admin-auth";
import { getNotes, getStatsForDay, getTodos } from "@/lib/marketing-data";
import MarketingWorkspace from "./MarketingWorkspace";

export const dynamic = "force-dynamic";

function todayInNewYork() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/New_York",
  }).format(new Date());
}

export default async function MarketingPage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) redirect("/api/admin/auth/refresh?next=/admin/marketing");
    redirect("/admin/login");
  }
  if (user.role !== "owner") redirect(homePathForRole(user.role));

  const today = todayInNewYork();
  let setupError: string | null = null;
  let data = { todos: [] as Awaited<ReturnType<typeof getTodos>>, notes: [] as Awaited<ReturnType<typeof getNotes>>, stats: [] as Awaited<ReturnType<typeof getStatsForDay>> };
  try {
    const [todos, notes, stats] = await Promise.all([getTodos(), getNotes(), getStatsForDay(today)]);
    data = { todos, notes, stats };
  } catch (error) {
    setupError = error instanceof Error ? error.message : "Could not load the workspace.";
  }

  return <MarketingWorkspace {...data} today={today} setupError={setupError} />;
}
