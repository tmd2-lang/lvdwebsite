"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { GalleryImage } from "@/lib/gallery-data";

type MasonryGridProps = {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
};

export default function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(".gallery-item"));
    if (items.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, y: 32 });

      ScrollTrigger.batch(items, {
        interval: 0.1,
        batchMax: 4,
        onEnter: (batch) => gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true,
        }),
        onEnterBack: (batch) => gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
        }),
      });
    }, container);

    return () => ctx.revert();
  }, [images]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[1600px] mx-auto columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-6 px-4 md:px-12 mt-8 pb-32"
    >
      {images.map((img, index) => (
        <button
          type="button"
          key={index}
          onClick={() => onImageClick(index)}
          aria-label={`Open ${img.alt || img.collection || `gallery image ${index + 1}`}`}
          className="gallery-item block break-inside-avoid mb-4 md:mb-6 w-full overflow-hidden rounded-sm relative group cursor-pointer bg-ink/40 border border-ivory/5 text-left"
        >
          <Image
            src={img.src}
            alt={img.alt || `Lady Victoria Designs Gallery ${index + 1}`}
            width={img.width}
            height={img.height}
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            loading="lazy"
            className="w-full h-auto object-cover transform transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          {/* Subtle overlay & collection tag on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 pointer-events-none">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold">
              {img.collection}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
