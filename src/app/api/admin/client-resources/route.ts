import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import { attachStandardDocuments, savePhotographerGallery } from "@/lib/client-resources-data";
import { normalizePhotographerGallery } from "@/lib/client-resources-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)) return NextResponse.json({ error: "Choose a client." }, { status: 400 });
    if (body.action !== "attach_defaults" && body.action !== "save_gallery") return NextResponse.json({ error: "Choose a valid resource action." }, { status: 400 });
    const gallery = body.action === "save_gallery" ? normalizePhotographerGallery(body.url) : null;
    if (!await getClientById(clientId)) return NextResponse.json({ error: "That client could not be found." }, { status: 404 });
    if (body.action === "attach_defaults") await attachStandardDocuments(clientId, user.email);
    else await savePhotographerGallery(clientId, gallery, user.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save client resources." }, { status: 400 });
  }
}
