"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

export default function ParallaxDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Smooth GSAP Parallax Effect
    // As the user scrolls past the container, the image moves at a different speed
    gsap.fromTo(imageRef.current, 
      { yPercent: -15 },
      {
        yPercent: 15, 
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      }
    );
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
        <Image
          src="/gallery/white-green-botanicals/white-green-botanicals-04.jpeg"
          alt="Luxury Wedding Design - Lady Victoria Designs"
          fill
          sizes="100vw"
          className="w-full h-full object-cover"
        />
        {/* Subtle vignette/overlay to blend beautifully out of the black Narrative section */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-transparent opacity-80" />
      </div>
    </section>
  );
}
