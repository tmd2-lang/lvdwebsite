"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Contact from "@/components/sections/Contact";

export default function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Fade in hero intro
      gsap.fromTo(
        ".about-fade",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
        }
      );

      // Stagger fade-in for approach steps
      gsap.fromTo(
        ".approach-step",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".approach-container",
            start: "top 80%",
          },
        }
      );

      // Stagger fade-in for gallery images
      gsap.fromTo(
        ".about-gallery-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-gallery-container",
            start: "top 85%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center justify-start pt-36 md:pt-48 pb-0">
      
      {/* SECTION 1: EDITORIAL HERO */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 mb-20 md:mb-32 flex flex-col items-center text-center">
        <div className="about-fade font-body text-xs uppercase tracking-[0.25em] text-gold mb-6 flex items-center gap-4">
          <span className="w-8 h-px bg-gold/50"></span>
          ABOUT LADY VICTORIA DESIGNS
          <span className="w-8 h-px bg-gold/50"></span>
        </div>

        <h1 className="about-fade font-display text-[clamp(2.75rem,6vw,5.5rem)] text-ink leading-[1.05] tracking-tight max-w-5xl mb-8">
          Embodying Unique Visions, <br className="hidden sm:inline"/>
          <span className="italic text-gold">Crafting Unforgettable Events</span>
        </h1>

        <p className="about-fade font-body text-base md:text-xl text-ink/75 max-w-3xl leading-relaxed">
          At the heart of every extraordinary event is a team that sees both the big picture and the tiniest details. Lady Victoria Designs is a full-service event design and production company specializing in creating stunning experiences in the DC Metro area and beyond.
        </p>
      </section>

      {/* SECTION 2: MEET IRENE & THE ATELIER (Two-Column Split) */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 mb-28 md:mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5 relative aspect-[3/4] bg-ecru border border-ink/10 overflow-hidden shadow-xl group rounded-sm">
            <Image 
              src="/Irene.avif" 
              alt="Irene - Creative Director of Lady Victoria Designs" 
              fill 
              className="object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-6 left-6 text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-body text-xs uppercase tracking-widest">
              Irene · Creative Director
            </div>
          </div>

          {/* Right Column: Bio & Core Narrative */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-4 block">
              CREATIVE DIRECTION & LEADERSHIP
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-ink mb-8 leading-tight">
              Led by <span className="italic text-gold">Irene</span>
            </h2>

            <div className="flex flex-col gap-6 font-body text-base md:text-lg text-ink/80 leading-relaxed">
              <p>
                We’re a team of designers, florists, and technicians sharing a single mission: to create immersive, unforgettable event experiences.
              </p>
              <p>
                Led by our creative director, Irene, we take on every event design and production project with a passion for creativity and excellence. Through the years, we have grown into a trusted name in luxury event design and floral architecture.
              </p>
              <p>
                As a team, we’re proud of our successful record in creating unique events from intimate gatherings to large-scale productions. Our promise to each of our clients is to remain a trusted partner that brings artistry and organization together to deliver events that stun.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: OUR APPROACH (3 Pillars) */}
      <section className="w-full bg-ink text-ivory py-28 md:py-36 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-[1440px] w-full flex flex-col items-center approach-container">
          <div className="font-body text-xs uppercase tracking-[0.25em] text-gold mb-16 flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50"></span>
            OUR THREE-STEP APPROACH
            <span className="w-8 h-px bg-gold/50"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 w-full">
            {/* Step 1 */}
            <div className="approach-step flex flex-col items-start bg-ivory/[0.03] border border-ivory/10 p-8 md:p-10 rounded-sm">
              <span className="font-display italic text-gold text-4xl md:text-5xl mb-6">01 /</span>
              <h3 className="font-display text-2xl md:text-3xl text-ivory mb-4">We listen first</h3>
              <p className="font-body text-sm md:text-base text-ivory/70 leading-relaxed">
                Your ideas, your vision, your goals. Before putting pen to paper or arranging a single bloom, we take time to understand what matters most to you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="approach-step flex flex-col items-start bg-ivory/[0.03] border border-ivory/10 p-8 md:p-10 rounded-sm">
              <span className="font-display italic text-gold text-4xl md:text-5xl mb-6">02 /</span>
              <h3 className="font-display text-2xl md:text-3xl text-ivory mb-4">We design intentionally</h3>
              <p className="font-body text-sm md:text-base text-ivory/70 leading-relaxed">
                Every element has a unique purpose in drawing a direct line between your initial inspiration and the final immersive atmosphere.
              </p>
            </div>

            {/* Step 3 */}
            <div className="approach-step flex flex-col items-start bg-ivory/[0.03] border border-ivory/10 p-8 md:p-10 rounded-sm">
              <span className="font-display italic text-gold text-4xl md:text-5xl mb-6">03 /</span>
              <h3 className="font-display text-2xl md:text-3xl text-ivory mb-4">We execute seamlessly</h3>
              <p className="font-body text-sm md:text-base text-ivory/70 leading-relaxed">
                From logistics and on-site rigging to teardown, our team manages every moving piece so you can immerse yourself in the celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ATMOSPHERE & CRAFT (Curated Imagery) */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-24 md:py-32 about-gallery-container">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3">
            FINE ARTISTRY IN MOTION
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-ink">
            A Glimpse into Our <span className="italic text-gold">Craft</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="about-gallery-item aspect-[4/5] relative overflow-hidden bg-ecru rounded-sm border border-ink/10 group">
            <img 
              src="/gallery/Amber & Kendall Wedding/Amber&KendallTableShot3.jpeg" 
              alt="Intricate Table Design" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="about-gallery-item aspect-[4/5] relative overflow-hidden bg-ecru rounded-sm border border-ink/10 group md:-translate-y-6">
            <img 
              src="/gallery/LVD Floral Images/LVDFloralBride.jpeg" 
              alt="Bespoke Bridal Floral Artistry" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="about-gallery-item aspect-[4/5] relative overflow-hidden bg-ecru rounded-sm border border-ink/10 group">
            <img 
              src="/gallery/Jenny & Jordan Wedding/Jenny&JordanTablesOverheadShot.jpeg" 
              alt="Grand Venue Production" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: UNIVERSAL FLORAL CTA */}
      <Contact />

    </main>
  );
}
