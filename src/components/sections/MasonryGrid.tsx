"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/gallery-data";
import { PHOTO_PLACEHOLDER } from "@/lib/image-placeholder";

type MasonryGridProps = {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
  enabled?: boolean;
};

const BATCH_SIZE = 12;

export default function MasonryGrid({ images, onImageClick, enabled = true }: MasonryGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const moreRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ columnCount: 2, columnWidth: 160, gap: 16 });
  const hasMore = visibleCount < images.length;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new ResizeObserver(() => {
      const styles = window.getComputedStyle(grid);
      const widths = styles.gridTemplateColumns.split(" ").map(Number.parseFloat);
      const gap = Number.parseFloat(styles.columnGap);
      if (!widths.length || !Number.isFinite(widths[0]) || widths[0] <= 0) return;
      setLayout((current) => current.columnCount === widths.length && current.columnWidth === widths[0] && current.gap === gap
        ? current
        : { columnCount: widths.length, columnWidth: widths[0], gap });
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const more = moreRef.current;
    const grid = gridRef.current;
    if (!more || !grid || !enabled || !hasMore || !("IntersectionObserver" in window)) return;
    let nearby = false;
    const loadNextBatch = () => {
      const photos = Array.from(grid.querySelectorAll(".gallery-item img"));
      if (!nearby || photos.some((photo) => !(photo as HTMLImageElement).complete)) return;
      observer.disconnect();
      grid.removeEventListener("load", loadNextBatch, true);
      grid.removeEventListener("error", loadNextBatch, true);
      setVisibleCount((count) => Math.min(count + BATCH_SIZE, images.length));
    };
    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      loadNextBatch();
    }, { rootMargin: "600px 0px" });
    grid.addEventListener("load", loadNextBatch, true);
    grid.addEventListener("error", loadNextBatch, true);
    observer.observe(more);
    return () => {
      observer.disconnect();
      grid.removeEventListener("load", loadNextBatch, true);
      grid.removeEventListener("error", loadNextBatch, true);
    };
  }, [enabled, hasMore, images.length, visibleCount]);

  // Keep earlier placements stable as batches arrive; fill the shortest column.
  const columns: { image: GalleryImage; index: number }[][] = Array.from({ length: layout.columnCount }, () => []);
  const heights = Array<number>(layout.columnCount).fill(0);
  for (let index = 0; index < Math.min(visibleCount, images.length); index++) {
    const image = images[index];
    const column = heights.indexOf(Math.min(...heights));
    columns[column].push({ image, index });
    heights[column] += layout.columnWidth * image.height / image.width + layout.gap;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 mt-8 pb-32">
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-start gap-4 md:gap-6">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex min-w-0 flex-col gap-4 md:gap-6">
            {column.map(({ image: img, index }) => (
              <button
                type="button"
                key={img.src}
                onClick={() => onImageClick(index)}
                aria-label={`Open ${img.alt || img.collection || `gallery image ${index + 1}`}`}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
                className="gallery-item block shrink-0 w-full overflow-hidden rounded-sm relative group cursor-pointer bg-ivory/10 border border-ivory/5 text-left"
              >
                {enabled && <Image
                  src={img.src}
                  alt={img.alt || `Lady Victoria Designs Gallery ${index + 1}`}
                  width={img.width}
                  height={img.height}
                  unoptimized={img.src.startsWith("https://")}
                  sizes="(max-width: 767px) calc(50vw - 24px), (max-width: 1279px) calc(33.33vw - 48px), (max-width: 1599px) calc(25vw - 42px), 358px"
                  loading="lazy"
                  fetchPriority="low"
                  placeholder="blur"
                  blurDataURL={PHOTO_PLACEHOLDER}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 pointer-events-none">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold">{img.collection}</span>
                </div>
              </button>
          ))}
        </div>
        ))}
      </div>
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
