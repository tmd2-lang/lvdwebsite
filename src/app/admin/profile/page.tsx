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

  return <ProfileForm initialProfile={user} />;
}
