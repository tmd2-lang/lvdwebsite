import { redirect } from "next/navigation";

// Budget and payments live on the invoices page; keep old links working.
export default function PortalPaymentsPage() {
  redirect("/portal/invoices");
}
