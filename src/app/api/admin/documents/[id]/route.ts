import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getDocument, signedDocumentUrl } from "@/lib/document-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Opens a private client document for a signed-in studio administrator.
 * Storage stays private; the browser only receives a short-lived signed URL.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));

  const { id } = await context.params;
  const document = await getDocument(id);
  if (!document) {
    return NextResponse.json({ error: "That document could not be found." }, { status: 404 });
  }

  const url = await signedDocumentUrl(document.storage_path);
  if (!url) {
    return NextResponse.json({ error: "That file could not be opened right now." }, { status: 502 });
  }

  return NextResponse.redirect(url);
}
