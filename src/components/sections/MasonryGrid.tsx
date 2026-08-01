"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GalleryImage } from "@/lib/gallery-data";

type MasonryGridProps = {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
};

export default function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // We select all image containers that have the 'gallery-item' class
    const items = gsap.utils.toArray(".gallery-item") as HTMLElement[];
    
    if (items.length === 0) return;

    // Awwwards Style Scroll Stagger: 
    // We use batching so images entering the viewport at the same time animate together
    ScrollTrigger.batch(items, {
      interval: 0.1, // time window (in seconds) to batch trigger events
      batchMax: 4,   // maximum batch size (e.g. 4 items animate together if they enter simultaneously)
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1, 
        y: 0, 
        stagger: 0.15, 
        duration: 1.2, 
        ease: "power3.out",
        overwrite: true
      }),
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [images]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[1600px] mx-auto columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 px-4 md:px-12 mt-12 pb-32"
    >
      {images.map((img, index) => (
        <div 
          key={index} 
          onClick={() => onImageClick(index)}
          className="gallery-item break-inside-avoid mb-6 w-full opacity-0 translate-y-12 overflow-hidden rounded-sm relative group cursor-pointer"
        >
          <Image 
            src={img.src} 
            alt={img.alt || `Lady Victoria Design ${index}`} 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="w-full h-auto object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          />
          {/* Subtle overlay on hover for that ultra-premium feel */}
          <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
