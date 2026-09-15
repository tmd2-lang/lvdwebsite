import UpdatePasswordForm from "../update-password/UpdatePasswordForm";

export const dynamic = "force-dynamic";

/**
 * Supabase dashboard invitations default to the public site URL. This route
 * gives those links a studio-specific landing page without changing the
 * global Site URL (client invitations use /portal/welcome).
 */
export default function AdminWelcomePage() {
  return <UpdatePasswordForm />;
}
