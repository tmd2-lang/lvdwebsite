import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { getAdminUser } from "@/lib/admin-auth";
import { encryptWave,exchangeWave,verifiedBusiness,waveConfig } from "@/lib/wave-api";
import { waveDb } from "@/lib/wave-db";
export async function GET(request:Request){
 const user=await getAdminUser();if(!user || user.role!=="owner")return NextResponse.json({error:"Studio owner sign-in required."},{status:403});
 const config=waveConfig(),response=NextResponse.redirect(new URL("/admin/portal/wave",config.redirect));
 const stored=(await cookies()).get("lvd_wave_state")?.value,url=new URL(request.url),state=url.searchParams.get("state"),code=url.searchParams.get("code");
 response.cookies.set("lvd_wave_state","",{path:"/api/admin/wave",maxAge:0,httpOnly:true,secure:new URL(config.redirect).protocol==="https:",sameSite:"lax"});
 const expected=`${user.id}:${state}`;
 if(!stored || !state || !code || code.length>4096 || Buffer.byteLength(stored)!==Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(stored),Buffer.from(expected))){console.error("Wave connect failed: sign-in state did not match.");response.headers.set("Location",new URL("/admin/portal/wave?notice=authorization",config.redirect).href);return response;}
 let lock:string|null=null;
 try{lock=await waveDb<string>("rpc/wave_acquire_lock",{});const tokens=await exchangeWave({grant_type:"authorization_code",code}),business=await verifiedBusiness(tokens.access_token);
 const existing=await waveDb<{business_id:string}[]>("wave_connection?select=business_id&singleton=is.true");
 if(existing[0] && existing[0].business_id!==business.id)throw new Error("Wave business ID changed.");
 await waveDb("wave_connection?on_conflict=singleton",{singleton:true,business_id:business.id,business_name:business.name,tokens:encryptWave(tokens),connected_by:user.email},"resolution=merge-duplicates");
 }catch(error){console.error("Wave connect failed:",error instanceof Error?error.message:"unknown error");response.headers.set("Location",new URL("/admin/portal/wave?notice=authorization",config.redirect).href);}finally{if(lock)await waveDb("rpc/wave_release_lock",{p_token:lock});}
 return response;
}
