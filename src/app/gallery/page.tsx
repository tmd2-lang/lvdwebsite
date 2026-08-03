import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Wedding & Event Design Gallery",
  description:
    "Explore luxury weddings, sculptural ceremonies, bespoke receptions, tablescapes, and floral artistry by Lady Victoria Designs.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
