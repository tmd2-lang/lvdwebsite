"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Narrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!textRef.current) return;
    
    const elements = textRef.current.children;
    
    const ctx = gsap.context(() => {
      gsap.from(elements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%", 
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-ecru text-ink py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
        
        {/* Left Column: Heading */}
        <div className="md:col-span-5 flex flex-col justify-start">
          <h2 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-6 md:mb-12">
            A Sweeping Curtsy from Lady Victoria
          </h2>
          <h3 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight max-w-[15ch]">
            Statement Event Floral Designs <span className="italic text-gold">&</span> More
          </h3>
        </div>

        {/* Center Gap */}
        <div className="md:col-span-1 hidden md:block" />

        {/* Right Column: Explanatory Copy */}
        <div ref={textRef} className="md:col-span-6 font-body text-base md:text-lg leading-[1.8] text-ink/80 flex flex-col gap-8 justify-end pt-4 md:pt-16">
          <p>
            We are deeply passionate about flowers and their incredible ability to transform any space and evoke powerful emotions. We truly appreciate clients who share our excitement for this beautiful transformation.
          </p>
          <p>
            Event, production, floral design, and rentals… Lady Victoria Designs is much more. We’re a full-service event design and production company giving clarity to the biggest visions, transforming spaces into stunning oases that create unforgettable experiences.
          </p>
          <p>
            We live and breathe events in every way. From luxury weddings, corporate events, and private gatherings to intimate floral gifting, we build trust through a blend of creativity and technical expertise to bring your ideal event to life.
          </p>
        </div>

      </div>
    </section>
  );
}
