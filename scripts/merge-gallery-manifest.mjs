// Merges a manifest returned by the photo-ingest agent into src/config/gallery.json.
// Usage: node scripts/merge-gallery-manifest.mjs path/to/manifest.json [--write]
// Without --write it only prints what would change.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "src", "config", "gallery.json");
const CATEGORIES = ["Weddings", "Ceremonies", "Receptions", "Tablescapes", "Artistry"];
const URL_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/site-images\/.+\.webp$/;

const manifestPath = process.argv[2];
const write = process.argv.includes("--write");
if (!manifestPath) {
  console.error("Usage: node scripts/merge-gallery-manifest.mjs manifest.json [--write]");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const problems = [];
let added = 0;
let skipped = 0;

for (const [index, entry] of (manifest.images ?? []).entries()) {
  const label = `images[${index}]`;
  if (!URL_PATTERN.test(entry.src ?? "")) problems.push(`${label}: src must be a public site-images .webp URL`);
  if (!Number.isInteger(entry.width) || !Number.isInteger(entry.height)) problems.push(`${label}: width and height must be whole numbers`);
  if (!entry.alt || entry.alt.length < 10) problems.push(`${label}: alt text is missing or too short`);
  if (!CATEGORIES.includes(entry.category)) problems.push(`${label}: category must be one of ${CATEGORIES.join(", ")}`);
  if (!entry.collection) problems.push(`${label}: collection slug is missing`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const sorted = [...manifest.images].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
for (const entry of sorted) {
  let collection = config.collections.find((item) => item.slug === entry.collection);
  if (!collection) {
    collection = {
      slug: entry.collection,
      name: entry.collectionName ?? entry.collection,
      defaultCategory: entry.category,
      cover: "",
      visible: true,
      images: [],
    };
    config.collections.push(collection);
  }
  if (collection.images.some((image) => image.src === entry.src)) {
    skipped += 1;
    continue;
  }
  collection.images.push({
    src: entry.src,
    width: entry.width,
    height: entry.height,
    alt: entry.alt,
    category: entry.category,
    visible: true,
  });
  if (!collection.cover) collection.cover = entry.src;
  added += 1;
}

console.log(`${added} added, ${skipped} already present.`);
if (write) {
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log("Wrote src/config/gallery.json");
} else {
  console.log("Dry run. Add --write to save.");
}
