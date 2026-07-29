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
          end: () => `+=${window.innerHeight * 1.2}`, // Shorter pin so it releases faster!
          pin: true,
          pinSpacing: true, // Automatically pushes the paragraphs down!
          scrub: 1, // Add a tiny bit of smoothing to the scrub
        }
      });

      // Crash Animation
      tl.fromTo([titleLeftRef.current, titleRightRef.current], 
        { 
          x: (i) => i === 0 ? "-30vw" : "30vw", 
          opacity: 0 
        },
        {
          x: 0,
          opacity: 1,
          ease: "power2.out", // Eases into the center gracefully
        }
      );

      // 2. Paragraphs Fade In (Scrubbed to scroll position)
      const paragraphs = copyWrapperRef.current?.querySelectorAll("p");
      if (paragraphs) {
        paragraphs.forEach((p) => {
          gsap.fromTo(p, 
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: p,
                start: "top 90%",
                end: "top 60%",
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
      {/* We make this exactly h-screen so it completely hides the video behind it before pinning! */}
      <div ref={titleWrapperRef} className="w-full h-screen flex items-center justify-center z-0">
        <h2 className="font-display text-[clamp(2.5rem,6vw,7rem)] leading-[0.9] tracking-tight flex flex-col items-center w-full uppercase">
          <span ref={titleLeftRef} className="block text-left w-full md:w-auto md:-ml-[15vw] will-change-transform">
            A Sweeping Curtsy
          </span>
          <span ref={titleRightRef} className="block text-right w-full md:w-auto md:ml-[15vw] italic text-gold will-change-transform">
            From Lady Victoria
          </span>
        </h2>
      </div>

      {/* 2. The Paragraphs (Normal Document Flow) */}
      {/* Because pinSpacing: true is used above, these automatically wait for the animation to finish before scrolling into view! */}
      <div ref={copyWrapperRef} className="relative z-10 w-full flex justify-center pt-[10vh] pb-[20vh]">
        <div className="max-w-[700px] text-center font-body text-base md:text-lg lg:text-xl leading-[1.8] text-ivory/80 flex flex-col gap-[25vh] px-6">
          <p className="will-change-transform">
            We are deeply passionate about flowers and their incredible ability to transform any space and evoke powerful emotions. We truly appreciate clients who share our excitement for this beautiful transformation.
          </p>
          <p className="will-change-transform">
            Event, production, floral design, and rentals… Lady Victoria Designs is much more. We’re a full-service event design and production company giving clarity to the biggest visions, transforming spaces into stunning oases that create unforgettable experiences.
          </p>
          <p className="will-change-transform">
            We live and breathe events in every way. From luxury weddings, corporate events, and private gatherings to intimate floral gifting, we build trust through a blend of creativity and technical expertise to bring your ideal event to life.
          </p>
        </div>
      </div>

    </section>
  );
}
