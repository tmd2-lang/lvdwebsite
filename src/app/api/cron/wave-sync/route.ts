import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { syncWave, waveConnection } from "@/lib/wave-data";
export const maxDuration=300;
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,authorization=request.headers.get("authorization"),expected=`Bearer ${secret}`;
 if(!secret || !authorization || Buffer.byteLength(authorization)!==Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(authorization),Buffer.from(expected)))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{if(!await waveConnection())return NextResponse.json({ok:true,skipped:"Wave not connected"});return NextResponse.json({ok:true,count:await syncWave()});}catch{return NextResponse.json({error:"Wave sync failed; previously synced data is retained."},{status:503});}
}
