"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || "ontouchstart" in window) return;

    const cursor = cursorRef.current;
    const text = textRef.current;
    if (!cursor || !text) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.2;

    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Dynamic hover check
      const target = e.target as HTMLElement;
      if (target.closest(".gallery-img-container")) {
        gsap.to(cursor, { scale: 5, backgroundColor: "var(--color-ivory)", duration: 0.3, overwrite: "auto" });
        gsap.to(text, { opacity: 1, duration: 0.3, overwrite: "auto" });
      } else {
        gsap.to(cursor, { scale: 1, backgroundColor: "var(--color-gold)", duration: 0.3, overwrite: "auto" });
        gsap.to(text, { opacity: 0, duration: 0.3, overwrite: "auto" });
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    const onTick = () => {
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio()); 
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      xSet(pos.x);
      ySet(pos.y);
    };

    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(onTick);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-3 h-3 bg-gold rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference hidden md:flex"
    >
      <span ref={textRef} className="opacity-0 text-ink font-body text-[2px] uppercase tracking-widest font-bold">
        View
      </span>
    </div>
  );
}
