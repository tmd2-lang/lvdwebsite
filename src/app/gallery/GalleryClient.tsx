"use client";

import { useState } from "react";
import MasonryGrid from "@/components/sections/MasonryGrid";
import Lightbox from "@/components/ui/Lightbox";
import Contact from "@/components/sections/Contact";
import { galleryImages } from "@/lib/gallery-data";

export default function GalleryClient() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <main className="w-full min-h-screen bg-ink text-ivory flex flex-col items-center justify-center pt-32 pb-24">
        
        {/* Header Section */}
        <div className="px-6 md:px-12 w-full flex flex-col items-center">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50"></span>
            GALLERY
            <span className="w-8 h-px bg-gold/50"></span>
          </div>
          <h1 className="font-display text-[clamp(3rem,6vw,6rem)] text-ivory mb-16 text-center leading-none">
            Full <span className="italic text-gold">Gallery</span>
          </h1>
        </div>
        
        {/* Masonry Grid */}
        <MasonryGrid 
          images={galleryImages} 
          onImageClick={(index) => setLightboxIndex(index)} 
        />

        {/* Universal Floral CTA */}
        <Contact />

      </main>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <Lightbox 
          images={galleryImages} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxIndex(null)} 
        />
      )}
    </>
  );
}
