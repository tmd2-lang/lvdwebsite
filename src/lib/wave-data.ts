import "server-only";
import { waveDb } from "@/lib/wave-db";
import { decryptWave,encryptWave,exchangeWave,readWaveInvoices,type WaveTokens } from "@/lib/wave-api";
import { type WaveInvoice } from "@/lib/wave-view";
export type WaveRow=WaveInvoice & {updated_at:string};
export type WaveConnection={business_id:string;business_name:string;tokens:string;connected_by:string;synced_at:string|null};
export async function waveConnection(){return (await waveDb<WaveConnection[]>("wave_connection?select=business_id,business_name,tokens,connected_by,synced_at&singleton=is.true"))[0]??null;}
export async function getWaveInvoices(clientId?:string):Promise<WaveRow[]>{
 const rows:{id:string;payload:WaveInvoice;client_id:string|null;track:WaveInvoice['track'];signed_on:string|null;agreement_signed:boolean;missing:boolean;synced_at:string;updated_at:string}[]=[];
 for(let offset=0;;offset+=500){const page=await waveDb<typeof rows>(`wave_invoices?select=id,payload,client_id,track,signed_on,agreement_signed,missing,synced_at,updated_at${clientId?`&client_id=eq.${encodeURIComponent(clientId)}`:""}&order=id.asc&limit=500&offset=${offset}`);rows.push(...page);if(page.length<500)break;}
 return rows.map(r=>({...r.payload,id:r.id,client_id:r.client_id,track:r.track,signed_on:r.signed_on,agreement_signed:r.agreement_signed,missing:r.missing,synced_at:r.synced_at,updated_at:r.updated_at}));
}
export async function syncWave(){
 const lock=await waveDb<string>("rpc/wave_acquire_lock",{});
 try{
  const connection=await waveConnection();if(!connection)throw new Error("Connect Wave first.");
  let tokens=decryptWave<WaveTokens>(connection.tokens);
  if(tokens.expires_at<Date.now()+120000){tokens=await exchangeWave({grant_type:"refresh_token",refresh_token:tokens.refresh_token},tokens.refresh_token,tokens.redirect_uri);await waveDb("wave_connection?on_conflict=singleton",{...connection,singleton:true,tokens:encryptWave(tokens)},"resolution=merge-duplicates");}
  const invoices=await readWaveInvoices(tokens.access_token,connection.business_id);
  await waveDb("rpc/wave_apply_snapshot",{p_lock:lock,p_business:connection.business_id,p_invoices:invoices});return invoices.length;
 }finally{await waveDb("rpc/wave_release_lock",{p_token:lock});}
}
export async function waveReviews(){return waveDb<{client_id:string;confirmed:boolean}[]>("wave_client_review?select=client_id,confirmed");}
