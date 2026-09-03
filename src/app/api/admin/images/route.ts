import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getClientById } from "@/lib/client-data";
import {
  IMAGE_ALBUMS,
  MAX_IMAGE_BYTES,
  purgeImage,
  restoreImage,
  softDeleteImage,
  isSupportedImage,
  setImageVisibility,
  uploadImage,
  type ImageAlbum,
} from "@/lib/image-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owners and planners both work client portals. Tanah uploads the boards,
// so this deliberately does not check for owner.
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const clientId = String(form.get("clientId") || "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    if (!isSupportedImage(file.type)) {
      return NextResponse.json(
        { error: `${file.name} is not an image we can display. Use JPG, PNG, WEBP, GIF, AVIF, or HEIC.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: `${file.name} is larger than 15 MB.` }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) return NextResponse.json({ error: "That celebration no longer exists." }, { status: 404 });

    const album = String(form.get("album") || "Inspiration") as ImageAlbum;
    if (!IMAGE_ALBUMS.includes(album)) {
      return NextResponse.json({ error: "Choose an album." }, { status: 400 });
    }

    // The browser measures the picture before sending it; storage cannot.
    const width = Number(form.get("width")) || null;
    const height = Number(form.get("height")) || null;

    const image = await uploadImage({
      clientId: client.id,
      file,
      name: String(form.get("name") || "").trim() || file.name,
      album,
      note: String(form.get("note") || ""),
      width,
      height,
      uploadedBy: user.email,
    });

    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const body = (await request.json()) as { id?: unknown; visibleToClient?: unknown; restore?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Which image?" }, { status: 400 });

    // Undo after a removal.
    if (body.restore === true) {
      await restoreImage(id);
      return NextResponse.json({ ok: true, restored: true });
    }

    if (typeof body.visibleToClient !== "boolean") {
      return NextResponse.json({ error: "Say whether the couple should see it." }, { status: 400 });
    }

    await setImageVisibility(id, body.visibleToClient);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update that image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Your sign-in has expired." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Which image?" }, { status: 400 });

    // ?purge=true destroys the file and the row for good. Everything else is a
    // soft delete: hidden, but the file stays and it can be restored.
    if (searchParams.get("purge") === "true") {
      await purgeImage(id);
      return NextResponse.json({ ok: true, purged: true });
    }

    await softDeleteImage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove that image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
