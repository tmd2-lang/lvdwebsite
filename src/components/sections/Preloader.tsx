"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      if (containerRef.current) containerRef.current.style.display = "none";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (containerRef.current) containerRef.current.style.display = "none";
        }
      });

      // Reset states
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(textRef.current, { opacity: 0, y: 10 });

      // Animation sequence
      tl.to(textRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
        .to(lineRef.current, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, "-=0.2")
        .to(containerRef.current, { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "+=0.2");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory text-ink">
      <div ref={textRef} className="font-display italic text-2xl mb-4">Lady Victoria Designs</div>
      <div className="w-48 h-[1px] bg-ink/10 relative overflow-hidden">
        <div ref={lineRef} className="absolute top-0 left-0 h-full w-full bg-gold"></div>
      </div>
    </div>
  );
}
