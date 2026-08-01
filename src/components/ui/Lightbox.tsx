"use client";

import { useEffect, useRef, useState } from "react";
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

  // Focus trap & Key listeners
  useEffect(() => {
    // Focus close button on mount
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      
      // Basic focus trap (prevent tabbing out)
      if (e.key === "Tab") {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Mount/Unmount Animation & Scroll Lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleClose = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, { 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.inOut",
        onComplete: onClose 
      });
    } else {
      onClose();
    }
  };

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
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
      onClick={handleClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button 
        ref={closeBtnRef}
        className="absolute top-6 right-6 md:top-12 md:right-12 z-50 text-ivory/70 hover:text-ivory transition-colors"
        onClick={handleClose}
        aria-label="Close lightbox"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <button 
        className="absolute left-4 md:left-12 z-50 text-ivory/70 hover:text-ivory transition-colors hidden md:block"
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div 
        className="relative w-full max-w-[1200px] h-full max-h-[85vh] flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <Image 
            src={images[currentIndex].src}
            alt={images[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      <button 
        className="absolute right-4 md:right-12 z-50 text-ivory/70 hover:text-ivory transition-colors hidden md:block"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      {/* Mobile index indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-xs tracking-widest text-gold md:hidden pointer-events-none">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
