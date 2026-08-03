"use client";

import { useState, useMemo } from "react";
import MasonryGrid from "@/components/sections/MasonryGrid";
import Lightbox from "@/components/ui/Lightbox";
import Contact from "@/components/sections/Contact";
import { galleryImages } from "@/lib/gallery-data";

export default function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ["All", "Weddings", "Ceremonies", "Receptions", "Tablescapes", "Artistry"];

  const filteredImages = useMemo(() => {
    if (selectedCategory === "All") return galleryImages;
    return galleryImages.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <main className="w-full min-h-screen bg-ink text-ivory flex flex-col items-center justify-center pt-32 pb-24">
        
        {/* Header Section */}
        <div className="px-6 md:px-12 w-full flex flex-col items-center">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-4 flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50"></span>
            PORTFOLIO
            <span className="w-8 h-px bg-gold/50"></span>
          </div>
          <h1 className="font-display text-[clamp(2.75rem,6vw,5.5rem)] text-ivory mb-6 text-center leading-none">
            Signature <span className="italic font-normal text-gold">Portfolio</span>
          </h1>
          <p className="font-body text-sm md:text-base text-ivory/70 max-w-xl text-center mb-10 font-light">
            An expansive showcase of grand floral installations, sculptural ceremonies, and bespoke receptions.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 max-w-3xl">
            {categories.map((cat) => {
              const count = cat === "All" ? galleryImages.length : galleryImages.filter(img => img.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 rounded-full font-body text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gold text-ink font-semibold shadow-md"
                      : "bg-ivory/10 text-ivory/70 hover:text-ivory hover:bg-ivory/20"
                  }`}
                >
                  {cat} <span className="text-[10px] opacity-60 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Masonry Grid */}
        <MasonryGrid 
          images={filteredImages}
          onImageClick={(index) => setLightboxIndex(index)}
        />

        {/* Universal Floral CTA */}
        <Contact />

      </main>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <Lightbox 
          images={filteredImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
