"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import imgHeroPlaceholder from "../../../public/gallery/LVD Floral Images/LVDFloralCouple.jpeg";

export default function AboutClient() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in story intro
    const intro = document.querySelector(".story-intro");
    if (intro) {
      gsap.fromTo(
        intro,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: intro,
            start: "top 85%",
          },
        }
      );
    }

    // Fade in paragraphs
    const paragraphs = gsap.utils.toArray(".story-p");
    paragraphs.forEach((p: any) => {
      gsap.fromTo(
        p,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: p,
            start: "top 85%",
          },
        }
      );
    });

    // Stagger fade-in for approach steps
    const steps = gsap.utils.toArray(".approach-step");
    if (steps.length > 0) {
      gsap.fromTo(
        steps,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".approach-container",
            start: "top 80%",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center justify-start pt-32 pb-0">
      
      {/* SECTION 1: HERO */}
      <section className="w-full flex flex-col items-center px-6 md:px-12 mb-24">
        <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-4">
          <span className="w-8 h-px bg-gold/50"></span>
          ABOUT
          <span className="w-8 h-px bg-gold/50"></span>
        </div>
        <h1 className="font-display text-[clamp(4rem,8vw,8rem)] text-ink mb-16 text-center leading-none">
          About <span className="italic text-gold">Us</span>
        </h1>
        
        {/* Full-bleed portrait of Irene below the heading */}
        <div className="w-full h-[60vh] md:h-[80vh] relative max-w-[1440px] mx-auto overflow-hidden">
          {/* FLAG: Replace with real portrait of Irene */}
          <Image 
            src={imgHeroPlaceholder} 
            alt="Portrait of Irene" 
            placeholder="blur"
            fill 
            className="object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* SECTION 2: STORY */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col items-center gap-24 mb-32">
        
        {/* TWO-COLUMN INTRO BLOCK */}
        <div className="story-intro w-full flex flex-col md:flex-row items-center gap-12 md:gap-16 opacity-0">
          {/* Left: Portrait */}
          <div className="w-full md:w-[40%] aspect-[3/4] relative overflow-hidden shrink-0">
            {/* FLAG: Replace with a different portrait of Irene later if desired */}
            <Image 
              src="/Irene.avif" 
              alt="Portrait of Irene" 
              fill 
              className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          {/* Right: Text */}
          <div className="w-full md:w-[60%] flex flex-col justify-center">
            <div className="font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-6">CREATIVE DIRECTOR</div>
            <h2 className="font-display text-5xl md:text-7xl text-ink mb-8">Irene</h2>
            <div className="flex flex-col gap-6">
              <p className="font-body text-lg md:text-xl text-ink/80 leading-relaxed">
                Lady Victoria Designs is led by Irene, our creative director. Around 
                her is a team of designers, florists, and technicians who have spent years 
                learning what it takes to turn a room into something people remember.
              </p>
              {/* Note: This container is ready for 2-3 paragraphs of bio text */}
            </div>
          </div>
        </div>

        {/* REMAINING PARAGRAPHS */}
        <div className="w-full max-w-4xl text-center flex flex-col gap-8">
          <p className="story-p font-body text-2xl md:text-3xl lg:text-[32px] leading-relaxed text-ink opacity-0">
            We work across the DC metro area and beyond, on everything from 
            intimate gatherings to large-scale productions. The scale changes. The standard 
            doesn't.
          </p>
          <p className="story-p font-body text-2xl md:text-3xl lg:text-[32px] leading-relaxed text-ink opacity-0">
            What we promise every client is the same: a partner who brings 
            artistry and organization to the same table, and stays until the last piece is 
            struck.
          </p>
        </div>
      </section>

      {/* SECTION 3: OUR APPROACH */}
      <section className="w-full bg-ink text-ivory py-32 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-[1440px] w-full flex flex-col items-center approach-container">
          <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-16 flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50"></span>
            OUR APPROACH
            <span className="w-8 h-px bg-gold/50"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-24 w-full">
            {/* Step 1 */}
            <div className="approach-step flex flex-col items-center text-center opacity-0">
              <span className="font-display italic text-gold text-5xl md:text-6xl mb-6">01 /</span>
              <h3 className="font-display text-3xl md:text-4xl mb-6 min-h-[4rem] md:min-h-[5rem] flex items-center justify-center">We listen first</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed max-w-sm">
                Your ideas, your vision, your goals. Before we design anything, we want to 
                understand what you are actually picturing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="approach-step flex flex-col items-center text-center opacity-0">
              <span className="font-display italic text-gold text-5xl md:text-6xl mb-6">02 /</span>
              <h3 className="font-display text-3xl md:text-4xl mb-6 min-h-[4rem] md:min-h-[5rem] flex items-center justify-center">We design intentionally</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed max-w-sm">
                Every element earns its place. Nothing is there just because it looked good on a 
                mood board.
              </p>
            </div>

            {/* Step 3 */}
            <div className="approach-step flex flex-col items-center text-center opacity-0">
              <span className="font-display italic text-gold text-5xl md:text-6xl mb-6">03 /</span>
              <h3 className="font-display text-3xl md:text-4xl mb-6 min-h-[4rem] md:min-h-[5rem] flex items-center justify-center">We execute seamlessly</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed max-w-sm">
                Setup through teardown, we handle all of it. You should never see the work that 
                makes it happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="w-full bg-ivory text-ink py-32 md:py-48 px-6 md:px-12 flex flex-col items-center justify-center border-t border-ink/20 mt-12">
        <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-center mb-12 max-w-4xl mx-auto leading-tight">
          Ready to bring your <span className="italic text-gold">vision</span> to life?
        </h2>
        <Link 
          href="/inquire" 
          className="group relative px-8 py-4 border border-ink overflow-hidden"
        >
          <div className="absolute inset-0 bg-ink translate-y-[101%] transition-transform duration-500 ease-out group-hover:translate-y-0" />
          <span className="relative z-10 font-body text-xs md:text-sm uppercase tracking-widest text-ink transition-colors duration-500 group-hover:text-ivory">
            BOOK A CONSULTATION
          </span>
        </Link>
      </section>

    </main>
  );
}
