import { redirect } from "next/navigation";

// Invoices and Payments were the same Wave view; keep old links working.
export default function PortalPaymentsPage() {
  redirect("/portal/invoices");
}
