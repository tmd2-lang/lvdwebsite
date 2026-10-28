import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken, homePathForRole } from "@/lib/admin-auth";
import { getAdminLeads } from "@/lib/admin-data";
import { getNotes, getPlatformStats, getStatsForDay, getTodos } from "@/lib/marketing-data";
import { buildPlatformReport } from "@/lib/platform-stats";
import { canSeeMarketing } from "@/lib/marketing-access";
import MarketingWorkspace from "./MarketingWorkspace";
import MarketingDashboard from "./MarketingDashboard";

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

  // Imported Reddit numbers, joined with our own inquiries for people allowed to see ad attribution.
  const showInquiries = canSeeMarketing(user);
  let reddit = { available: false, report: buildPlatformReport("reddit", [], []), showInquiries };
  try {
    const [stats, leads] = await Promise.all([getPlatformStats("reddit"), showInquiries ? getAdminLeads({ includeMarketing: true }) : Promise.resolve([])]);
    reddit = { available: stats.available, report: buildPlatformReport("reddit", stats.rows, leads), showInquiries };
  } catch (error) {
    setupError = setupError || (error instanceof Error ? error.message : "Could not load the Reddit numbers.");
  }

  return (
    <MarketingDashboard
      reddit={reddit}
      openTodos={data.todos.filter((todo) => !todo.completed_at).length}
      notesCount={data.notes.length}
      canViewAdReport={canSeeMarketing(user)}
      setupError={setupError}
      journal={<MarketingWorkspace {...data} today={today} setupError={setupError} />}
    />
  );
}
