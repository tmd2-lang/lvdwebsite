"use client";

import { useState } from "react";
import Link from "next/link";
import MasonryGrid from "@/components/sections/MasonryGrid";
import Lightbox from "@/components/ui/Lightbox";
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

        {/* Final CTA matching Services page */}
        <section className="w-full bg-ivory text-ink py-32 md:py-48 px-6 md:px-12 flex flex-col items-center justify-center border-t border-ink/20 mt-12">
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-center mb-12 max-w-4xl mx-auto leading-tight">
            Ready to bring your <span className="italic text-gold">vision</span> to life?
          </h2>
          <Link 
            href="/inquire" 
            className="group relative px-8 py-4 border border-ink overflow-hidden"
          >
            <div className="absolute inset-0 bg-ink translate-y-[101%] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            <span className="relative z-10 font-body text-xs md:text-sm uppercase tracking-widest text-ink transition-colors duration-500 group-hover:text-ivory">
              BOOK A CONSULTATION
            </span>
          </Link>
        </section>

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
