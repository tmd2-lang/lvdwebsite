"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "@/components/Magnetic";

export default function CollapsingHero() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const utilityTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Mathematical translation:
    // Top block shrinks from 45vh to 12vh over exactly 33vh of scroll distance.
    const shrinkAmountVH = 33; 

    const ctx = gsap.context(() => {
      // 1. Shrink the curtain precisely 1:1 with scroll
      gsap.to(curtainRef.current, {
        height: "12vh",
        ease: "none",
        scrollTrigger: {
          trigger: spacerRef.current,
          start: "top top",
          end: `+=${window.innerHeight * (shrinkAmountVH / 100)}`,
          scrub: true,
        }
      });

      // 2. Logo stays permanently in the header (no animation needed)
      // Flexbox automatically keeps it vertically centered as the container shrinks.

      // 3. Fade out utility text to prevent overlap on short screens
      // We fade this out very quickly (over the first 10vh of scroll) so it's gone before the container gets too small.
      gsap.fromTo(utilityTextRef.current, 
        { opacity: 1 },
        {
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: spacerRef.current,
            start: "top top",
            end: `+=${window.innerHeight * 0.1}`,
            scrub: true,
          }
        }
      );
      
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
    <>
      {/* The Fixed Curtain */}
      <div 
        ref={curtainRef} 
        className="fixed top-0 left-0 w-full h-[45vh] bg-ivory z-30 flex flex-col items-center justify-center overflow-hidden border-b border-ink/10 will-change-[height]"
      >
        {/* Top Navbar items */}
        <div className="absolute top-6 left-6 md:left-12 flex gap-8 font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink z-50">
           <Magnetic><button className="hover:text-gold transition-colors">Menu</button></Magnetic>
        </div>
        <div className="absolute top-6 right-6 md:right-12 flex gap-8 font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink z-50">
           <Magnetic><button className="hover:text-gold transition-colors border-b border-transparent hover:border-gold">Inquire</button></Magnetic>
        </div>
        
        {/* The persistent header utility text anchored to the bottom */}
        <div ref={utilityTextRef} className="w-full h-full absolute inset-0 pointer-events-none">
          <div className="absolute bottom-6 left-6 md:left-12 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink max-w-[20ch]">
            Luxury Wedding Design
          </div>
          <div className="absolute bottom-6 right-6 md:right-12 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink text-right max-w-[20ch]">
            Washington, DC & <br/> Beyond
          </div>
        </div>
      </div>

      {/* The Spacer to allow native scrolling without jitter (and hold the Logo) */}
      <div ref={spacerRef} className="w-full h-[45vh] relative z-40 flex flex-col items-center justify-center pointer-events-none">
        <h1 ref={logoRef} className="font-display text-[7.5vw] leading-none text-ink tracking-tighter flex items-center pointer-events-auto">
          LADY <span className="italic ml-[1.5vw] mr-[1.5vw] font-normal tracking-normal text-[7.5vw]">Victoria</span> DESIGNS
        </h1>
      </div>

      {/* The Hero Imagery (Slideshow) */}
      <section className="relative w-full h-[88vh] bg-ecru z-10 overflow-hidden">
        {heroImages.map((src, i) => (
          <div key={i} className="hero-slide absolute inset-0 w-full h-full z-0">
            <img 
              src={src} 
              alt={`Lady Victoria Hero ${i}`} 
              className="w-full h-full object-cover scale-[1.05]"
            />
          </div>
        ))}
      </section>
    </>
  );
}
