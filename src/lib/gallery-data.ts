import galleryConfigJson from "@/config/gallery.json";
import type { GalleryConfig } from "@/lib/gallery-types";

export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  collection: string;
  category: string;
  slug: string;
};

export const galleryConfig = galleryConfigJson as GalleryConfig;

export const galleryImages: GalleryImage[] = galleryConfig.collections.flatMap((collection) => {
  if (!collection.visible) return [];

  return collection.images
    .filter((image) => image.visible)
    .map((image) => ({
      src: image.src,
      width: image.width,
      height: image.height,
      alt: image.alt,
      collection: collection.name,
      category: image.category,
      slug: collection.slug
    }));
});

// Introduce different settings and palettes before the collection archive.
// Derive from visible images so hidden collections stay hidden.
const openingImageSources = [
  "/gallery/editorial-wedding-archive/editorial-wedding-archive-04.jpg",
  "/gallery/r-and-j/r-and-j-04.jpeg",
  "/gallery/editorial-wedding-archive/editorial-wedding-archive-56.jpg",
];

export const galleryOpeningImages = openingImageSources.flatMap((src) => {
  const image = galleryImages.find((image) => image.src === src);
  return image ? [image] : [];
});
