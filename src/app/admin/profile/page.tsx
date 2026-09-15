import { redirect } from "next/navigation";
import { getAdminUser, hasAdminRefreshToken } from "@/lib/admin-auth";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const user = await getAdminUser();
  if (!user) {
    if (await hasAdminRefreshToken()) {
      redirect("/api/admin/auth/refresh?next=/admin/profile");
    }
    redirect("/admin/login");
  }

  // Non-owners use the portal shell, which applies their role-specific navigation.
  if (user.role !== "owner") redirect("/admin/portal/profile");

  return <ProfileForm initialProfile={user} />;
}
