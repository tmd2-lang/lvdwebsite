"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let lastScroll = 0;
    const header = headerRef.current;
    
    if (!header) return;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > 50 && currentScroll > lastScroll) {
        // Scrolling down -> hide header
        gsap.to(header, { yPercent: -100, duration: 0.4, ease: "power2.out" });
      } else {
        // Scrolling up -> show header
        gsap.to(header, { yPercent: 0, duration: 0.4, ease: "power2.out" });
      }
      
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      ref={headerRef} 
      className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 flex justify-between items-center mix-blend-difference text-ivory pointer-events-none transition-transform"
    >
      <div className="font-display italic text-xl md:text-2xl pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity">
        Lady Victoria
      </div>
      
      <div className="flex gap-8 items-center font-body text-[10px] md:text-xs uppercase tracking-[0.2em] pointer-events-auto">
        <Magnetic>
          <button className="hover:opacity-70 transition-opacity">Menu</button>
        </Magnetic>
        <Magnetic>
          <button className="hidden md:block hover:opacity-70 transition-opacity border-b border-ivory pb-1">Inquire</button>
        </Magnetic>
      </div>
    </header>
  );
}
