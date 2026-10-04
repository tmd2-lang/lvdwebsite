"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import MasonryGrid from "@/components/sections/MasonryGrid";
import Lightbox from "@/components/ui/Lightbox";
import Contact from "@/components/sections/Contact";
import { galleryImages, galleryOpeningImages } from "@/lib/gallery-data";

export default function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ["All", "Weddings", "Ceremonies", "Receptions", "Tablescapes", "Artistry"];

  const filteredImages = useMemo(() => {
    if (selectedCategory === "All") {
      return [
        ...galleryOpeningImages,
        ...galleryImages.filter((image) => !galleryOpeningImages.includes(image)),
      ];
    }
    return galleryImages.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  const openingImages = selectedCategory === "All" ? galleryOpeningImages : [];
  const archiveImages = filteredImages.slice(openingImages.length);

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
        
        {openingImages.length > 0 && (
          <div className="grid w-full max-w-[1600px] grid-cols-1 gap-4 px-4 md:grid-cols-3 md:gap-6 md:px-12">
            {openingImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Open ${image.alt}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-sm border border-ivory/5 bg-ink/40 text-left cursor-pointer"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-5 pb-5 pt-12 font-body text-[10px] uppercase tracking-[0.18em] text-ivory">
                  {image.collection}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Masonry Grid */}
        <MasonryGrid 
          images={archiveImages}
          onImageClick={(index) => setLightboxIndex(index + openingImages.length)}
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
