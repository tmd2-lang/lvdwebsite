"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Working with Irene for my wedding was the best decision that we made! From day one, the level of professionalism, design recommendations, and dedication were unmatched. Day of, words cannot describe, everything was beautiful beyond my imagination.",
    author: "LATISHA · WEDDINGWIRE REVIEW",
    align: "left",
  },
  {
    quote: "From the moment I met Irene, I knew there was no one else I would rather work with. She was very professional and attentive to all our needs. She took our loose ideas and Pinterest boards and completely exceeded our expectations.",
    author: "SCOTT · WEDDINGWIRE REVIEW",
    align: "right",
  },
  {
    quote: "Lady Victoria Designs made our wedding day look absolutely stunning. Irene made the entire planning process stress-free. 10/10 would highly recommend if you care about quality and want the absolute best in the business.",
    author: "NICOLE & ERIC · WEDDINGWIRE REVIEW",
    align: "left",
  },
  {
    quote: "Irene was an absolute joy to work with. She was professional and kind throughout the entire process, and I was so impressed with her ability to remain joyful and poised even through stressful times.",
    author: "NAWA · WEDDINGWIRE REVIEW",
    align: "right",
  },
  {
    quote: "Delighted with the work from Lady Victoria Designs. The attention to detail on every element was thoughtfully executed, elegant, and seamlessly integrated with the overall luxury atmosphere of our wedding.",
    author: "DEAN · WEDDINGWIRE REVIEW",
    align: "left",
  },
  {
    quote: "Irene is an absolute gem. She was incredibly responsive and supportive throughout our planning. She went above and beyond to bring our dream floral vision to life and transform our venue into a breathtaking reality.",
    author: "VERIFIED CLIENT · THE KNOT REVIEW",
    align: "right",
  }
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
          src="/gallery/purple-grandeur/purple-grandeur-02.jpg"
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
        className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center pointer-events-none z-0 px-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.ink/40)_20%,transparent_60%)]" />
        
        <div className="relative z-10 font-body text-xs uppercase tracking-[0.2em] text-gold mb-6 text-center flex items-center gap-4">
           <span className="w-8 h-px bg-gold/50"></span>
           KIND WORDS
           <span className="w-8 h-px bg-gold/50"></span>
        </div>
        
        <h2 className="relative z-10 font-display text-[clamp(2.5rem,5vw,4.5rem)] text-ivory text-center leading-[1.1] max-w-2xl mb-8 drop-shadow-2xl">
          Crafted to Be <br/>Remembered
        </h2>
        
        <p className="relative z-10 text-ivory/80 font-body text-center max-w-md text-sm md:text-base leading-relaxed mb-8 drop-shadow-md">
          With years of trusted craftsmanship, clients return to Lady Victoria Designs for events that mark life’s most meaningful moments.
        </p>

        <Link href="/inquire" className="relative z-10 font-body text-xs uppercase tracking-[0.2em] text-ivory border border-ivory/30 px-8 py-4 hover:bg-ivory hover:text-ink transition-colors pointer-events-auto backdrop-blur-sm">
          Book Your Consultation
        </Link>
      </div>

      {/* SCROLLING CONTENT (The Stream) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto pb-[30vh] pt-[100vh]">
        <div className="flex flex-col gap-y-[40vh]">
          {testimonials.map((t, idx) => {
            const isLeft = t.align === "left";
            return (
              <div 
                key={idx}
                className={`w-full flex px-6 md:px-12 ${isLeft ? "justify-start md:pr-[10%]" : "justify-end md:pl-[10%]"}`}
              >
                {/* Dark Mode Frosted Glass Cards */}
                <div className="flex flex-col items-center text-center max-w-[40ch] p-8 md:p-12 backdrop-blur-xl bg-ink/40 border border-ivory/10 shadow-2xl rounded-sm hover:scale-[1.02] transition-transform duration-500">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => (
                       <span key={star} className="text-gold text-sm md:text-base drop-shadow-lg">★</span>
                    ))}
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
