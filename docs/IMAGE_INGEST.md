# Image ingest: how photos get onto the site

For the agent (Muse) that downloads, resizes and uploads photos. Do not download originals to TJ's laptop.

## Where images live today

- Public gallery photos are files in the repo under `public/gallery/<collection-slug>/`.
- The gallery page reads `src/config/gallery.json` (this is the manifest). `src` can be a local path (`/gallery/...`) or a full https URL. Next.js serves both through `next/image`.
- New photos go to Supabase Storage instead, in a **public** bucket named `site-images`. The existing `client-images` bucket is private and is for couples' portal boards only. Do not use it.

## URL pattern

```
https://omxqapabksjnkogsflbh.supabase.co/storage/v1/object/public/site-images/gallery/<collection-slug>/<file>.webp
```

`NEXT_PUBLIC_SUPABASE_URL` in `.env.local` gives the project URL. The site already allows this path in `next.config.ts`.

## One-time setup (TJ, about 1 minute)

Supabase dashboard, then Storage, then New bucket: name `site-images`, tick **Public bucket**. Nothing else.

## Image spec

- Format: WebP, quality about 82.
- Long edge: 2400 px max (portrait 1600 x 2400, landscape 2400 x 1600 is the existing norm). Never upscale.
- Target size: 300 KB to 1 MB each.
- File names: lowercase, hyphens, no spaces: `<collection-slug>-<two-digit-number>.webp`, for example `laura-ken-07.webp`.
- Folder: `gallery/<collection-slug>/` inside the bucket.
- Upload with `x-upsert: false`. The permission is add-only, so overwriting or deleting will fail by design.

## Collections

Existing slugs: laura-ken, jasseley-emmanuel, terri-baskin, aniedi-ekemini, amber-kendall, classic-wedding-archive, curated-installations, editorial-wedding-archive, estate-florals, grand-staircase-wedding, jenny-jordan, purple-grandeur, r-and-j, two-tone-luxe, white-green-botanicals, white-silver-reception.

New collections are fine: use a new lowercase-hyphen slug and set `collectionName`.

Categories (must be exactly one of): `Weddings`, `Ceremonies`, `Receptions`, `Tablescapes`, `Artistry`.

## Manifest the agent returns

One JSON file:

```json
{
  "images": [
    {
      "collection": "laura-ken",
      "collectionName": "Laura + Ken",
      "src": "https://omxqapabksjnkogsflbh.supabase.co/storage/v1/object/public/site-images/gallery/laura-ken/laura-ken-40.webp",
      "width": 2400,
      "height": 1600,
      "alt": "Grand ballroom reception with white flowers and crystal chandeliers - Lady Victoria Designs",
      "category": "Receptions",
      "sort": 40
    }
  ]
}
```

Rules: `width` and `height` are the real pixel size of the uploaded file. `alt` is a plain description of what is in the photo, ending in ` - Lady Victoria Designs`. `sort` sets order within a collection.

## What happens after

TJ saves the manifest anywhere and runs:

```bash
node scripts/merge-gallery-manifest.mjs path/to/manifest.json
node scripts/merge-gallery-manifest.mjs path/to/manifest.json --write
```

The first command is a dry run that checks every entry. The second saves into `src/config/gallery.json`. Existing entries are never changed or duplicated. Then commit `src/config/gallery.json` only. No photo files go in git.

## Keys and uploading

Use the Supabase **anon (public) key** that TJ gives you. Do not ask for or use the service role key.

TJ has turned on a temporary add-only permission for the anon key on `site-images`. It can upload new files and nothing else. TJ will remove it when the photos are done.

Upload one file with the Storage REST API:

```
POST https://omxqapabksjnkogsflbh.supabase.co/storage/v1/object/site-images/gallery/<collection-slug>/<file>.webp
Headers:
  apikey: <anon key>
  Authorization: Bearer <anon key>
  Content-Type: image/webp
  x-upsert: false
Body: the WebP file bytes
```

TJ's key is the legacy anon key (a long string starting with `eyJ`). Send it in BOTH the `apikey` and `Authorization: Bearer` headers. Storage rejects the request without both. Tested and working.

A 200 means it worked. Uploading a name that already exists comes back as a 400/403 "row-level security" error (overwrites are blocked on purpose). Treat that as "already uploaded" and skip it. Cleaner: request the file's public URL first (see URL pattern above); a 200 means it is already there.
