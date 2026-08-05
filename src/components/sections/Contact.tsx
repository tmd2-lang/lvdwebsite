"use client";
import React from "react";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";
import Image from "next/image";
import { media } from "@/lib/media-slots";

export default function Contact() {
  return (
    <section className="w-full bg-transparent py-12 md:py-24 px-4 sm:px-6 md:px-12" id="contact">
      <div className="max-w-[1440px] mx-auto relative rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[500px] md:min-h-[620px] flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-20 shadow-2xl border border-ink/10 group bg-ink">
        
        {/* Background Floral Image with Cinematic Overlay */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <Image
            src={media["global.contact"]}
            alt="Lady Victoria Designs Floral Artistry"
            fill
            sizes="(max-width: 1535px) 100vw, 1440px"
            className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out opacity-75"
          />
          {/* Multi-layered cinematic gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/45" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ivory/10 backdrop-blur-md border border-ivory/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-ivory font-medium">
              Let’s Begin
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-[clamp(2.5rem,5.5vw,5.5rem)] text-ivory leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6">
            Ready to bring your <span className="italic font-normal text-gold">vision</span> to life?
          </h2>

          {/* Subtitle */}
          <p className="font-body text-ivory/80 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Now accepting private commissions and grand celebrations worldwide.
          </p>

          {/* Magnetic Action Button */}
          <Magnetic>
            <Link 
              href="/inquire" 
              className="group/btn relative inline-flex items-center gap-3 px-9 py-4.5 md:px-11 md:py-5 bg-ivory text-ink rounded-full overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              {/* Background Hover Shimmer */}
              <div className="absolute inset-0 bg-gold translate-y-[101%] transition-transform duration-500 ease-out group-hover/btn:translate-y-0" />
              
              <span className="relative z-10 font-body text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-ink transition-colors duration-300">
                Book A Consultation
              </span>

              <svg 
                className="relative z-10 w-4 h-4 text-ink transition-transform duration-300 group-hover/btn:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </Magnetic>
        </div>

      </div>
    </section>
  );
}
