import "server-only";
export async function waveDb<T>(path:string,body?:unknown,prefer?:string):Promise<T> {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url || !key)throw new Error("Wave storage is not configured.");
 const response=await fetch(`${url}/rest/v1/${path}`,{cache:"no-store",headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...(prefer?{Prefer:prefer}:{})},...(body===undefined?{}:{method:"POST",body:JSON.stringify(body)})});
 const data=await response.json().catch(()=>null);
 if(!response.ok){if(["PGRST205","PGRST202","42P01"].includes(data?.code))throw new Error("Run supabase/wave-schema.sql to set up Wave sync.");if (/^(Resolve existing manual|Invoice changed|Wave sync is already|Wave business mismatch|Client not found|Invoice not found|Map the remaining|Wave controls)/.test(data?.message || "")) throw new Error(data.message);throw new Error("Wave storage could not be updated. Refresh and try again.");}
 return data as T;
}
