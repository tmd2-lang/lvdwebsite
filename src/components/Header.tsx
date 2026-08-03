"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll styling logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Super Menu GSAP Animation
  useEffect(() => {
    if (!menuRef.current) return;
    
    if (isMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      // Animate menu down
      gsap.to(menuRef.current, { y: 0, duration: 0.8, ease: "power4.inOut" });
      // Stagger animate links up
      gsap.fromTo(
        ".menu-link", 
        { y: 100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power4.out", delay: 0.3 }
      );
    } else {
      // Unlock body scroll
      document.body.style.overflow = "auto";
      
      // Animate menu up
      gsap.to(menuRef.current, { y: "-100%", duration: 0.8, ease: "power4.inOut" });
    }
  }, [isMenuOpen]);

  return (
    <>
      <header 
        ref={headerRef} 
        className={`fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 grid grid-cols-2 md:grid-cols-3 items-center mix-blend-difference text-ivory pointer-events-none transition-all duration-300 ${
          isScrolled && !isMenuOpen ? "bg-ink/80 backdrop-blur-[12px] !mix-blend-normal py-4" : "bg-transparent"
        }`}
      >
        <div className="justify-self-start font-display italic text-lg md:text-xl pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            Lady Victoria Designs
          </Link>
        </div>
        
        <div className={`justify-self-center hidden md:flex gap-12 font-body text-[10px] uppercase tracking-[0.2em] pointer-events-auto transition-opacity duration-300 ${
          isMenuOpen ? "opacity-0 invisible" : "opacity-100 visible"
        }`}>
          <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
          <Link href="/about" className="hover:opacity-70 transition-opacity">About</Link>
          <Link href="/services" className="hover:opacity-70 transition-opacity">Services</Link>
          <Link href="/gallery" className="hover:opacity-70 transition-opacity">Gallery</Link>
        </div>

        <div className="justify-self-end flex gap-8 items-center font-body text-[10px] md:text-xs uppercase tracking-[0.2em] pointer-events-auto">
          <Magnetic>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden hover:opacity-70 transition-opacity w-[50px] text-right"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </Magnetic>
          <Magnetic>
            <Link 
              href="/inquire" 
              onClick={() => setIsMenuOpen(false)}
              className="hidden md:block hover:opacity-70 transition-opacity border-b border-ivory pb-1"
            >
              Inquire
            </Link>
          </Magnetic>
        </div>
      </header>

      {/* FULL SCREEN SUPER MENU */}
      <div 
        ref={menuRef}
        className="fixed inset-0 w-full h-screen bg-ink text-ivory z-[35] flex flex-col justify-center px-6 md:px-24 pointer-events-auto"
        style={{ transform: "translateY(-100%)" }}
      >
        <div className="flex flex-col gap-4">
          {[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: "Services", path: "/services" },
            { name: "Gallery", path: "/gallery" },
            { name: "Inquire", path: "/inquire" }
          ].map((link, i) => (
            <div key={i} className="overflow-hidden py-1">
              <Link 
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="menu-link block font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl hover:text-gold hover:italic transition-all duration-300 w-fit"
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-12 left-6 md:left-24 font-body text-[10px] uppercase tracking-widest text-ivory/50 flex flex-col md:flex-row gap-4 md:gap-12">
           <div>Washington, D.C.</div>
           <div>hello@ladyvictoriadesigns.com</div>
        </div>
      </div>
    </>
  );
}
