"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { media } from "@/lib/media-slots";

export default function CollapsingHero() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
      slideCtx.revert();
    };
  }, []);

  const heroImages = [
    media["home.hero.1"],
    media["home.hero.2"],
    media["home.hero.3"],
    media["home.hero.4"],
    media["home.hero.5"]
  ];

  return (
    <section className="relative w-full min-h-[100svh] bg-ink z-10 overflow-hidden flex flex-col justify-end pb-12 sm:pb-16 px-6 sm:px-10 md:px-12">
      {/* The Hero Imagery (Slideshow) */}
      <div className="absolute inset-0 w-full h-full z-0">
        {heroImages.map((src, i) => (
          <div key={i} className="hero-slide absolute inset-0 w-full h-full z-0">
            <Image
              src={src} 
              alt={`Lady Victoria Designs Hero ${i}`} 
              fill
              sizes="100vw"
              quality={100}
              priority={i === 0}
              unoptimized={true}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Gradients to match the reserve page */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/62 via-ink/22 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/48 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent z-10 pointer-events-none" />

      {/* Bottom Left Typography */}
      <div className="relative z-20 w-full max-w-5xl flex flex-col items-start justify-end pointer-events-none gap-4">
        <h1 className="w-full max-w-full min-w-0 font-display text-[clamp(2.75rem,5vw,5.5rem)] leading-[0.9] text-ivory tracking-tighter flex flex-col sm:flex-row items-start justify-start gap-y-2 sm:gap-y-0 sm:gap-x-4">
          <span>LADY</span>
          <span className="italic font-normal tracking-normal text-[clamp(2.75rem,5vw,5.5rem)]">
            Victoria
          </span>
          <span>DESIGNS</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ivory/90 mt-2 sm:mt-0">
          <span>Luxury Wedding Design</span>
          <span className="hidden sm:block w-[1px] h-3 bg-ivory/40 self-center"></span>
          <span>Washington, DC & Beyond</span>
        </div>
      </div>
    </section>
  );
}
