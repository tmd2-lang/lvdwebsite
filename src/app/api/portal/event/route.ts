import { NextResponse } from "next/server";
import { getPortalUser,getPortalMemberships,portalCookieOptions } from "@/lib/portal-auth";
export async function POST(request:Request){
 const user=await getPortalUser();if(!user)return NextResponse.json({error:"Please sign in."},{status:401});
 const form=await request.formData(),clientId=form.get("clientId");
 const memberships=await getPortalMemberships(user.id);
 if(typeof clientId!=="string" || !memberships.some(row=>row.client.id===clientId))return NextResponse.json({error:"That event is not assigned to your sign-in."},{status:403});
 // Relative internal redirect: never take a return URL from the form.
 const response=new NextResponse(null,{status:303,headers:{Location:"/portal"}});
 response.cookies.set("lvd_portal_event",clientId,portalCookieOptions(30*86400));return response;
}
