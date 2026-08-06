"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const hideGlobalHeader = pathname === "/reserve" || pathname === "/consultation";

  // Pages with ivory/white backgrounds where mix-blend causes contrast issues
  const isLightPage = pathname === "/inquire" || pathname === "/quiz" || pathname === "/testimonials";

  // Scroll styling logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Super Menu GSAP Animation
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    gsap.killTweensOf(menu);
    
    if (isMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      // Ensure visible before animating in
      gsap.set(menu, { visibility: "visible" });
      gsap.to(menu, { y: 0, duration: 0.65, ease: "power4.inOut" });
      // Stagger animate links up
      gsap.fromTo(
        ".menu-link", 
        { y: 60, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power3.out", delay: 0.2 }
      );
    } else {
      // Unlock body scroll
      document.body.style.overflow = "";
      
      // Animate menu up and hide visibility on complete
      gsap.to(menu, {
        y: "-100%",
        duration: 0.55, 
        ease: "power4.inOut",
        onComplete: () => {
          menu.style.visibility = "hidden";
        }
      });
    }

    return () => {
      document.body.style.overflow = "";
      gsap.killTweensOf(menu);
    };
  }, [isMenuOpen]);

  // Accessibility: Escape key and focus trap
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const menuLinks = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
      );
      const focusable = menuButtonRef.current
        ? [menuButtonRef.current, ...menuLinks]
        : menuLinks;
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    menuButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  if (hideGlobalHeader) return null;

  const getHeaderStyle = () => {
    if (isMenuOpen) {
      return "bg-transparent mix-blend-difference text-ivory";
    }
    if (isLightPage) {
      return "bg-ivory/90 backdrop-blur-[12px] border-b border-ink/10 text-ink !mix-blend-normal py-4 shadow-xs";
    }
    if (isScrolled) {
      return "bg-ink/80 backdrop-blur-[12px] !mix-blend-normal text-ivory py-4 border-b border-ivory/10 shadow-lg";
    }
    return "bg-transparent mix-blend-difference text-ivory py-6";
  };

  return (
    <>
      <header 
        ref={headerRef} 
        className={`fixed top-0 left-0 w-full z-40 px-5 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 gap-4 items-center pointer-events-none transition-all duration-300 ${getHeaderStyle()}`}
      >
        {/* LEFT: LOGO */}
        <div className="min-w-0 justify-self-start font-display italic text-base sm:text-lg md:text-xl pointer-events-auto cursor-pointer hover:opacity-75 transition-opacity whitespace-nowrap">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            Lady Victoria Designs
          </Link>
        </div>
        
        {/* CENTER: 4 EDITORIAL PRIMARY LINKS (Desktop) */}
        <nav 
          aria-label="Primary Navigation"
          className={`justify-self-center hidden md:flex items-center gap-8 lg:gap-10 font-body text-[10px] uppercase tracking-[0.22em] pointer-events-auto transition-opacity duration-300 ${
            isMenuOpen ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
          }`}
        >
          <Link 
            href="/about" 
            className={`hover:text-gold transition-colors ${pathname === "/about" ? "text-gold font-bold" : ""}`}
          >
            About
          </Link>
          <Link 
            href="/services" 
            className={`hover:text-gold transition-colors ${pathname === "/services" ? "text-gold font-bold" : ""}`}
          >
            Services
          </Link>
          <Link 
            href="/gallery" 
            className={`hover:text-gold transition-colors ${pathname === "/gallery" ? "text-gold font-bold" : ""}`}
          >
            Gallery
          </Link>
          <Link 
            href="/testimonials" 
            className={`hover:text-gold transition-colors ${pathname === "/testimonials" ? "text-gold font-bold" : ""}`}
          >
            Kind Words
          </Link>
        </nav>

        {/* RIGHT: MENU TOGGLE + INQUIRE CTA */}
        <div className="justify-self-end flex gap-6 sm:gap-8 items-center font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] pointer-events-auto">
          {/* Super Menu Trigger (Available on all screen sizes) */}
          <Magnetic>
            <button 
              type="button"
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="super-navigation"
              className="hover:text-gold transition-colors py-1 cursor-pointer flex items-center gap-1.5 focus:outline-none"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              <span>{isMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </Magnetic>

          {/* Inquire CTA */}
          <Magnetic>
            <Link 
              href="/inquire" 
              onClick={() => setIsMenuOpen(false)}
              className={`hover:opacity-75 transition-all border-b pb-0.5 font-medium ${
                isLightPage && !isMenuOpen ? "border-ink text-ink" : "border-ivory text-ivory"
              }`}
            >
              Inquire
            </Link>
          </Magnetic>
        </div>
      </header>

      {/* FULL SCREEN SUPER MENU CURTAIN */}
      <div 
        id="super-navigation"
        ref={menuRef}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        data-lenis-prevent
        className="fixed inset-0 w-full min-h-[100dvh] bg-ink text-ivory z-[35] flex flex-col justify-between px-6 sm:px-12 md:px-24 py-28 md:py-24 overflow-y-auto overscroll-contain"
        style={{ transform: "translateY(-100%)", visibility: "hidden", pointerEvents: isMenuOpen ? "auto" : "none" }}
      >
        {/* Navigation Link Stack */}
        <div className="flex flex-col gap-2 md:gap-3 my-auto max-w-5xl">
          {[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: "Services", path: "/services" },
            { name: "Gallery", path: "/gallery" },
            { name: "Kind Words", path: "/testimonials" },
            { name: "Style Quiz", path: "/quiz" },
            { name: "Inquire", path: "/inquire" }
          ].map((link, i) => (
            <div key={i} className="overflow-hidden py-0.5">
              <Link 
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`menu-link block font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl transition-all duration-300 w-fit ${
                  pathname === link.path 
                    ? "text-gold italic font-normal" 
                    : "text-ivory hover:text-gold hover:italic"
                }`}
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>
        
        {/* Bottom Studio Info Bar */}
        <div className="pt-10 border-t border-ivory/15 font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-ivory/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           <div>Washington, D.C. · Maryland · Virginia &amp; Beyond</div>
           <a 
             href="mailto:hello@ladyvictoriadesigns.com" 
             className="text-ivory hover:text-gold transition-colors lowercase tracking-normal text-sm font-sans"
           >
             hello@ladyvictoriadesigns.com
           </a>
        </div>
      </div>
    </>
  );
}
