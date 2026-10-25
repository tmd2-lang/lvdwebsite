import { NextResponse } from "next/server";
import { getAdminUser,canManageClientPortal } from "@/lib/admin-auth";
import { waveMapping } from "@/lib/wave-view";
import { syncWave } from "@/lib/wave-data";
import { waveDb } from "@/lib/wave-db";
export const maxDuration=300;
export async function POST(request:Request){
 const user=await getAdminUser();if(!user)return NextResponse.json({error:"Please sign in."},{status:401});if(!canManageClientPortal(user))return NextResponse.json({error:"Studio access required."},{status:403});
 try{const body=await request.json();
 if(body.action==="sync"){if(user.role!=="owner")return NextResponse.json({error:"Only an owner may refresh the Wave connection."},{status:403});return NextResponse.json({ok:true,count:await syncWave()});}
 if(body.action==="unmap"){
 if(typeof body.invoiceId!=="string" || !body.invoiceId || body.invoiceId.length>300 || typeof body.expected!=="string" || !Number.isFinite(Date.parse(body.expected)))throw new Error("Refresh the invoice list first.");
 await waveDb("rpc/wave_unmap_invoice",{p_invoice:body.invoiceId,p_expected:body.expected,p_by:user.email});
 }else if(body.action==="map"){const input=waveMapping(body);if(typeof body.expected!=="string" || !Number.isFinite(Date.parse(body.expected)))throw new Error("Refresh the invoice list before mapping.");
 await waveDb("rpc/wave_map_invoice",{p_invoice:input.invoiceId,p_client:input.clientId,p_track:input.track,p_signed:input.signedOn,p_agreement:input.agreementSigned,p_expected:body.expected,p_by:user.email});
 }else if(body.action==="review"){
 if(typeof body.clientId!=="string" || !/^[0-9a-f-]{36}$/i.test(body.clientId) || typeof body.confirmed!=="boolean")throw new Error("Choose an event and confirm the invoice set.");
 await waveDb("rpc/wave_confirm_event",{p_client:body.clientId,p_confirmed:body.confirmed,p_by:user.email});
 }else throw new Error("Choose a Wave action.");return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Wave could not be updated."},{status:400});}
}
