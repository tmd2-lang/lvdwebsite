import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getWaveInvoices } from "@/lib/wave-data";
import { studioToday } from "@/lib/calendar-view";
import WaveInvoices from "@/components/portal/WaveInvoices";
import styles from "../../portal.module.css";
export const dynamic="force-dynamic";
export default async function PortalWaveInvoices() {
 const session=await getPortalSession();if(!session)redirect("/portal/login");
 const result=await getWaveInvoices(session.client.id).then(invoices=>({invoices,error:false})).catch(()=>({invoices:[],error:true}));
 return <div className={styles.content}><header className={styles.sectionHero}><div><p className={styles.eyebrow}>Your investment</p><h1>Invoices &amp; <em>payments.</em></h1></div><p>Read your invoice and pay securely through Wave. Amounts shown are cumulative, not individual payment receipts.</p></header>{result.error?<p role="alert">Invoice status could not be loaded. Please refresh or contact the studio.</p>:<WaveInvoices invoices={result.invoices} eventDate={session.client.event_date} today={studioToday()}/>}</div>;
}
