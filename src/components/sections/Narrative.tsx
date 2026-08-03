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
      const xOffset = isMobile ? "0px" : "20vw";

      tl.fromTo(titleLeftRef.current, 
        { x: isMobile ? -20 : "-20vw", opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out" }
      );

      tl.fromTo(titleRightRef.current, 
        { x: isMobile ? 20 : "20vw", opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out" },
        "<" // run simultaneously
      );

      // 2. Paragraphs Fade In (Scrubbed to scroll position)
      const paragraphs = copyWrapperRef.current?.querySelectorAll("p");
      if (paragraphs) {
        paragraphs.forEach((p) => {
          gsap.fromTo(p, 
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              ease: "power1.out",
              scrollTrigger: {
                trigger: p,
                start: "top 95%",
                end: "top 55%",
                scrub: true,
              }
            }
          );
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
            From Lady Victoria
          </span>
        </h2>
      </div>

      {/* 2. The Paragraphs (Normal Document Flow) */}
      {/* Because pinSpacing: true is used above, these automatically wait for the animation to finish before scrolling into view! */}
      <div ref={copyWrapperRef} className="relative z-10 w-full flex justify-center -mt-[15vh] pb-[20vh] px-6 md:px-12">
        <div className="w-full max-w-4xl mx-auto flex flex-col text-center font-body text-xl md:text-2xl lg:text-[32px] leading-relaxed text-ivory/80 gap-[6vh]">
          <p className="will-change-transform">
            Flowers change a room before anyone says a word. That's the part we're obsessed with: the moment someone walks in and stops.
          </p>
          <p className="will-change-transform">
            Lady Victoria Designs is a full-service event design and production company. Weddings, corporate, private gatherings, and the quiet floral gifts in between. We give shape to visions that are too big to describe.
          </p>
          <p className="will-change-transform">
            Creativity is the easy part. What earns trust is the technical work behind it: the rigging, the load-in, the timing, the thousand things that have to hold while nobody notices them. Beauty that doesn't survive contact with a real venue isn't design, it's a mood board.
          </p>
        </div>
      </div>

    </section>
  );
}
