import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { StandardDocumentKey } from "@/lib/client-resources-view";

/** Called only after the existing document route authenticates and scopes its row. */
export async function standardDocumentResponse(key: StandardDocumentKey, requestUrl: string) {
  if (key === "planning_guide") return NextResponse.redirect(new URL("/planning-guide", requestUrl));
  try {
    const bytes = await readFile(path.join(process.cwd(), "src/assets/client-documents/welcome-packet.pdf"));
    return new NextResponse(new Uint8Array(bytes), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="LVD-Client-Welcome-Packet.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    } });
  } catch {
    return NextResponse.json({ error: "The welcome packet could not be opened right now." }, { status: 503 });
  }
}
