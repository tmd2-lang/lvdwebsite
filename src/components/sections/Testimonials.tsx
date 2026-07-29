"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Irene and her team completely transformed our venue into a stunning oasis. Her attention to detail and ability to execute our complex vision was beyond anything we could have imagined.",
    author: "Bride & Groom · Washington D.C.",
    align: "left",
  },
  {
    quote: "I walked in and literally gasped. It was a masterpiece. The floral designs and custom fabrication were nothing short of spectacular. They went above and beyond to deliver a luxury experience.",
    author: "Mother of the Bride · Meridian House",
    align: "right",
  },
  {
    quote: "Working with Lady Victoria Designs was an absolute dream. Irene's professionalism and kindness put us at ease immediately. She took our loose ideas and turned them into an elegant reality.",
    author: "Couple · Maryland",
    align: "left",
  },
  {
    quote: "Irene is not just a floral designer, she is a miracle worker. She remained calm and composed despite the pressure, and her dedication to making our vision a reality was incredible.",
    author: "Bride",
    align: "right",
  },
  {
    quote: "The decor and floral arrangements were absolutely stunning. Irene even volunteered to assist with coordination beyond her core duties to ensure our day was perfect. Highly recommend!",
    author: "Bride & Groom",
    align: "left",
  },
  {
    quote: "Lady Victoria Designs exceeded all our expectations. The team was incredibly accommodating and flexible when challenges arose. The final result was elegant and flawless.",
    author: "Corporate Client",
    align: "right",
  }
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
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
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522748906645-95d8adfa52c1?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-fixed opacity-50"
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
           TESTIMONY
           <span className="w-8 h-px bg-gold/50"></span>
        </div>
        
        <h2 className="relative z-10 font-display text-[clamp(2.5rem,5vw,4.5rem)] text-ivory text-center leading-[1.1] max-w-2xl mb-8 drop-shadow-2xl">
          Crafted to Be <br/>Remembered
        </h2>
        
        <p className="relative z-10 text-ivory/80 font-body text-center max-w-md text-sm md:text-base leading-relaxed mb-8 drop-shadow-md">
          With years of trusted craftsmanship, clients return to Lady Victoria Designs for events that mark life’s most meaningful moments.
        </p>

        <button className="relative z-10 font-body text-xs uppercase tracking-[0.2em] text-ivory border border-ivory/30 px-8 py-4 hover:bg-ivory hover:text-ink transition-colors pointer-events-auto backdrop-blur-sm">
          Book Your Consultation
        </button>
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
                    "{t.quote}"
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
