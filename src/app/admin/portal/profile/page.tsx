import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import ProfileForm from "@/app/admin/profile/ProfileForm";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <ProfileForm initialProfile={user} embedded />;
}
