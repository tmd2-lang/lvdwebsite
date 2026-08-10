"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";
import { media } from "@/lib/media-slots";

const MENU_ITEMS = [
  {
    id: "home",
    number: "01",
    label: "Home",
    subtitle: "The Masterpiece Experience",
    path: "/",
    image: media["home.hero.1"],
    caption: "The Art of the Occasion · Washington, DC",
  },
  {
    id: "about",
    number: "02",
    label: "About",
    subtitle: "Founder Irene & The Studio Ethos",
    path: "/about",
    image: media["about.founder"],
    caption: "Creative Director Irene · Lady Victoria Designs",
  },
  {
    id: "services",
    number: "03",
    label: "Services",
    subtitle: "Floral Artistry & Spatial Production",
    path: "/services",
    image: media["services.hero"],
    caption: "Turnkey Floral Production & Ceiling Artistry",
  },
  {
    id: "gallery",
    number: "04",
    label: "Gallery",
    subtitle: "Curated Celebrations & Ceremonies",
    path: "/gallery",
    image: media["home.work.1"],
    caption: "Meridian House & Private Estate Archives",
  },
  {
    id: "testimonials",
    number: "05",
    label: "Kind Words",
    subtitle: "54+ Verified Letters & Reviews",
    path: "/testimonials",
    image: media["home.testimonials"],
    caption: "5.0 ★ Rating · Client Letters & Gratitude",
  },
  {
    id: "quiz",
    number: "06",
    label: "Style Quiz",
    subtitle: "Discover Your Floral Aesthetic",
    path: "/quiz",
    image: media["about.craft.2"],
    caption: "Interactive Aesthetic Consultation",
  },
  {
    id: "inquire",
    number: "07",
    label: "Inquire",
    subtitle: "Begin Your Bespoke Consultation",
    path: "/inquire",
    image: media["inquire.hero"],
    caption: "Limited Dates Accepted Each Season",
  },
];

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState(MENU_ITEMS[0]);
  const pathname = usePathname();
  const hideGlobalHeader = pathname === "/reserve" || pathname === "/consultation";

  // Pages with ivory/white backgrounds where mix-blend causes contrast issues
  const isLightPage = pathname === "/inquire" || pathname === "/quiz" || pathname === "/testimonials";

  // Update active preview image based on route
  useEffect(() => {
    const current = MENU_ITEMS.find((item) => item.path === pathname);
    if (current) setActiveItem(current);
  }, [pathname]);

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
      document.body.style.overflow = "hidden";
      
      gsap.set(menu, { visibility: "visible" });
      gsap.to(menu, { y: 0, duration: 0.65, ease: "power4.inOut" });
      
      gsap.fromTo(
        ".menu-nav-link", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".menu-preview-panel", 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.3 }
      );
    } else {
      document.body.style.overflow = "";
      
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

  // Accessibility: Escape key & focus trap
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const menuLinks = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      );
      const first = menuLinks[0];
      const last = menuLinks[menuLinks.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  if (hideGlobalHeader) return null;

  const getHeaderStyle = () => {
    if (isMenuOpen) {
      return "bg-transparent text-ivory opacity-0 pointer-events-none"; // Handled by inner menu header
    }
    if (isLightPage) {
      return "bg-ivory/90 backdrop-blur-[12px] border-b border-ink/10 text-ink !mix-blend-normal py-4 shadow-xs";
    }
    if (isScrolled) {
      return "bg-ink/85 backdrop-blur-[12px] !mix-blend-normal text-ivory py-4 border-b border-ivory/10 shadow-lg";
    }
    return "bg-transparent mix-blend-difference text-ivory py-6";
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP GLOBAL BAR                                            */}
      {/* ============================================================ */}
      <header 
        ref={headerRef} 
        className={`fixed top-0 left-0 w-full z-40 px-5 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 gap-4 items-center pointer-events-none transition-all duration-300 transform-gpu will-change-transform ${getHeaderStyle()}`}
      >
        {/* Left: Brand Logo */}
        <div className="min-w-0 justify-self-start font-display italic text-base sm:text-lg md:text-xl pointer-events-auto cursor-pointer hover:opacity-75 transition-opacity whitespace-nowrap">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            Lady Victoria Designs
          </Link>
        </div>
        
        {/* Center: 4 Curated Editorial Links */}
        <nav 
          aria-label="Primary Navigation"
          className="justify-self-center hidden md:flex items-center gap-8 lg:gap-10 font-body text-[10px] uppercase tracking-[0.22em] pointer-events-auto"
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

        {/* Right: Menu Trigger + Inquire CTA */}
        <div className="justify-self-end flex gap-6 sm:gap-8 items-center font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] pointer-events-auto">
          {/* Super Menu Trigger */}
          <Magnetic>
            <button 
              type="button"
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(true)}
              aria-expanded={isMenuOpen}
              aria-controls="super-navigation"
              className="hover:text-gold transition-colors py-1 cursor-pointer flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold group-hover:scale-125 transition-transform" />
              <span>Menu</span>
            </button>
          </Magnetic>

          {/* Inquire CTA */}
          <Magnetic>
            <Link 
              href="/inquire" 
              onClick={() => setIsMenuOpen(false)}
              className={`hover:opacity-75 transition-all border-b pb-0.5 font-medium ${
                isLightPage ? "border-ink text-ink" : "border-ivory text-ivory"
              }`}
            >
              Inquire
            </Link>
          </Magnetic>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. WORLD-CLASS EDITORIAL SUPER MENU OVERLAY                  */}
      {/* ============================================================ */}
      <div 
        id="super-navigation"
        ref={menuRef}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        data-lenis-prevent
        className="fixed inset-0 w-full h-[100dvh] bg-ink text-ivory z-50 flex flex-col justify-between overflow-y-auto overscroll-contain"
        style={{ transform: "translateY(-100%)", visibility: "hidden", pointerEvents: isMenuOpen ? "auto" : "none" }}
      >
        {/* Menu Top Header Bar */}
        <div className="w-full px-6 sm:px-10 md:px-16 py-6 border-b border-ivory/10 flex items-center justify-between shrink-0">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="font-display italic text-lg sm:text-xl text-ivory hover:text-gold transition-colors"
          >
            Lady Victoria Designs
          </Link>

          <span className="hidden md:block font-body text-[9px] uppercase tracking-[0.3em] text-ivory/40">
            Studio Index · Washington, D.C. &amp; Beyond
          </span>

          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
            className="group flex items-center gap-2.5 font-body text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-ivory/80 hover:text-gold transition-colors cursor-pointer py-1.5 px-3 border border-ivory/20 hover:border-gold"
          >
            <span>Close</span>
            <span className="text-gold text-xs group-hover:rotate-90 transition-transform duration-300">✕</span>
          </button>
        </div>

        {/* Center Split Screen: Navigation + Live Visual Preview */}
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-10 md:px-16 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center my-auto">
          
          {/* Left Column (Links) */}
          <nav 
            aria-label="Full Menu"
            className="lg:col-span-7 flex flex-col gap-2 sm:gap-3"
          >
            {MENU_ITEMS.map((item) => {
              const isCurrent = pathname === item.path;
              const isHovered = activeItem.id === item.id;

              return (
                <div 
                  key={item.id} 
                  className="menu-nav-link group overflow-hidden"
                  onMouseEnter={() => setActiveItem(item)}
                >
                  <Link
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-baseline gap-4 sm:gap-6 py-1.5 transition-all duration-300"
                  >
                    {/* Index Number */}
                    <span className="font-body text-[10px] sm:text-xs tracking-[0.2em] text-ivory/35 group-hover:text-gold transition-colors font-light">
                      {item.number}
                    </span>

                    {/* Main Title */}
                    <span 
                      className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight transition-all duration-300 ${
                        isCurrent 
                          ? "text-gold italic" 
                          : isHovered 
                            ? "text-ivory group-hover:text-gold group-hover:italic group-hover:translate-x-2" 
                            : "text-ivory/85"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Desktop Subtitle Pill on Hover */}
                    <span className="hidden xl:inline-block font-body text-[9px] uppercase tracking-[0.25em] text-ivory/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                      — {item.subtitle}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right Column (Dynamic Editorial Artwork Preview & Studio Credentials) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-6 menu-preview-panel">
            
            {/* Artwork Frame */}
            <div className="relative w-full aspect-[4/3] rounded-xs overflow-hidden border border-ivory/20 bg-ivory/5 shadow-2xl">
              <Image
                src={activeItem.image}
                alt={activeItem.caption}
                fill
                sizes="(max-width: 1200px) 40vw, 35vw"
                className="object-cover transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              
              {/* Image Caption Overlay */}
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-ivory">
                <span className="font-display italic text-sm text-ivory/90">
                  {activeItem.caption}
                </span>
                <span className="font-body text-[9px] uppercase tracking-widest text-gold font-semibold">
                  {activeItem.number} / 07
                </span>
              </div>
            </div>

            {/* Atelier Details Card */}
            <div className="p-5 border border-ivory/10 bg-ivory/[0.02] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold font-bold">
                  STUDIO ATELIER
                </span>
                <span className="font-body text-[10px] text-ivory/50">
                  ★★★★★ 5.0 · 54 Reviews
                </span>
              </div>
              <p className="font-body text-xs text-ivory/70 leading-relaxed font-light">
                Luxury wedding floral artistry, bespoke ceiling installations, and turnkey production in Washington D.C., Maryland, Virginia &amp; Destinations.
              </p>
              <div className="pt-2 border-t border-ivory/10 flex items-center justify-between text-[10px] font-body text-ivory/50 uppercase tracking-widest">
                <span>By Appointment</span>
                <a 
                  href="mailto:hello@ladyvictoriadesigns.com"
                  className="text-ivory hover:text-gold transition-colors lowercase tracking-normal"
                >
                  hello@ladyvictoriadesigns.com
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Menu Bottom Footer Bar */}
        <div className="w-full px-6 sm:px-10 md:px-16 py-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-body uppercase tracking-[0.2em] text-ivory/50 shrink-0">
          <p>© {new Date().getFullYear()} Lady Victoria Designs · All Rights Reserved</p>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              Instagram
            </a>
            <a href="https://www.pinterest.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              Pinterest
            </a>
            <a href="https://www.theknot.com/marketplace/lady-victoria-design-brandywine-md-2036012" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              The Knot
            </a>
            <a href="https://www.weddingwire.com/biz/lady-victoria-design-brandywine/f0e91afe3a54e207.html" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              WeddingWire
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
