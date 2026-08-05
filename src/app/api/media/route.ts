import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MEDIA_SLOTS, MEDIA_SLOT_IDS } from "@/lib/media-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const CONFIG_PATH = path.join(process.cwd(), "src", "config", "media.json");
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif"
};

type MediaConfig = Record<string, string>;

type MediaAsset = {
  src: string;
  name: string;
  folder: string;
};

function unavailableOnVercel() {
  return Boolean(process.env.VERCEL);
}

async function readConfig(): Promise<MediaConfig> {
  return JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")) as MediaConfig;
}

async function writeConfig(config: MediaConfig) {
  const temporaryPath = `${CONFIG_PATH}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await fs.rename(temporaryPath, CONFIG_PATH);
}

async function listImages(directory = PUBLIC_DIR): Promise<MediaAsset[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const assets = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listImages(absolutePath);
    if (!entry.isFile() || !/\.(avif|gif|jpe?g|png|webp)$/i.test(entry.name)) return [];

    const relativePath = path.relative(PUBLIC_DIR, absolutePath).split(path.sep).join("/");
    return [{
      src: `/${relativePath}`,
      name: entry.name,
      folder: path.posix.dirname(relativePath) === "." ? "Root" : path.posix.dirname(relativePath)
    }];
  }));

  return assets.flat();
}

function publicFilePath(src: string) {
  if (!src.startsWith("/") || src.includes("\\")) return null;
  const normalized = path.posix.normalize(src);
  if (normalized.includes("..")) return null;

  const absolutePath = path.resolve(PUBLIC_DIR, `.${normalized}`);
  const publicPrefix = `${path.resolve(PUBLIC_DIR)}${path.sep}`;
  return absolutePath.startsWith(publicPrefix) ? absolutePath : null;
}

async function updateSlot(slotId: string, src: string) {
  if (!MEDIA_SLOT_IDS.has(slotId)) throw new Error("Unknown media slot.");

  const absolutePath = publicFilePath(src);
  if (!absolutePath || !/\.(avif|gif|jpe?g|png|webp)$/i.test(absolutePath)) {
    throw new Error("Choose an image from the media library.");
  }

  await fs.access(absolutePath);
  const config = await readConfig();
  config[slotId] = src;
  await writeConfig(config);
}

export async function GET() {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The media editor is local-only." }, { status: 404 });
  }

  const [config, assets] = await Promise.all([readConfig(), listImages()]);
  assets.sort((a, b) => a.src.localeCompare(b.src));

  return Response.json({
    writable: true,
    slots: MEDIA_SLOTS.map((slot) => ({ ...slot, value: config[slot.id] })),
    assets
  });
}

export async function PATCH(request: Request) {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The media editor is local-only." }, { status: 403 });
  }

  try {
    const body = await request.json() as { slotId?: string; src?: string };
    if (!body.slotId || !body.src) throw new Error("A slot and image are required.");
    await updateSlot(body.slotId, body.src);
    return Response.json({ slotId: body.slotId, src: body.src });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update that image.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (unavailableOnVercel()) {
    return Response.json({ error: "The media editor is local-only." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slotId = formData.get("slotId");

    if (!(file instanceof File)) throw new Error("Choose an image to upload.");
    if (file.size === 0 || file.size > MAX_FILE_SIZE) throw new Error("Images must be smaller than 20 MB.");

    const extension = IMAGE_TYPES[file.type];
    if (!extension) throw new Error("Use a JPG, PNG, WebP, AVIF, or GIF image.");
    if (typeof slotId === "string" && slotId && !MEDIA_SLOT_IDS.has(slotId)) {
      throw new Error("Unknown media slot.");
    }

    const originalBase = path.basename(file.name, path.extname(file.name));
    const safeBase = originalBase
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 70) || "image";
    const fileName = `${safeBase}-${randomUUID().slice(0, 8)}${extension}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));

    const src = `/uploads/${fileName}`;
    if (typeof slotId === "string" && slotId) await updateSlot(slotId, src);

    return Response.json({
      asset: { src, name: fileName, folder: "uploads" },
      slotId: typeof slotId === "string" ? slotId : null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that image.";
    return Response.json({ error: message }, { status: 400 });
  }
}
