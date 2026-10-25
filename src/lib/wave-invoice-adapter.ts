import { Buffer } from "node:buffer";
import type { Invoice } from "@/lib/invoice-types";
import { waveIsBillable,waveSchedule,waveStatus,type WaveInvoice } from "@/lib/wave-view";
export function waveInvoiceAdapter(invoice:WaveInvoice,eventDate:string|null,today:string):Invoice {
 const id="wave_"+Buffer.from(invoice.id).toString("base64url"),next=waveSchedule(invoice,eventDate,today).find(p=>p.balance>0);
 return {id,created_at:invoice.issued_on,updated_at:invoice.synced_at,client_id:invoice.client_id!,reference:`Wave #${invoice.number}`,name:invoice.track==="design"?"Design & Floral":"Planning",category:invoice.track,phase:null,issued_on:invoice.issued_on,due_on:next?.due??null,status:waveIsBillable(invoice)?invoice.balance===0?"paid":"sent":"draft",notes:null,payment_url:invoice.payment_url,wave_total:invoice.total,wave_paid:invoice.paid,wave_balance:invoice.balance,wave_next:next?.balance??0,wave_status:waveStatus(invoice,eventDate,today),invoice_items:invoice.items.map((item,index)=>({id:`${id}:${index}`,invoice_id:id,name:item.name,detail:item.description,amount_cents:item.amount,position:index,paid:false,paid_at:null}))};
}
