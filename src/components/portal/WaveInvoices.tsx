import { waveIsBillable,waveSchedule,waveStatus,type WaveInvoice } from "@/lib/wave-view";
import { money } from "@/lib/invoice-types";
import styles from "./couple-planning.module.css";
export default function WaveInvoices({invoices,eventDate,today}:{invoices:WaveInvoice[];eventDate:string|null;today:string}){
 const visible=invoices.filter(waveIsBillable),total=visible.reduce((s,i)=>s+i.total,0),paid=visible.reduce((s,i)=>s+i.paid,0),balance=visible.reduce((s,i)=>s+i.balance,0);
 return <section className={styles.card}><h2>Wave invoices & payments</h2><p>{money(total)} invoiced · {money(paid)} paid · {money(balance)} remaining</p>
 {!visible.length && <p>Your invoices will appear after the studio connects and matches them in Wave.</p>}
 {visible.map(invoice=><article key={invoice.id}><div className={styles.heading}><h3>Invoice #{invoice.number} · {invoice.track==="design"?"Design & Floral":"Planning"}</h3><span className={styles.badge}>{waveStatus(invoice,eventDate,today)}</span></div><p>{money(invoice.total)} total · {money(invoice.balance)} remaining</p><small>Last synced {new Date(invoice.synced_at).toLocaleString("en-US",{timeZone:"America/New_York"})} ET. Payment status comes from Wave.</small>
 <ul>{waveSchedule(invoice,eventDate,today).map(row=><li key={row.name}>{row.name} · {row.due || "Date to be confirmed"} · {money(row.balance)} remaining</li>)}</ul>
 <details><summary>Invoice lines</summary><ul>{invoice.items.map((item,index)=><li key={index}>{item.name} · {money(item.amount)}</li>)}</ul></details>
 {invoice.payment_url?<a href={invoice.payment_url} target="_blank" rel="noreferrer">View invoice & payment options in Wave →</a>:<p>The studio will provide the Wave invoice link.</p>}</article>)}
 </section>;
}
