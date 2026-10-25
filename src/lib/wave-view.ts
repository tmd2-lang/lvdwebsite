import { addPlanningDays, isPlanningDate } from "@/lib/planning-dates";
export type WaveItem = { name: string; description: string; amount: number };
export type WaveInvoice = {
 id: string; number: string; customer_id: string; customer_name: string; customer_email: string;
 status: string; currency: string; total: number; paid: number; balance: number;
 issued_on: string; wave_due_on: string | null; modified_at: string; payment_url: string | null; items: WaveItem[];
 client_id: string | null; track: "planning" | "design" | null; signed_on: string | null; agreement_signed: boolean;
 synced_at: string; missing: boolean;
};
export const WAVE_BUSINESS = "Lady Victoria Designs LLC";
export const WAVE_SCOPES = "business:read customer:read invoice:read product:read";
export const waveIsBillable = (invoice: WaveInvoice) => !invoice.missing && invoice.currency === "USD" && ["SENT","VIEWED","UNPAID","PARTIAL","OVERDUE","PAID","OVERPAID"].includes(invoice.status);
export function cents(value: unknown): number {
 if (typeof value !== "string" || !/^-?\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Unsupported Wave money amount.");
 const negative = value.startsWith("-"), [whole, fraction = ""] = value.replace(/^-/, "").split(".");
 const amount = Number(whole) * 100 + Number(fraction.padEnd(2,"0"));
 if (!Number.isSafeInteger(amount)) throw new Error("Wave amount is too large.");
 return negative ? -amount : amount;
}
export function safeWaveLink(value: unknown) {
 if (typeof value !== "string") return null;
 try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && (url.hostname === "waveapps.com" || url.hostname.endsWith(".waveapps.com")) ? url.href : null; } catch { return null; }
}
export function waveSchedule(invoice: Pick<WaveInvoice,"total"|"paid"|"signed_on">, eventDate: string | null, today: string) {
 const total = invoice.total, paid = Math.max(0,invoice.paid);
 const first = Math.round(total * .4), second = Math.round(total * .3);
 let remainingPaid = paid;
 return [
  { name:"Retainer", amount:first, due:invoice.signed_on },
  { name:"Second installment", amount:second, due:eventDate ? addPlanningDays(eventDate,-90) : null },
  { name:"Final payment", amount:total-first-second, due:eventDate ? addPlanningDays(eventDate,-30) : null },
 ].map((row) => { const applied = Math.min(remainingPaid,row.amount);remainingPaid -= applied;
 const daysLate = row.due && row.due < today && applied < row.amount ? Math.floor((Date.parse(today+"T12:00:00Z")-Date.parse(row.due+"T12:00:00Z"))/86400000) : 0;
 return {...row,paid:applied,balance:row.amount-applied,daysLate,lateFeeFlag:daysLate>=7,pauseFlag:daysLate>=14}; });
}
export function waveStatus(invoice: WaveInvoice,eventDate: string|null,today:string) {
 if (!waveIsBillable(invoice)) return "Not shared";
 if (invoice.balance === 0) return "Paid in full";
 if (waveSchedule(invoice,eventDate,today).some((p)=>p.daysLate>0)) return "Past due";
 return invoice.paid>0 ? "Partially paid" : "Sent / awaiting payment";
}
export function waveMilestones(invoices: WaveInvoice[],eventDate:string|null,today:string,reviewed:boolean) {
 const active=invoices.filter(i=>waveIsBillable(i) && i.total>0);
 return { retainer:reviewed && active.length>0 && active.every(i=>i.paid>=Math.round(i.total*.4)),
 agreement:reviewed && active.length>0 && active.every(i=>i.agreement_signed && i.paid>=Math.round(i.total*.4)),
 second:reviewed && active.length>0 && active.every(i=>i.paid>=Math.round(i.total*.4)+Math.round(i.total*.3)),
 final:reviewed && active.length>0 && active.every(i=>i.balance===0),
 overdue:active.some(i=>waveSchedule(i,eventDate,today).some(p=>p.daysLate>0)) };
}
export function waveMapping(body:Record<string,unknown>) {
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(typeof body.invoiceId!=="string" || !body.invoiceId || body.invoiceId.length>300 || typeof body.clientId!=="string" || !uuid.test(body.clientId) || !["planning","design"].includes(String(body.track))) throw new Error("Choose an invoice, event client record and service track.");
 if(body.signedOn!=="" && (typeof body.signedOn!=="string" || !isPlanningDate(body.signedOn))) throw new Error("Enter the actual agreement signing date, or leave it blank.");
 if(typeof body.agreementSigned!=="boolean") throw new Error("Confirm whether the agreement is signed.");
 return {invoiceId:body.invoiceId,clientId:body.clientId,track:body.track as "planning"|"design",signedOn:body.signedOn || null,agreementSigned:body.agreementSigned};
}
