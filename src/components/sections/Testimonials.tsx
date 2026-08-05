"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media-slots";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I asked for heaven, you gave me paradise and this is coming from a colleague decorator. You created magic. My facial expression for the room reveal is exactly what I felt.",
    author: "EVENTS BY BRI · VERIFIED GOOGLE REVIEW",
    align: "left",
  },
  {
    quote: "Walking into our reception space honestly felt surreal. She took every vision, feeling, and dream I had in my heart and transformed it into something even more beautiful than I imagined.",
    author: "NATHAN & ASHLEY · VERIFIED GOOGLE REVIEW",
    align: "right",
  },
  {
    quote: "Lady Victoria didn’t just decorate our venue… she made us feel like royalty. Every detail was intentional, elegant, and overflowing with grace.",
    author: "GERSH FRANCOIS · VERIFIED GOOGLE REVIEW",
    align: "left",
  },
  {
    quote: "From day 1, the level of professionalism and dedication were unmatched. Day of, words cannot describe, everything was beautiful beyond my imagination.",
    author: "LATISHA BLYDEN · VERIFIED GOOGLE REVIEW",
    align: "right",
  },
  {
    quote: "The fresh flowers she chose were of such high quality that they remained vibrant throughout the entire event — a true reflection of her commitment to excellence.",
    author: "DEAN & NICOLE GAWUM · VERIFIED GOOGLE REVIEW",
    align: "left",
  },
  {
    quote: "She went above and beyond for our wedding and honestly these pictures don’t even do the decor justice. At this point you’ve become our family decorator.",
    author: "NADINE ALOMEGOUN · VERIFIED GOOGLE REVIEW",
    align: "right",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: titleRef.current,
        pinSpacing: false,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full relative min-h-screen bg-ink" id="testimonials">
      
      {/* Parallax Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={media["home.testimonials"]}
          alt="Wedding Ambiance"
          fill
          sizes="100vw"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Dark overlay gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/60 to-ink/90" />
      </div>

      {/* PINNED TITLE CONTAINER */}
      <div 
        ref={titleRef} 
        className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center pointer-events-none z-10 px-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.ink/40)_20%,transparent_60%)]" />
        
        {/* Google Reviews Citation Pill */}
        <Link
          href="/testimonials"
          className="relative z-20 inline-flex items-center gap-2.5 px-4 py-2 border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-ivory transition-all mb-6 pointer-events-auto group cursor-pointer shadow-lg"
        >
          <span className="flex text-gold text-xs tracking-wider">★★★★★</span>
          <span className="font-body text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ivory font-semibold">
            5.0 Google Rating · 50+ Verified Reviews
          </span>
          <span className="text-xs text-gold group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
        
        <div className="relative z-20 font-body text-xs uppercase tracking-[0.2em] text-gold mb-4 text-center flex items-center gap-4">
           <span className="w-8 h-px bg-gold/50"></span>
           CLIENT WORDS &amp; GRATITUDE
           <span className="w-8 h-px bg-gold/50"></span>
        </div>
        
        <h2 className="relative z-20 font-display text-[clamp(2.5rem,5vw,4.5rem)] text-ivory text-center leading-[1.1] max-w-2xl mb-6 drop-shadow-2xl">
          Crafted to Be <br/>Remembered
        </h2>
        
        <p className="relative z-20 text-ivory/80 font-body text-center max-w-md text-sm md:text-base leading-relaxed mb-8 drop-shadow-md">
          With years of trusted craftsmanship, couples and families return to Lady Victoria Designs for celebrations that mark life’s most meaningful moments.
        </p>

        <div className="relative z-30 flex flex-col sm:flex-row items-center gap-3.5 pointer-events-auto">
          <Link href="/inquire" className="font-body text-xs uppercase tracking-[0.2em] text-ink bg-ivory hover:bg-gold px-7 py-3.5 transition-colors shadow-md font-semibold cursor-pointer">
            Book Your Consultation
          </Link>
          <Link
            href="/testimonials"
            className="font-body text-xs uppercase tracking-[0.2em] text-ivory/90 hover:text-ivory border border-ivory/30 hover:border-ivory px-6 py-3.5 transition-colors backdrop-blur-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Read All 50+ Reviews</span>
            <span className="text-gold">→</span>
          </Link>
        </div>
      </div>

      {/* SCROLLING CONTENT (The Stream) */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto pb-[30vh] pt-[100vh] pointer-events-none">
        <div className="flex flex-col gap-y-[40vh]">
          {testimonials.map((t, idx) => {
            const isLeft = t.align === "left";
            return (
              <div 
                key={idx}
                className={`w-full flex px-6 md:px-12 ${isLeft ? "justify-start md:pr-[10%]" : "justify-end md:pl-[10%]"}`}
              >
                {/* Editorial Glass Cards */}
                <div className="pointer-events-auto flex flex-col items-center text-center max-w-[42ch] p-8 md:p-12 backdrop-blur-xl bg-ink/60 border border-ivory/15 shadow-2xl hover:border-gold/30 transition-all duration-500">
                  <div className="flex items-center gap-1.5 mb-5 text-gold">
                    <span className="text-sm tracking-widest">★★★★★</span>
                  </div>
                  <p className="font-display italic text-xl md:text-2xl leading-[1.4] text-ivory mb-6 drop-shadow-md">
                    “{t.quote}”
                  </p>
                  <div className="font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold font-bold">
                    {t.author}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
