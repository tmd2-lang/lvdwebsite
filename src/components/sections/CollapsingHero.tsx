"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "@/components/Magnetic";

export default function CollapsingHero() {


  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Removed unused GSAP variables
    const ctx = gsap.context(() => {
      // We only need the slideshow context now, since we removed the pinning logic
    });

    // Slideshow Animation Context
    const slideCtx = gsap.context(() => {
      const slides = gsap.utils.toArray(".hero-slide") as HTMLElement[];
      if (slides.length === 0) return;

      let currentIndex = 0;

      // Ensure first slide is visible and others are clipped completely
      gsap.set(slides, { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" });
      gsap.set(slides[0], { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", zIndex: 1 });

      const nextSlide = () => {
        const current = slides[currentIndex];
        currentIndex = (currentIndex + 1) % slides.length;
        const next = slides[currentIndex];

        // Prepare the next slide to wipe over the current one
        gsap.set(next, { zIndex: 2, clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" });
        gsap.set(current, { zIndex: 1 }); // Push current to background

        // Execute the wipe
        gsap.to(next, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "power4.inOut"
        });
      };

      const interval = setInterval(nextSlide, 10000); // 10 seconds
      return () => clearInterval(interval);
    });

    return () => {
      ctx.revert();
      slideCtx.revert();
    };
  }, []);

  const heroImages = [
    "/hero/TFR54012_websize.jpg",
    "/hero/3042192127745071772.JPG",
    "/hero/6203022671217922801_edited.jpg"
  ];

  return (
    <div className="w-full flex flex-col relative">
      {/* The Static Logo Header */}
      <div className="w-full h-[40vh] md:h-[45vh] bg-ivory z-30 flex flex-col items-center justify-center relative border-b border-ink/10 px-4">
        <h1 className="font-display text-[clamp(1.85rem,7vw,7.5vw)] leading-none text-ink tracking-tighter flex items-center justify-center text-center">
          LADY <span className="italic ml-[1.5vw] mr-[1.5vw] font-normal tracking-normal text-[clamp(1.85rem,7vw,7.5vw)]">Victoria</span> DESIGNS
        </h1>
        
        {/* Utility text anchored to bottom */}
        <div className="w-full h-full absolute inset-0 pointer-events-none">
          <div className="absolute bottom-6 left-6 md:left-12 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink max-w-[20ch]">
            Luxury Wedding Design
          </div>
          <div className="absolute bottom-6 right-6 md:right-12 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink text-right max-w-[20ch]">
            Washington, DC & <br/> Beyond
          </div>
        </div>
      </div>

      {/* The Hero Imagery (Slideshow) */}
      <section className="relative w-full h-[88vh] bg-ecru z-10 overflow-hidden">
        {heroImages.map((src, i) => (
          <div key={i} className="hero-slide absolute inset-0 w-full h-full z-0">
            <img 
              src={src} 
              alt={`Lady Victoria Designs Hero ${i}`} 
              className="w-full h-full object-cover scale-[1.15]"
            />
          </div>
        ))}
      </section>
    </div>
  );
}
