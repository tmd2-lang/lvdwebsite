"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ParallaxDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Smooth GSAP Parallax Effect
    // As the user scrolls past the container, the image moves at a different speed
    gsap.to(imageRef.current, {
      yPercent: 20, 
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
  }, []);

  return (
    // We keep z-0 here so that SignatureWork (z-20) can slide over it!
    <section ref={containerRef} className="w-full h-[70vh] md:h-[90vh] overflow-hidden relative z-0 bg-ink">
      {/* 
        We make the wrapper taller than the container (h-[120%]) 
        and shift it up so the image has room to move down without exposing empty space.
      */}
      <div 
        ref={imageRef}
        className="absolute top-[-10%] left-0 w-full h-[120%] will-change-transform"
      >
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Wedding Design"
          className="w-full h-full object-cover"
        />
        {/* Subtle vignette/overlay to blend beautifully out of the black Narrative section */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-transparent opacity-80" />
      </div>
    </section>
  );
}
