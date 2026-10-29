import "server-only";
import { createCipheriv,createDecipheriv,randomBytes } from "node:crypto";
import { cents,safeWaveLink,WAVE_BUSINESS,WAVE_SCOPES,type WaveInvoice } from "@/lib/wave-view";
export function waveConfig() {
 const clientId=process.env.WAVE_CLIENT_ID,secret=process.env.WAVE_CLIENT_SECRET,redirect=process.env.WAVE_REDIRECT_URI,encryption=process.env.WAVE_TOKEN_ENCRYPTION_KEY;
 if(!clientId || !secret || !redirect || !encryption)throw new Error("Wave needs its app credentials, callback URL and token encryption key in server settings.");
 const key=Buffer.from(encryption,"base64"); if(key.length!==32)throw new Error("Wave token encryption key must contain 32 random bytes in base64.");
 const callback=new URL(redirect);if(callback.pathname!=="/api/admin/wave/callback" || (callback.protocol!=="https:" && !(callback.protocol==="http:" && callback.hostname==="localhost")))throw new Error("Configure a valid Wave callback URL.");
 return {clientId,secret,redirect,key};
}
export function encryptWave(value:unknown) {const {key}=waveConfig(),iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);return [iv.toString("base64"),cipher.update(JSON.stringify(value),"utf8","base64")+cipher.final("base64"),cipher.getAuthTag().toString("base64")].join(".");}
export function decryptWave<T>(value:string):T {const {key}=waveConfig(),[iv,body,tag]=value.split("."),cipher=createDecipheriv("aes-256-gcm",key,Buffer.from(iv,"base64"));cipher.setAuthTag(Buffer.from(tag,"base64"));return JSON.parse(cipher.update(body,"base64","utf8")+cipher.final("utf8"));}
export type WaveTokens={access_token:string;refresh_token:string;expires_at:number;redirect_uri:string};
export async function exchangeWave(values:Record<string,string>,oldRefresh?:string,originalRedirect?:string):Promise<WaveTokens> {
 const c=waveConfig();const response=await fetch("https://api.waveapps.com/oauth2/token/",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({...values,client_id:c.clientId,client_secret:c.secret,redirect_uri:originalRedirect || c.redirect})});
 const data=await response.json().catch(()=>null);
 if(!response.ok || !data?.access_token || !(data.refresh_token || oldRefresh) || !Number.isFinite(data.expires_in))throw new Error(`Wave authorization failed (HTTP ${response.status}${data?.error?`, ${String(data.error).slice(0,60)}`:""}). Check the business subscription and reconnect.`);
 if(!oldRefresh && typeof data.scope!=="string")throw new Error("Wave did not confirm the granted permissions.");
 if(data.scope && String(data.scope).split(/\s+/).some((s:string)=>!WAVE_SCOPES.split(" ").includes(s)))throw new Error(`Wave must authorize read-only invoice access (granted: ${String(data.scope).slice(0,200)}).`);
 return {access_token:data.access_token,refresh_token:data.refresh_token || oldRefresh,expires_at:Date.now()+data.expires_in*1000,redirect_uri:originalRedirect || c.redirect};
}
export async function waveQuery<T>(token:string,query:string,variables:Record<string,unknown>):Promise<T> {
 if(!query.trim().startsWith("query") || /\bmutation\b/.test(query))throw new Error("Wave writes are disabled.");
 const response=await fetch("https://gql.waveapps.com/graphql/public",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(25000)});
 const result=await response.json().catch(()=>null);if(!response.ok || result?.errors?.length || !result?.data)throw new Error("Wave could not be read. No partial sync was saved.");return result.data as T;
}
export async function verifiedBusiness(token:string) {
 const found:{id:string;name:string}[]=[];
 for(let page=1;page<=100;page++){const data=await waveQuery<{businesses:{pageInfo:{totalPages:number};edges:{node:{id:string;name:string}}[]}}>(token,"query($page:Int!){ businesses(page:$page,pageSize:50){pageInfo{totalPages} edges{node{id name}}}}",{page});
 found.push(...data.businesses.edges.map(e=>e.node).filter(b=>b.name===WAVE_BUSINESS));if(page>=data.businesses.pageInfo.totalPages)break;if(page===100)throw new Error("Too many Wave businesses to verify.");}
 if(found.length!==1)throw new Error(`Authorize exactly one ${WAVE_BUSINESS} business.`);return found[0];
}
const INVOICES=`query($business:ID!,$page:Int!){ business(id:$business){ id name invoices(page:$page,pageSize:100){pageInfo{totalPages totalCount} edges{node{id invoiceNumber invoiceDate dueDate modifiedAt status viewUrl customer{id name email} currency{code} total{value} amountPaid{value} amountDue{value} items{description product{name} total{value}}}}}}}`;
type RawInvoice={id:string;invoiceNumber:string;invoiceDate:string;dueDate:string|null;modifiedAt:string;status:string;viewUrl:string|null;customer:{id:string;name:string;email:string|null};currency:{code:string};total:{value:string};amountPaid:{value:string};amountDue:{value:string};items:{description:string|null;product:{name:string}|null;total:{value:string}}[]};
export function normalizeWave(raw:RawInvoice):WaveInvoice {
 const total=cents(raw.total.value),paid=cents(raw.amountPaid.value),balance=cents(raw.amountDue.value);
 if(total<0 || paid<0 || balance<0 || !Number.isFinite(Date.parse(raw.modifiedAt)) || !raw.id || !raw.customer?.id)throw new Error("Wave invoice needs manual review before importing.");
 const items=raw.items.map(i=>({name:i.product?.name || i.description || "Invoice line",description:i.description || "",amount:cents(i.total.value)}));
 if(!items.length)items.push({name:"Wave invoice",description:"",amount:total});
 const remainder=total-items.reduce((s,i)=>s+i.amount,0);if(remainder)items.push({name:"Wave invoice adjustment",description:"Tax, discount or invoice-level adjustment",amount:remainder});
 return {id:raw.id,number:raw.invoiceNumber,customer_id:raw.customer.id,customer_name:raw.customer.name,customer_email:raw.customer.email || "",status:raw.status,currency:raw.currency.code,total,paid,balance,issued_on:raw.invoiceDate,wave_due_on:raw.dueDate,modified_at:raw.modifiedAt,payment_url:safeWaveLink(raw.viewUrl),items,client_id:null,track:null,signed_on:null,agreement_signed:false,synced_at:new Date().toISOString(),missing:false};
}
export async function readWaveInvoices(token:string,businessId:string) {
 const invoices:WaveInvoice[]=[];let expectedCount:number|null=null;const seen=new Set<string>();
 for(let page=1;page<=1000;page++){const data=await waveQuery<{business:{id:string;name:string;invoices:{pageInfo:{totalPages:number;totalCount:number};edges:{node:RawInvoice}[]}}}>(token,INVOICES,{business:businessId,page});
 if(data.business?.id!==businessId || data.business.name!==WAVE_BUSINESS)throw new Error("Wave business changed. Reconnect before syncing.");
 const count=data.business.invoices.pageInfo.totalCount;
 if(!Number.isSafeInteger(count) || (expectedCount!==null && expectedCount!==count))throw new Error("Wave invoices changed during pagination. Refresh again; nothing was imported.");
 expectedCount=count;
 const batch=data.business.invoices.edges.map(e=>normalizeWave(e.node));
 for(const invoice of batch){if(seen.has(invoice.id))throw new Error("Wave pagination repeated an invoice. Refresh again; nothing was imported.");seen.add(invoice.id);}
 invoices.push(...batch);if(page>=data.business.invoices.pageInfo.totalPages){if(invoices.length!==count)throw new Error("Wave did not return the complete invoice set.");return invoices;}}
 throw new Error("Invoice pagination did not finish. Nothing was imported.");
}
