import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import {
  DOCUMENT_CATEGORIES,
  purgeDocument,
  restoreDocument,
  softDeleteDocument,
  uploadDocument,
  type DocumentCategory,
} from "@/lib/document-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const clientId = String(form.get("clientId") || "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "That file is larger than 25 MB." }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    const category = String(form.get("category") || "Planning") as DocumentCategory;
    if (!DOCUMENT_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Choose a category." }, { status: 400 });
    }

    const document = await uploadDocument({
      clientId: client.id,
      file,
      name: String(form.get("name") || "").trim() || file.name,
      category,
      note: String(form.get("note") || ""),
      uploadedBy: user.email,
    });

    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Which document?" }, { status: 400 });

    // ?purge=true destroys the file and the row for good. Everything else is a
    // soft delete: hidden, but the file stays and it can be restored.
    if (searchParams.get("purge") === "true") {
      await purgeDocument(id);
      return NextResponse.json({ ok: true, purged: true });
    }

    await softDeleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove that document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as { id?: unknown; restore?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Which document?" }, { status: 400 });
    if (body.restore !== true) {
      return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    }

    await restoreDocument(id);
    return NextResponse.json({ ok: true, restored: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not restore that document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
