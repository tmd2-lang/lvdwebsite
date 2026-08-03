"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";

export default function CollapsingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      src: "/hero/6203022671217922801_edited.jpg",
      venue: "Meridian House, Washington D.C.",
      subtitle: "Architectural Florals & Full Production"
    },
    {
      src: "/hero/3042192127745071772.JPG",
      venue: "The Anderson House, Embassy Row",
      subtitle: "Bespoke Grand Installations"
    },
    {
      src: "/hero/TFR54012_websize.jpg",
      venue: "Private Country Estate, Virginia",
      subtitle: "Immersive Botanical Environments"
    }
  ];

  // Auto-advance slideshow with Ken Burns smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Entrance animation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-stagger",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] flex flex-col justify-between overflow-hidden bg-ink text-ivory z-20 select-none"
    >
      {/* 1. BACKGROUND SLIDES WITH KEN BURNS EFFECT */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {heroSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.venue}
                className={`w-full h-full object-cover transform transition-transform duration-[7000ms] ease-out ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          );
        })}
        {/* Editorial Gradients & Vignettes */}
        <div className="absolute inset-0 bg-ink/40 z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/60 z-20" />
        <div className="absolute inset-0 bg-radial-vignette opacity-60 z-20 pointer-events-none" />
      </div>

      {/* 2. TOP METADATA BAR (Under Header) */}
      <div className="relative z-30 w-full px-6 md:px-12 pt-28 md:pt-32 flex justify-between items-center text-[10px] md:text-xs uppercase tracking-[0.25em] text-ivory/70 hero-stagger">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
          <span>EST. 2018 · WASHINGTON, D.C.</span>
        </div>
        <div className="hidden md:block text-ivory/60 font-body">
          Bespoke Event Production & Floral Artistry
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-gold">
          <span>0{currentSlide + 1}</span>
          <span className="text-ivory/40">/</span>
          <span className="text-ivory/40">0{heroSlides.length}</span>
        </div>
      </div>

      {/* 3. CENTER HERO MASTHEAD */}
      <div ref={textRef} className="relative z-30 w-full px-6 md:px-12 flex flex-col items-center text-center my-auto">
        <div className="hero-stagger mb-4 md:mb-6">
          <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold font-semibold bg-ink/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-gold/20 inline-block">
            Luxury Wedding & Event Design
          </span>
        </div>

        <h1 className="hero-stagger font-display text-[clamp(2.5rem,7.5vw,7.5rem)] leading-[0.95] tracking-tight uppercase text-ivory max-w-6xl drop-shadow-lg">
          LADY <span className="italic font-normal text-gold lowercase font-display">Victoria</span> DESIGNS
        </h1>

        <p className="hero-stagger font-body text-sm sm:text-base md:text-xl text-ivory/85 max-w-2xl mt-6 md:mt-8 font-light leading-relaxed">
          Giving shape to visions that are too big to describe through full-scale production and breathtaking floral environments.
        </p>

        {/* CTA Buttons */}
        <div className="hero-stagger flex flex-col sm:flex-row items-center gap-4 mt-8 md:mt-10">
          <Magnetic>
            <Link
              href="/quiz"
              className="bg-gold text-ink font-body text-xs uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-ivory transition-all duration-300 shadow-lg cursor-pointer"
            >
              Investment Quiz
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/gallery"
              className="bg-ivory/10 backdrop-blur-md border border-ivory/30 text-ivory font-body text-xs uppercase tracking-[0.2em] px-8 py-4 hover:bg-ivory hover:text-ink transition-all duration-300 cursor-pointer"
            >
              View Our Work
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* 4. BOTTOM FOOTER & SLIDE CONTROLS */}
      <div className="relative z-30 w-full px-6 md:px-12 pb-8 md:pb-12 flex justify-between items-end hero-stagger">
        {/* Slide Location Indicator */}
        <div className="hidden sm:flex flex-col text-left max-w-xs">
          <span className="font-body text-[9px] uppercase tracking-[0.2em] text-gold mb-1">CURRENT FEATURE</span>
          <span className="font-display text-sm md:text-base text-ivory/90">{heroSlides[currentSlide].venue}</span>
          <span className="font-body text-[10px] text-ivory/60 tracking-wider">{heroSlides[currentSlide].subtitle}</span>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center mx-auto sm:mx-0">
          <span className="font-body text-[9px] uppercase tracking-[0.25em] text-ivory/60 mb-2">Scroll to Discover</span>
          <div className="w-[1px] h-8 bg-ivory/20 relative overflow-hidden">
            <div className="w-full h-1/2 bg-gold animate-bounce"></div>
          </div>
        </div>

        {/* Interactive Slide Dots */}
        <div className="flex gap-2.5 items-center">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-500 rounded-full cursor-pointer ${
                idx === currentSlide
                  ? "w-8 h-2 bg-gold"
                  : "w-2 h-2 bg-ivory/40 hover:bg-ivory/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
