import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser,canManageClientPortal } from "@/lib/admin-auth";
import { getClients } from "@/lib/client-data";
import { waveConnection,getWaveInvoices,waveReviews } from "@/lib/wave-data";
import { waveConfig } from "@/lib/wave-api";
import { studioToday } from "@/lib/calendar-view";
import WavePanel from "./WavePanel";
import styles from "../portal-admin.module.css";
export const dynamic="force-dynamic";
export default async function WavePage({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const user=await getAdminUser();if(!user)redirect("/admin/login");if(!canManageClientPortal(user))redirect("/admin/portal/inquiries");
 let ready=true;try{waveConfig();}catch{ready=false;}
 const clients=await getClients();
 const result=await Promise.all([waveConnection(),getWaveInvoices(),waveReviews()]).then(([connection,invoices,reviews])=>({connection,invoices,reviews,error:""})).catch(error=>({connection:null,invoices:[],reviews:[],error:error instanceof Error?error.message:"Wave is unavailable."}));
 const notice=(await searchParams).notice;
 return <main className={styles.workspacePage}><header className={styles.libraryHeader}><div><p className={styles.eyebrow}>Financial administration</p><h1>Wave invoice sync</h1><p>Match the right invoices to each event. Money status comes from Wave.</p></div><div><Link href="/admin/portal/clients">Back to clients</Link><br/><Link href="/admin/portal/wave/demo">Preview with TEST data</Link></div></header>
 {notice && <p role="alert">{notice==="setup"?"Complete the Wave app setup before connecting.":"Wave could not be authorized. Check subscription, read-only permissions and business selection, then reconnect."}</p>}
 {result.error && <p role="alert">{result.error}</p>}
 <WavePanel invoices={result.invoices} clients={clients.map(c=>({id:c.id,display_name:c.display_name,event_date:c.event_date,email:c.email}))} reviews={result.reviews} today={studioToday()} owner={user.role==="owner"} connected={Boolean(result.connection)} ready={ready&&!result.error}/></main>;
}
