import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import { MEDIA_SLOTS } from "@/lib/media-slots";
import type { GalleryCollection, GalleryConfig, ManagedGalleryImage } from "@/lib/gallery-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const GALLERY_CONFIG_PATH = path.join(process.cwd(), "src", "config", "gallery.json");
const MEDIA_CONFIG_PATH = path.join(process.cwd(), "src", "config", "media.json");
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const LEGACY_MEDIA_USAGE: Record<string, string[]> = {
  "/gallery/aniedi-ekemini/aniedi-ekemini-01.jpg": ["Kind Words: Latisha"],
  "/gallery/amber-kendall/amber-kendall-06.jpeg": ["Kind Words: Scott"],
  "/gallery/aniedi-ekemini/aniedi-ekemini-13.jpg": ["Kind Words: Nicole & Eric"],
  "/gallery/purple-grandeur/purple-grandeur-02.jpg": ["Kind Words: Ashley & Michael"],
  "/gallery/aniedi-ekemini/aniedi-ekemini-12.jpg": ["Kind Words: Victoria & James"],
  "/gallery/white-green-botanicals/white-green-botanicals-04.jpeg": ["Homepage video poster", "Concept A video poster"],
  "/gallery/amber-kendall/amber-kendall-23.jpeg": ["Social sharing image"],
  "/gallery/r-and-j/r-and-j-04.jpeg": ["Reserve page"],
  "/investments/full-production.jpg": ["Reserve page"],
  "/gallery/amber-kendall/amber-kendall-30.jpeg": ["Reserve page"],
  "/gallery/curated-installations/curated-installations-01.jpeg": ["Reserve page"]
};

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif"
};

function unavailableOnVercel() {
  return Boolean(process.env.VERCEL);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 70);
}

function publicFilePath(src: string) {
  if (!src.startsWith("/") || src.includes("\\")) return null;
  const normalized = path.posix.normalize(src);
  if (normalized.includes("..")) return null;

  const absolutePath = path.resolve(/* turbopackIgnore: true */ PUBLIC_DIR, `.${normalized}`);
  const publicPrefix = `${path.resolve(PUBLIC_DIR)}${path.sep}`;
  return absolutePath.startsWith(publicPrefix) ? absolutePath : null;
}

async function readGalleryConfig(): Promise<GalleryConfig> {
  return JSON.parse(await fs.readFile(GALLERY_CONFIG_PATH, "utf8")) as GalleryConfig;
}

