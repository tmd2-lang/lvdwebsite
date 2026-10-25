import Link from "next/link";
import { redirect,notFound } from "next/navigation";
import { Buffer } from "node:buffer";
import { getPortalSession } from "@/lib/portal-auth";
import { getWaveInvoices } from "@/lib/wave-data";
import { waveIsBillable } from "@/lib/wave-view";
import { studioToday } from "@/lib/calendar-view";
import WaveInvoices from "@/components/portal/WaveInvoices";
import styles from "../../../portal.module.css";
export const dynamic="force-dynamic";
export default async function PortalInvoiceDetail({params}:{params:Promise<{invoiceId:string}>}) {
 const session=await getPortalSession();if(!session)redirect("/portal/login");const {invoiceId}=await params;
 const rows=await getWaveInvoices(session.client.id),invoice=rows.find(row=>"wave_"+Buffer.from(row.id).toString("base64url")===invoiceId&&waveIsBillable(row));if(!invoice)notFound();
 return <div className={styles.content}><Link href="/portal/invoices">All invoices</Link><WaveInvoices invoices={[invoice]} eventDate={session.client.event_date} today={studioToday()}/></div>;
}
