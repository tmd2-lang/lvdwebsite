"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/gallery-data";
import { PHOTO_PLACEHOLDER } from "@/lib/image-placeholder";

type MasonryGridProps = {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
};

const BATCH_SIZE = 12;

export default function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const moreRef = useRef<HTMLButtonElement>(null);
  const hasMore = visibleCount < images.length;

  useEffect(() => {
    const more = moreRef.current;
    if (!more || !hasMore || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, images.length));
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(more);
    return () => observer.disconnect();
  }, [hasMore, images.length, visibleCount]);

  const batches = [];
  for (let start = 0; start < Math.min(visibleCount, images.length); start += BATCH_SIZE) {
    batches.push({ start, images: images.slice(start, start + BATCH_SIZE) });
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 mt-8 pb-32">
      {/* Separate batches keep earlier columns stable when more photos arrive. */}
      {batches.map((batch) => (
        <div key={batch.start} className="columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-6">
          {batch.images.map((img, index) => (
            <button
              type="button"
              key={img.src}
              onClick={() => onImageClick(batch.start + index)}
              aria-label={`Open ${img.alt || img.collection || `gallery image ${batch.start + index + 1}`}`}
              className="gallery-item block break-inside-avoid mb-4 md:mb-6 w-full overflow-hidden rounded-sm relative group cursor-pointer bg-ivory/10 border border-ivory/5 text-left"
            >
              <Image
                src={img.src}
                alt={img.alt || `Lady Victoria Designs Gallery ${batch.start + index + 1}`}
                width={img.width}
                height={img.height}
                sizes="(max-width: 767px) calc(50vw - 24px), (max-width: 1279px) calc(33.33vw - 48px), (max-width: 1599px) calc(25vw - 42px), 358px"
                loading="lazy"
                placeholder="blur"
                blurDataURL={PHOTO_PLACEHOLDER}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 pointer-events-none">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold">{img.collection}</span>
              </div>
            </button>
          ))}
        </div>
      ))}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            ref={moreRef}
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, images.length))}
            className="border border-ivory/30 px-6 py-4 font-body text-xs uppercase tracking-[0.15em] text-ivory hover:bg-ivory/10 transition-colors"
          >
            View more photographs
          </button>
        </div>
      )}
    </div>
  );
}
