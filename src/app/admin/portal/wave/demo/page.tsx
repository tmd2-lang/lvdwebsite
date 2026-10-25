import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser,canManageClientPortal } from "@/lib/admin-auth";
import WavePanel from "../WavePanel";
import WaveInvoices from "@/components/portal/WaveInvoices";
import type { WaveInvoice } from "@/lib/wave-view";
import styles from "../../portal-admin.module.css";
export default async function WaveDemo(){
 const user=await getAdminUser();if(!user)redirect("/admin/login");if(!canManageClientPortal(user))redirect("/admin/portal/inquiries");
 const clientId="11111111-1111-4111-8111-111111111111",today="2026-10-25";
 const invoice:WaveInvoice & {updated_at:string}={id:"TEST-preview",number:"TEST 001",customer_id:"TEST-customer",customer_name:"TEST Couple",customer_email:"test@example.test",status:"PARTIAL",currency:"USD",total:1200000,paid:480000,balance:720000,issued_on:"2026-06-01",wave_due_on:"2026-11-20",modified_at:"2026-10-25T12:00:00Z",payment_url:null,items:[{name:"TEST design",description:"Sample only",amount:1000000},{name:"TEST labor",description:"Sample only",amount:200000}],client_id:clientId,track:"design",signed_on:"2026-06-01",agreement_signed:true,synced_at:"2026-10-25T12:00:00Z",missing:false,updated_at:"2026-10-25T12:00:00Z"};
 return <main className={styles.workspacePage}><header className={styles.libraryHeader}><div><h1>Wave preview · TEST data only</h1><p>This preview uses invented sample data. Buttons do not connect to Wave or save changes.</p></div><Link href="/admin/portal/wave">Back to Wave setup</Link></header><WaveInvoices invoices={[invoice]} eventDate="2026-11-20" today={today}/><WavePanel invoices={[invoice]} clients={[{id:clientId,display_name:"TEST Couple",email:"test@example.test",event_date:"2026-11-20"}]} reviews={[{client_id:clientId,confirmed:true}]} today={today} owner connected ready demo/></main>;
}
