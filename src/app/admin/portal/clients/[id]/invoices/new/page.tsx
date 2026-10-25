import { redirect } from "next/navigation";
import { getAdminUser, canManageClientPortal } from "@/lib/admin-auth";
export default async function NewInvoicePage() {
 const user = await getAdminUser(); if (!user) redirect("/admin/login");
 if (!canManageClientPortal(user)) redirect("/admin/portal/inquiries");
 redirect("/admin/portal/wave");
}
