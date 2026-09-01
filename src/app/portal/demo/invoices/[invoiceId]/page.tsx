import { notFound } from "next/navigation";
import InvoiceDetail from "@/components/portal/InvoiceDetail";
import { portalInvoices } from "@/data/portal-demo";
import styles from "../../../portal.module.css";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = portalInvoices.find((item) => item.id === invoiceId);
  if (!invoice) notFound();

  return <div className={`${styles.content} ${styles.invoiceDetailContent}`}><InvoiceDetail invoice={invoice} /></div>;
}
