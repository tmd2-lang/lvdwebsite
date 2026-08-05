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
