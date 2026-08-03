"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Narrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const copyWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const ctx = gsap.context(() => {
      
      // 1. TIMELINE FOR PIN & CRASH
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: titleWrapperRef.current,
          start: "top top", // Pin ONLY when it completely covers the viewport!
          end: () => `+=${window.innerHeight * 0.6}`, // Drastically shorter pin to reduce empty space
          pin: true,
          pinSpacing: true, // Automatically pushes the paragraphs down!
          scrub: 1, // Add a tiny bit of smoothing to the scrub
        }
      });

      // Responsive Crash Animation
      const isMobile = window.innerWidth < 768;
      tl.fromTo(titleLeftRef.current, 
        { x: isMobile ? -20 : "-20vw", opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out" }
      );

      tl.fromTo(titleRightRef.current, 
        { x: isMobile ? 20 : "20vw", opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out" },
        "<" // run simultaneously
      );

      // 2. Sequential Paragraph Spotlight Scroll
      const paragraphs = copyWrapperRef.current?.querySelectorAll(".narrative-p");
      if (paragraphs) {
        paragraphs.forEach((p) => {
          gsap.fromTo(p, 
            { opacity: 0.2, y: 30, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: p,
                start: "top 75%",
                end: "top 45%",
                scrub: true,
              }
            }
          );

          // Softly dim when scrolling past
          gsap.to(p, {
            opacity: 0.3,
            ease: "power1.in",
            scrollTrigger: {
              trigger: p,
              start: "bottom 45%",
              end: "bottom 15%",
              scrub: true,
            }
          });
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full relative bg-ink text-ivory z-10 overflow-hidden">
      
      {/* 1. The Title (Pinned by GSAP) */}
      <div ref={titleWrapperRef} className="w-full h-screen flex items-center justify-center px-6 md:px-12 z-0">
        <h2 className="font-display text-[clamp(2rem,5vw,6.5rem)] leading-[1.05] md:leading-[0.95] tracking-tight flex flex-col items-center w-full max-w-5xl mx-auto uppercase">
          <span ref={titleLeftRef} className="block text-left w-full md:w-auto md:-ml-[10vw] will-change-transform">
            A Sweeping Curtsy
          </span>
          <span ref={titleRightRef} className="block text-right w-full md:w-auto md:ml-[10vw] italic text-gold will-change-transform mt-2 md:mt-0">
            From Lady Victoria Designs
          </span>
        </h2>
      </div>

      {/* 2. The Paragraphs (Sequential Editorial Reveal) */}
      <div ref={copyWrapperRef} className="relative z-10 w-full flex flex-col items-center pb-[25vh] px-6 md:px-12">
        <div className="w-full max-w-3xl mx-auto flex flex-col text-center font-body text-xl sm:text-2xl md:text-3xl lg:text-[32px] leading-[1.75] md:leading-[1.85] text-ivory gap-[22vh] md:gap-[28vh]">
          
          <div className="narrative-p will-change-transform flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold mb-6">THE ESSENCE</span>
            <p className="text-ivory/95">
              Flowers change a room before anyone says a word. That’s the part we’re obsessed with: the moment someone walks in and stops.
            </p>
          </div>

          <div className="narrative-p will-change-transform flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold mb-6">THE SCOPE</span>
            <p className="text-ivory/95">
              Lady Victoria Designs is a full-service event design and production company. Weddings, corporate, private gatherings, and the quiet floral gifts in between. We give shape to visions that are too big to describe.
            </p>
          </div>

          <div className="narrative-p will-change-transform flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold mb-6">THE CRAFT</span>
            <p className="text-ivory/95">
              Creativity is the easy part. What earns trust is the technical work behind it: the rigging, the load-in, the timing, the thousand things that have to hold while nobody notices them. Beauty that doesn’t survive contact with a real venue isn’t design, it’s a mood board.
            </p>
          </div>

        </div>
      </div>

    </section>
  );
}
