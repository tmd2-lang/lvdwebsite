import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getAdminUser } from "@/lib/admin-auth";
import { waveConfig } from "@/lib/wave-api";
import { WAVE_SCOPES } from "@/lib/wave-view";
export async function POST(){
 const user=await getAdminUser();if(!user)return NextResponse.json({error:"Please sign in."},{status:401});if(user.role!=="owner")return NextResponse.json({error:"Only a studio owner can connect Wave."},{status:403});
 try {const c=waveConfig(),state=randomBytes(32).toString("hex"),url=new URL("https://api.waveapps.com/oauth2/authorize/");
 url.search=new URLSearchParams({client_id:c.clientId,response_type:"code",scope:WAVE_SCOPES,redirect_uri:c.redirect,state,approval_prompt:"force"}).toString();
 const response=NextResponse.redirect(url,303);response.cookies.set("lvd_wave_state",`${user.id}:${state}`,{httpOnly:true,secure:new URL(c.redirect).protocol==="https:",sameSite:"lax",path:"/api/admin/wave",maxAge:600});return response;
 }catch{return NextResponse.redirect(new URL("/admin/portal/wave?notice=setup",process.env.WAVE_REDIRECT_URI || "http://localhost:3000"),303);}
}
