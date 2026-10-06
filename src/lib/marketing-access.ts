import type { AdminUser } from "./admin-types";

// Who may see ad attribution (ad names, IDs, landing pages). Override with a
// comma-separated MARKETING_VIEWER_EMAILS; everyone else never receives it.
const DEFAULT_MARKETING_VIEWERS = ["tjdozier98@gmail.com"];

export function canSeeMarketing(user: Pick<AdminUser, "email"> | null | undefined) {
  if (!user?.email) return false;
  const configured = (process.env.MARKETING_VIEWER_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  const viewers = configured.length ? configured : DEFAULT_MARKETING_VIEWERS;
  return viewers.includes(user.email.trim().toLowerCase());
}
