import { NextResponse } from "next/server";
import { getDocumentForClient, signedDocumentUrl } from "@/lib/document-data";
import { getPortalSession } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hands a client their own file.
 *
 * The file is looked up against their celebration, so asking for a document
 * belonging to someone else finds nothing. Only then is a short-lived link
 * requested from storage and the browser sent to it.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getPortalSession();
  if (!session) return NextResponse.redirect(new URL("/portal/login", request.url));

  const { id } = await context.params;
  const document = await getDocumentForClient(id, session.client.id);
  if (!document) return NextResponse.json({ error: "That document could not be found." }, { status: 404 });

  const url = await signedDocumentUrl(document.storage_path);
  if (!url) return NextResponse.json({ error: "That file could not be opened right now." }, { status: 502 });

  return NextResponse.redirect(url);
}
