"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  
  const textTopRef = useRef<HTMLSpanElement>(null);
  const textMidRef = useRef<HTMLSpanElement>(null);
  const textBotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${window.innerHeight * 4}`, // Total scroll distance is 400vh
          scrub: 1,
          pin: containerRef.current, // Pin the inner section
          pinSpacing: false, // The 400vh wrapper provides all the spacing needed
        }
      });

      // --- INITIAL STATES ---
      gsap.set(videoWrapperRef.current, {
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
      });
      gsap.set([textTopRef.current, textMidRef.current, textBotRef.current], {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      });

      // --- TIMELINE (Spans exactly 300vh, leaving the last 100vh for overlap) ---
      tl.to(textTopRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none", duration: 1 });
      tl.to(textMidRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none", duration: 1 });
      tl.to(textBotRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none", duration: 1.5 });
      tl.to({}, { duration: 0.5 }); // short pause

      tl.addLabel("shutter");
      tl.to(videoWrapperRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power4.inOut", duration: 2 }, "shutter");
      tl.to(textTopRef.current, { x: "-50vw", opacity: 0, ease: "power4.inOut", duration: 2 }, "shutter");
      tl.to(textBotRef.current, { x: "50vw", opacity: 0, ease: "power4.inOut", duration: 2 }, "shutter");
      tl.to(textMidRef.current, { scale: 1.5, opacity: 0, ease: "power4.inOut", duration: 2 }, "shutter");

      // Total active duration = 1 + 1 + 1.5 + 0.5 + 2 = 6.0
      // If 6.0 represents 300vh, then 100vh is 2.0 duration.
      // We add a 2.0 duration dummy tween so the timeline spans the full 400vh.
      tl.to({}, { duration: 2 }); 

    }, containerRef); // Scoped to the component

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full h-[400vh] z-0">
      <section ref={containerRef} className="relative h-screen w-full bg-ivory flex items-center justify-center overflow-hidden z-0">
        
        {/* Background Video */}
        <div ref={videoWrapperRef} className="absolute inset-0 z-10 w-full h-full will-change-transform bg-ink">
          <video src="/0720_2.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover scale-[1.05]" />
          <div className="absolute inset-0 z-10 w-full h-full bg-ink/30" />
        </div>

        {/* Foreground Text Layer */}
        <div className="absolute inset-0 z-20 w-full h-full flex flex-col justify-center items-center px-4 md:px-12 pointer-events-none mix-blend-difference">
          <h2 className="font-display text-[clamp(2rem,6vw,8rem)] leading-[1.0] md:leading-[0.85] flex flex-col items-center justify-center w-full text-ivory text-center">
            <span ref={textTopRef} className="block md:-ml-[20vw] tracking-tighter will-change-transform italic pb-1 md:pb-2">Your wedding</span>
            <span ref={textMidRef} className="block tracking-tight will-change-transform z-10 pb-1 md:pb-2">isn't an event.</span>
            <span ref={textBotRef} className="block md:ml-[20vw] tracking-tighter will-change-transform italic pb-1 md:pb-2">It's a masterpiece.</span>
          </h2>
        </div>
      </section>
    </div>
  );
}
