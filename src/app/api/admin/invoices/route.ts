import { NextResponse } from "next/server";
import { getAdminUser, canManageClientPortal } from "@/lib/admin-auth";
export async function POST() {
 const user = await getAdminUser();
 if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
 if (!canManageClientPortal(user)) return NextResponse.json({ error: "Studio access required." }, { status: 403 });
 return NextResponse.json({ error: "Invoices are issued only in Wave. Connect and match them under Wave invoice sync." }, { status: 409 });
}
