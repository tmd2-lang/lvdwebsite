export const GALLERY_CATEGORIES = [
  "Weddings",
  "Ceremonies",
  "Receptions",
  "Tablescapes",
  "Artistry"
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type ManagedGalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  category: string;
  visible: boolean;
};

export type GalleryCollection = {
  slug: string;
  name: string;
  defaultCategory: string;
  cover: string;
  visible: boolean;
  images: ManagedGalleryImage[];
};

export type GalleryConfig = {
  collections: GalleryCollection[];
};
