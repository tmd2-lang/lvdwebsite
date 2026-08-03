"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { GalleryImage } from "@/lib/gallery-data";

type LightboxProps = {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
};

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleClose = useCallback(() => {
    if (
      containerRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: onClose,
      });
      return;
    }

    onClose();
  }, [onClose]);

  // Focus trap & Key listeners
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();

      if (e.key === "Tab") {
        const focusable = containerRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled])",
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [handleClose, handleNext, handlePrev]);

  // Mount/Unmount Animation & Scroll Lock
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (
      containerRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext(); // Swipe left
    } else if (diff < -50) {
      handlePrev(); // Swipe right
    }
    touchStartX.current = null;
  };

  return (
    <div 
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio image viewer"
      aria-describedby="lightbox-caption"
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button 
        type="button"
        ref={closeBtnRef}
        className="absolute top-4 right-4 md:top-10 md:right-10 z-50 grid min-h-11 min-w-11 place-items-center text-ivory/70 hover:text-ivory transition-colors cursor-pointer"
        onClick={handleClose}
        aria-label="Close lightbox"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <button 
        type="button"
        className="absolute left-2 md:left-10 z-50 grid min-h-11 min-w-11 place-items-center text-ivory/70 hover:text-ivory transition-colors cursor-pointer"
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className="relative w-full max-w-[1200px] h-full max-h-[85vh] flex flex-col items-center justify-center pointer-events-none">
        <div className="relative w-[84vw] md:w-[80vw] h-[72vh] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 84vw, 80vw"
            className="object-contain drop-shadow-2xl"
          />
          <div id="lightbox-caption" className="absolute inset-x-0 -bottom-11 flex flex-col items-center text-center">
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">
              {images[currentIndex].collection}
            </span>
            <span className="font-body text-xs text-ivory/60 mt-1">
              {currentIndex + 1} of {images.length}
            </span>
          </div>
        </div>
      </div>

      <button 
        type="button"
        className="absolute right-2 md:right-10 z-50 grid min-h-11 min-w-11 place-items-center text-ivory/70 hover:text-ivory transition-colors cursor-pointer"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
    </div>
  );
}
