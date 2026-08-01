import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Lady Victoria Designs",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
