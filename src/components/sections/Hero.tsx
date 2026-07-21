"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const textTopRef = useRef<HTMLSpanElement>(null);
  const textMidRef = useRef<HTMLSpanElement>(null);
  const textBotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 12vh", // Pin exactly below the 12vh collapsed header
          end: "+=100%",
          scrub: 1,
          pin: true,
        }
      });

      // The slit is fully closed initially (0%)
      gsap.set(imageRef.current, {
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
      });

      // Step 1: Doors blow open violently
      tl.to(imageRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "power4.inOut",
      }, 0);

      // Step 2: The text gets ripped apart horizontally
      tl.to(textTopRef.current, {
        x: "-50vw",
        opacity: 0,
        ease: "power4.inOut",
      }, 0);

      tl.to(textBotRef.current, {
        x: "50vw",
        opacity: 0,
        ease: "power4.inOut",
      }, 0);

      tl.to(textMidRef.current, {
        scale: 1.5,
        opacity: 0,
        ease: "power4.inOut",
      }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[88vh] w-full bg-ivory overflow-hidden">
      {/* Background Image Container (The Transformation) */}
      <div 
        ref={imageRef}
        className="absolute inset-0 z-0 w-full h-full will-change-transform bg-ecru"
      >
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Ballroom Setup" 
          className="w-full h-full object-cover scale-[1.05]"
        />
        {/* Dark Overlay inside the clipped container to darken the image */}
        <div className="absolute inset-0 z-10 w-full h-full bg-ink/40" />
      </div>

      {/* Foreground Content */}
      <div 
        className="absolute inset-0 z-20 w-full h-full flex flex-col justify-center items-center px-6 md:px-12 pointer-events-none mix-blend-difference text-ivory"
      >
        <h2 className="font-display text-[7vw] leading-[0.8] flex flex-col items-center justify-center w-full">
          <span ref={textTopRef} className="block -ml-[25vw] tracking-tighter will-change-transform italic">Your wedding</span>
          <span ref={textMidRef} className="block text-gold tracking-tight will-change-transform z-10">isn't an event.</span>
          <span ref={textBotRef} className="block ml-[25vw] tracking-tighter will-change-transform italic">It's a masterpiece.</span>
        </h2>
      </div>
    </section>
  );
}
