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

  // Pages with split photo / white backgrounds where mix-blend causes contrast issues
  const isLightPage = pathname === "/inquire" || pathname === "/quiz";

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
    const menu = menuRef.current;
    if (!menu) return;

    gsap.killTweensOf(menu);
    
    if (isMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      // Ensure visible before animating in
      gsap.set(menu, { visibility: "visible" });
      gsap.to(menu, { y: 0, duration: 0.7, ease: "power4.inOut" });
      // Stagger animate links up
      gsap.fromTo(
        ".menu-link", 
        { y: 60, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.25 }
      );
    } else {
      // Unlock body scroll
      document.body.style.overflow = "";
      
      // Animate menu up and hide visibility on complete
      gsap.to(menu, {
        y: "-100%",
        duration: 0.6, 
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
      return "bg-ink/80 backdrop-blur-[12px] !mix-blend-normal text-ivory py-4";
    }
    return "bg-transparent mix-blend-difference text-ivory py-6";
  };

  return (
    <>
      <header 
        ref={headerRef} 
        className={`fixed top-0 left-0 w-full z-40 px-5 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 gap-4 items-center pointer-events-none transition-all duration-300 ${getHeaderStyle()}`}
      >
        <div className="min-w-0 justify-self-start font-display italic text-base sm:text-lg md:text-xl pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity whitespace-nowrap">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            Lady Victoria Designs
          </Link>
        </div>
        
        <div className={`justify-self-center hidden md:flex gap-10 lg:gap-12 font-body text-[10px] uppercase tracking-[0.2em] pointer-events-auto transition-opacity duration-300 ${
          isMenuOpen ? "opacity-0 invisible" : "opacity-100 visible"
        }`}>
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <Link href="/about" className="hover:text-gold transition-colors">About</Link>
          <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
          <Link href="/gallery" className="hover:text-gold transition-colors">Gallery</Link>
          <Link href="/quiz" className={`hover:text-gold transition-colors ${pathname === "/quiz" ? "text-gold font-bold" : ""}`}>Quiz</Link>
        </div>

        <div className="justify-self-end flex gap-8 items-center font-body text-[10px] md:text-xs uppercase tracking-[0.2em] pointer-events-auto">
          <Magnetic>
            <button 
              type="button"
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="md:hidden hover:opacity-70 transition-opacity min-w-11 min-h-11 text-right cursor-pointer"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </Magnetic>
          <Magnetic>
            <Link 
              href="/inquire" 
              onClick={() => setIsMenuOpen(false)}
              className={`hidden md:block hover:opacity-70 transition-opacity border-b pb-1 ${
                isLightPage && !isMenuOpen ? "border-ink text-ink" : "border-ivory text-ivory"
              }`}
            >
              Inquire
            </Link>
          </Magnetic>
        </div>
      </header>

      {/* FULL SCREEN SUPER MENU */}
      <div 
        id="mobile-navigation"
        ref={menuRef}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        data-lenis-prevent
        className="fixed inset-0 w-full min-h-[100dvh] bg-ink text-ivory z-[35] flex flex-col justify-center px-6 md:px-24 overflow-y-auto overscroll-contain"
        style={{ transform: "translateY(-100%)", visibility: "hidden", pointerEvents: isMenuOpen ? "auto" : "none" }}
      >
        <div className="flex flex-col gap-4">
          {[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: "Services", path: "/services" },
            { name: "Gallery", path: "/gallery" },
            { name: "Kind Words", path: "/testimonials" },
            { name: "Quiz", path: "/quiz" },
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
