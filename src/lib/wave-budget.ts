import type { BudgetLine,BudgetPayment } from "@/lib/budget-view";
import { waveIsBillable,waveSchedule,type WaveInvoice } from "@/lib/wave-view";
/** Exact proportional cents, with the remaining pennies in stable item order. */
export function allocateWave(amount:number,weights:number[]) {
 const total=weights.reduce((s,w)=>s+w,0);if(!total)return weights.map(()=>0);
 const rows=weights.map(w=>Number(BigInt(amount)*BigInt(w)/BigInt(total)));let remainder=amount-rows.reduce((s,w)=>s+w,0);
 for(let index=0;remainder>0;index=(index+1)%weights.length)if(weights[index]>0){rows[index]++;remainder--;}
 return rows;
}
export function waveBudget(invoices:WaveInvoice[],eventDate:string|null,today:string) {
 const lines:BudgetLine[]=[],payments:BudgetPayment[]=[];
 for(const invoice of invoices.filter(waveIsBillable)){
  if(!invoice.client_id || !invoice.track)continue;
  const weights=invoice.items.map(i=>Math.max(0,i.amount)),schedule=waveSchedule(invoice,eventDate,today),amounts=schedule.map(p=>allocateWave(p.amount,weights)),paid=schedule.map((p,step)=>allocateWave(p.paid,amounts[step]));
  invoice.items.forEach((item,index)=>{const id=`wave:${invoice.id}:${index}`;
   lines.push({id,wave_url:invoice.payment_url,client_id:invoice.client_id!,category:invoice.track==="planning"?"Planning & Management":"Floral & Decor",side:invoice.track==="planning"?"lvd_planning":"lvd_design",vendor:`Wave #${invoice.number} · ${item.name}`,description:item.description,status:invoice.balance===0?"paid":invoice.paid>0?"partially_paid":"contracted",estimated_cents:Math.max(0,item.amount),contracted_cents:Math.max(0,item.amount),changes_cents:Math.min(0,item.amount),notes:null,position:index,created_at:invoice.issued_on});
   schedule.forEach((row,step)=>{if(!amounts[step][index])return;payments.push({id:`${id}:${step}`,client_id:invoice.client_id!,line_id:id,payment_type:(["retainer","installment","final_balance"] as const)[step],payer:"client",due_on:row.due,amount_cents:amounts[step][index],paid_cents:paid[step][index],paid_on:null,manual_status:null,notes:"Read-only Wave sync; installment allocation, not a payment receipt.",created_at:invoice.synced_at});});
  });
  if(invoice.paid>invoice.total && lines.length){const line=lines[lines.length-invoice.items.length];payments.push({id:`wave:${invoice.id}:credit`,client_id:invoice.client_id!,line_id:line.id,payment_type:"other",payer:"client",due_on:null,amount_cents:0,paid_cents:invoice.paid-invoice.total,paid_on:null,manual_status:null,notes:"Overpayment credit reported by Wave",created_at:invoice.synced_at});}
 }
 return {lines,payments};
}
