/**
 * The parts of the image library that are safe in the browser.
 *
 * `image-data.ts` talks to storage with the service-role key and must stay on
 * the server. Client components import from here instead, so none of that
 * comes along for the ride.
 */

export const IMAGE_ALBUMS = ["Inspiration", "Design", "Gallery"] as const;
export type ImageAlbum = (typeof IMAGE_ALBUMS)[number];

/** What the browser is allowed to send us. Anything else is refused. */
export const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export type ClientImage = {
  id: string;
  created_at: string;
  client_id: string;
  name: string;
  album: ImageAlbum;
  note: string | null;
  storage_path: string;
  content_type: string | null;
  size_bytes: number;
  width: number | null;
  height: number | null;
  visible_to_client: boolean;
  /** Null means live. Set means removed but recoverable. */
  deleted_at: string | null;
  uploaded_by: string | null;
};

/** A row plus a short-lived address the browser can actually load. */
export type ViewableImage = ClientImage & { url: string | null };

export function isSupportedImage(contentType: string | undefined | null) {
  return !!contentType && (IMAGE_CONTENT_TYPES as readonly string[]).includes(contentType);
}

export function readableImageSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
