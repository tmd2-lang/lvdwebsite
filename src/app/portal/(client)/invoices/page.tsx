import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { getWaveInvoices } from "@/lib/wave-data";
import { getBudget } from "@/lib/budget-data";
import { studioToday } from "@/lib/calendar-view";
import WaveInvoices from "@/components/portal/WaveInvoices";
import CoupleMoney from "@/components/portal/CoupleMoney";
import styles from "../../portal.module.css";
export const dynamic="force-dynamic";
export default async function PortalWaveInvoices() {
 const session=await getPortalSession();if(!session)redirect("/portal/login");
 const [result,budget]=await Promise.all([
  getWaveInvoices(session.client.id).then(invoices=>({invoices,error:false})).catch(()=>({invoices:[],error:true})),
  getBudget(session.client.id).catch(()=>null),
 ]);
 return <div className={styles.content}><header className={styles.sectionHero}><div><p className={styles.eyebrow}>Your investment</p><h1>Budget &amp; <em>payments.</em></h1></div><p>Your payment schedule, your wedding budget, and your invoices in one place. Pay securely through Wave.</p></header>{budget?<CoupleMoney budget={budget}/>:<p role="alert">Your budget could not be loaded. Please refresh or contact the studio.</p>}{result.error?<p role="alert">Invoice status could not be loaded. Please refresh or contact the studio.</p>:<WaveInvoices invoices={result.invoices} eventDate={session.client.event_date} today={studioToday()}/>}</div>;
}
