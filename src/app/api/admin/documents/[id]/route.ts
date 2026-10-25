import { NextResponse } from "next/server";
import { canManageClientPortal, getAdminUser } from "@/lib/admin-auth";
import { getDocument, signedDocumentUrl } from "@/lib/document-data";
import { isStandardDocumentKey } from "@/lib/client-resources-view";
import { standardDocumentResponse } from "@/lib/standard-document-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Opens a private client document for a signed-in studio administrator.
 * Storage stays private; the browser only receives a short-lived signed URL.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!canManageClientPortal(user)) return NextResponse.json({ error: "Your account does not have client-portal access." }, { status: 403 });

  const { id } = await context.params;
  const document = await getDocument(id);
  if (!document) {
    return NextResponse.json({ error: "That document could not be found." }, { status: 404 });
  }

  if (isStandardDocumentKey(document.standard_key)) return standardDocumentResponse(document.standard_key, request.url);
  if (!document.storage_path) return NextResponse.json({ error: "That file is unavailable." }, { status: 404 });
  const url = await signedDocumentUrl(document.storage_path);
  if (!url) {
    return NextResponse.json({ error: "That file could not be opened right now." }, { status: 502 });
  }

  return NextResponse.redirect(url);
}
