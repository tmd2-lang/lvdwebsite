import {
  IMAGE_ALBUMS,
  MAX_IMAGE_BYTES,
  isSupportedImage,
  type ClientImage,
  type ImageAlbum,
  type ViewableImage,
} from "@/lib/image-view";

// Re-exported so server code has one place to import from.
export { IMAGE_ALBUMS, MAX_IMAGE_BYTES, isSupportedImage };
export type { ClientImage, ImageAlbum, ViewableImage };

export const IMAGE_BUCKET = "client-images";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Image storage is not configured.");
  return { url, serviceRoleKey };
}

function databaseHeaders(prefer?: string) {
  const { serviceRoleKey } = databaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function responseJson<T>(response: Response, failure: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    // PGRST205 means the table is not there at all, which on a fresh install
    // just means the schema file has not been run yet. Say so plainly instead
    // of logging an empty object nobody can act on.
    const code = (payload as { code?: string } | null)?.code;
    if (code === "PGRST205") {
      throw new Error(
        "Client images are not set up yet. Run supabase/images-schema.sql in the Supabase SQL editor, and create a private storage bucket named client-images.",
      );
    }
    const detail = (payload as { message?: string } | null)?.message;
    console.error("Image request failed:", detail || JSON.stringify(payload) || response.status);
    throw new Error(detail ? `${failure} (${detail})` : failure);
  }
  return payload as T;
}

/** Every client image in the studio library, newest first. */
export async function getImages(): Promise<ClientImage[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_images?select=*&deleted_at=is.null&order=created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientImage[]>(response, "Could not load images.");
}

export async function getImagesForClient(clientId: string): Promise<ClientImage[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_images?select=*&client_id=eq.${encodeURIComponent(clientId)}&deleted_at=is.null&order=created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientImage[]>(response, "Could not load images.");
}

/** Only what the couple is allowed to see. */
export async function getVisibleImagesForClient(clientId: string): Promise<ClientImage[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_images?select=*&client_id=eq.${encodeURIComponent(clientId)}&visible_to_client=is.true&deleted_at=is.null&order=created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientImage[]>(response, "Could not load images.");
}

export async function uploadImage(input: {
  clientId: string;
  file: File;
  name: string;
  album: ImageAlbum;
  note?: string;
  width?: number | null;
  height?: number | null;
  uploadedBy?: string;
}): Promise<ClientImage> {
  const { url, serviceRoleKey } = databaseConfig();

  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const storagePath = `${input.clientId}/${Date.now()}-${safeName}`;

  const upload = await fetch(`${url}/storage/v1/object/${IMAGE_BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": input.file.type || "application/octet-stream",
    },
    body: await input.file.arrayBuffer(),
    cache: "no-store",
  });

  if (!upload.ok) {
    console.error("Image upload failed:", await upload.text().catch(() => ""));
    throw new Error("That image could not be uploaded. Please try again.");
  }

  const record = await fetch(`${url}/rest/v1/client_images`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({
      client_id: input.clientId,
      name: input.name.trim() || input.file.name,
      album: input.album,
      note: input.note?.trim() || null,
      storage_path: storagePath,
      content_type: input.file.type || null,
      size_bytes: input.file.size,
      width: input.width ?? null,
      height: input.height ?? null,
      uploaded_by: input.uploadedBy || null,
    }),
    cache: "no-store",
  });

  const rows = await responseJson<ClientImage[]>(record, "The image uploaded but could not be saved.");
  if (!rows[0]) throw new Error("The image uploaded but could not be saved.");
  return rows[0];
}

/**
 * A one-off address for an image, valid for a while.
 *
 * Images are never publicly reachable. Every view goes through the site,
 * which checks who is asking before asking storage for a short-lived link.
 * These last longer than document links because a gallery loads many at once
 * and the couple may sit on the page for a few minutes.
 */
export async function signedImageUrl(storagePath: string, seconds = 3600): Promise<string | null> {
  const { url, serviceRoleKey } = databaseConfig();
  const response = await fetch(`${url}/storage/v1/object/sign/${IMAGE_BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: seconds }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Signing an image link failed:", await response.text().catch(() => ""));
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { signedURL?: string } | null;
  return payload?.signedURL ? `${url}/storage/v1${payload.signedURL}` : null;
}

/** Signs a whole grid at once so the page does not wait on one link at a time. */
export async function withSignedUrls(images: ClientImage[], seconds = 3600): Promise<ViewableImage[]> {
  const urls = await Promise.all(images.map((image) => signedImageUrl(image.storage_path, seconds)));
  return images.map((image, index) => ({ ...image, url: urls[index] }));
}

export async function setImageVisibility(imageId: string, visible: boolean): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_images?id=eq.${encodeURIComponent(imageId)}`, {
    method: "PATCH",
    headers: databaseHeaders(),
    body: JSON.stringify({ visible_to_client: visible }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not change who can see that image.");
}

/** Removes an image from every view. The file stays in storage. */
export async function softDeleteImage(imageId: string): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_images?id=eq.${encodeURIComponent(imageId)}`, {
    method: "PATCH",
    headers: databaseHeaders(),
    body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not remove that image.");
}

/** Puts a removed image back. */
export async function restoreImage(imageId: string): Promise<void> {
  const { url } = databaseConfig();
  const response = await fetch(`${url}/rest/v1/client_images?id=eq.${encodeURIComponent(imageId)}`, {
    method: "PATCH",
    headers: databaseHeaders(),
    body: JSON.stringify({ deleted_at: null }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not restore that image.");
}

/** Removed images for one celebration, so they can be restored. */
export async function getDeletedImagesForClient(clientId: string): Promise<ClientImage[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/client_images?select=*&client_id=eq.${encodeURIComponent(clientId)}&deleted_at=not.is.null&order=deleted_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientImage[]>(response, "Could not load removed images.");
}

/**
 * Destroys an image for good: the file and the row. Nothing calls this from the
 * interface yet, on purpose. It is here for a future "empty the trash" action.
 */
export async function purgeImage(imageId: string): Promise<void> {
  const { url, serviceRoleKey } = databaseConfig();

  const lookup = await fetch(
    `${url}/rest/v1/client_images?select=storage_path&id=eq.${encodeURIComponent(imageId)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<{ storage_path: string }[]>(lookup, "Could not find that image.");
  const path = rows[0]?.storage_path;

  if (path) {
    const storageRemoved = await fetch(`${url}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
      method: "DELETE",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      cache: "no-store",
    });
    if (!storageRemoved.ok && storageRemoved.status !== 404) {
      throw new Error("Could not remove that image from private storage.");
    }
  }

  const removed = await fetch(`${url}/rest/v1/client_images?id=eq.${encodeURIComponent(imageId)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!removed.ok) throw new Error("Could not remove that image.");
}