async function writeGalleryConfig(config: GalleryConfig) {
  const temporaryPath = `${GALLERY_CONFIG_PATH}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await fs.rename(temporaryPath, GALLERY_CONFIG_PATH);
}

function collectionFor(config: GalleryConfig, slug: string) {
  const collection = config.collections.find((item) => item.slug === slug);
  if (!collection) throw new Error("Gallery collection not found.");
  return collection;
}

async function imageFromLibrary(src: string, collection: GalleryCollection): Promise<ManagedGalleryImage> {
  const absolutePath = publicFilePath(src);
  if (!absolutePath || !/\.(avif|gif|jpe?g|png|webp)$/i.test(absolutePath)) {
    throw new Error("Choose an image from the media library.");
  }

  const buffer = await fs.readFile(/* turbopackIgnore: true */ absolutePath);
  const dimensions = imageSize(buffer);
  if (!dimensions.width || !dimensions.height) throw new Error("Could not read that image.");

  return {
    src,
    width: dimensions.width,
    height: dimensions.height,
    alt: `${collection.name} - Lady Victoria Designs`,
    category: collection.defaultCategory,
    visible: true
  };
}

export async function GET() {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The gallery editor is local-only." }, { status: 404 });
  }

  return Response.json({ config: await readGalleryConfig() });
}

export async function PATCH(request: Request) {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The gallery editor is local-only." }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = body.action;
    const config = await readGalleryConfig();

    if (action === "create-collection") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const defaultCategory = typeof body.defaultCategory === "string" ? body.defaultCategory : "Artistry";
      if (!name) throw new Error("Enter a collection name.");

      const baseSlug = slugify(name) || "collection";
      let slug = baseSlug;
      let suffix = 2;
      while (config.collections.some((item) => item.slug === slug)) slug = `${baseSlug}-${suffix++}`;

      config.collections.push({ slug, name, defaultCategory, cover: "", visible: true, images: [] });
      await writeGalleryConfig(config);
      return Response.json({ config, selectedSlug: slug });
    }

    const slug = typeof body.slug === "string" ? body.slug : "";
    const collection = collectionFor(config, slug);

    if (action === "update-collection") {
      if (typeof body.name === "string" && body.name.trim()) collection.name = body.name.trim();
      if (typeof body.defaultCategory === "string") collection.defaultCategory = body.defaultCategory;
      if (typeof body.visible === "boolean") collection.visible = body.visible;
    } else if (action === "add-image") {
      const src = typeof body.src === "string" ? body.src : "";
      if (!src) throw new Error("Choose an image to add.");
      if (!collection.images.some((image) => image.src === src)) {
        collection.images.push(await imageFromLibrary(src, collection));
      }
      if (!collection.cover) collection.cover = src;
    } else if (action === "update-image") {
      const src = typeof body.src === "string" ? body.src : "";
      const image = collection.images.find((item) => item.src === src);
      if (!image) throw new Error("Gallery image not found.");
      if (typeof body.visible === "boolean") image.visible = body.visible;
      if (typeof body.category === "string") image.category = body.category;
      if (typeof body.alt === "string") image.alt = body.alt.trim();
    } else if (action === "set-cover") {
      const src = typeof body.src === "string" ? body.src : "";
      const index = collection.images.findIndex((item) => item.src === src);
      if (index < 0) throw new Error("Gallery image not found.");
      collection.cover = src;
      const [coverImage] = collection.images.splice(index, 1);
      collection.images.unshift(coverImage);
    } else if (action === "remove-image") {
      const src = typeof body.src === "string" ? body.src : "";
      collection.images = collection.images.filter((image) => image.src !== src);
      if (collection.cover === src) collection.cover = collection.images[0]?.src || "";
    } else if (action === "reorder-images") {
      const orderedSources = Array.isArray(body.orderedSources)
        ? body.orderedSources.filter((item): item is string => typeof item === "string")
        : [];
      if (orderedSources.length !== collection.images.length || new Set(orderedSources).size !== collection.images.length) {
        throw new Error("The gallery order was incomplete.");
      }
      const bySource = new Map(collection.images.map((image) => [image.src, image]));
      const reordered = orderedSources.map((src) => bySource.get(src));
      if (reordered.some((image) => !image)) throw new Error("The gallery order contained an unknown image.");
      collection.images = reordered as ManagedGalleryImage[];
    } else {
      throw new Error("Unknown gallery action.");
    }

    await writeGalleryConfig(config);
    return Response.json({ config, selectedSlug: slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the gallery.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The gallery editor is local-only." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = formData.get("slug");
    if (!(file instanceof File)) throw new Error("Choose an image to upload.");
    if (typeof slug !== "string") throw new Error("Choose a gallery collection.");
    if (file.size === 0 || file.size > MAX_FILE_SIZE) throw new Error("Images must be smaller than 20 MB.");

    const extension = IMAGE_TYPES[file.type];
    if (!extension) throw new Error("Use a JPG, PNG, WebP, AVIF, or GIF image.");

    const config = await readGalleryConfig();
    const collection = collectionFor(config, slug);
    const originalBase = path.basename(file.name, path.extname(file.name));
    const safeBase = slugify(originalBase) || "image";
    const fileName = `${safeBase}-${randomUUID().slice(0, 8)}${extension}`;
    const collectionDirectory = path.join(PUBLIC_DIR, "gallery", collection.slug);
    const absolutePath = path.join(collectionDirectory, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const dimensions = imageSize(buffer);
    if (!dimensions.width || !dimensions.height) throw new Error("Could not read that image.");

    await fs.mkdir(collectionDirectory, { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const src = `/gallery/${collection.slug}/${fileName}`;
    collection.images.push({
      src,
      width: dimensions.width,
      height: dimensions.height,
      alt: `${collection.name} - Lady Victoria Designs`,
      category: collection.defaultCategory,
      visible: true
    });
    if (!collection.cover) collection.cover = src;
    await writeGalleryConfig(config);

    return Response.json({
      config,
      selectedSlug: slug,
      asset: { src, name: fileName, folder: `gallery/${collection.slug}` }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that image.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The gallery editor is local-only." }, { status: 403 });
  }

  try {
    const body = await request.json() as { slug?: string; src?: string };
    if (!body.slug || !body.src) throw new Error("Choose a gallery image to delete.");

    const config = await readGalleryConfig();
    const collection = collectionFor(config, body.slug);
    const mediaConfig = JSON.parse(await fs.readFile(MEDIA_CONFIG_PATH, "utf8")) as Record<string, string>;
    const usages: string[] = [];

    for (const slot of MEDIA_SLOTS) {
      if (mediaConfig[slot.id] === body.src) usages.push(`${slot.group}: ${slot.label}`);
    }
    for (const candidate of config.collections) {
      if (candidate.cover === body.src) usages.push(`Gallery cover: ${candidate.name}`);
      if (candidate.slug !== collection.slug && candidate.images.some((image) => image.src === body.src)) {
        usages.push(`Gallery collection: ${candidate.name}`);
      }
    }
    for (const reference of LEGACY_MEDIA_USAGE[body.src] || []) usages.push(reference);

    if (usages.length > 0) {
      return Response.json({ error: "This file is still in use.", usages }, { status: 409 });
    }

    const absolutePath = publicFilePath(body.src);
    if (!absolutePath) throw new Error("Invalid image path.");
    await fs.access(absolutePath);

    collection.images = collection.images.filter((image) => image.src !== body.src);
    await writeGalleryConfig(config);
    await fs.unlink(absolutePath);

    return Response.json({ config, selectedSlug: body.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete that image.";
    return Response.json({ error: message }, { status: 400 });
  }
}
