"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "@/components/Magnetic";

const services = [
  {
    id: "production",
    typeLabel: "Signature Service",
    title: "Full Production",
    description: "Our signature service. We orchestrate every visual and experiential element of your celebration from the ground up. From structural architecture and custom lighting design to bespoke tablescapes and spatial flow, we ensure your event is a cohesive, immersive masterpiece.",
    scope: "Design & Production",
    includes: "Architecture, Logistics, Timeline",
    image: "/gallery/Jenny & Jordan Wedding/Jenny&JordanTablesOverheadShot.jpeg"
  },
  {
    id: "floral",
    typeLabel: "Artistry",
    title: "Floral Design",
    description: "Florals are the soul of our designs. We source rare, premium blooms globally to craft breathtaking installations. Whether it is a cascading ceiling treatment, a sculptural ceremony arch, or textured, romantic centerpieces, our floral team treats every arrangement as fine art.",
    scope: "Floristry",
    includes: "Installations, Centerpieces, Styling",
    image: "/gallery/LVD Floral Images/LVDFloralBride.jpeg"
  },
  {
    id: "decor",
    typeLabel: "Curation",
    title: "Décor & Rentals",
    description: "The difference between a beautiful room and a luxury experience lies in the details. We curate an exclusive inventory of high-end linens, artisanal tableware, custom seating, and atmospheric lighting to build a tactile environment that your guests will never forget.",
    scope: "Curation",
    includes: "Tablescapes, Furniture, Lighting",
    image: "/gallery/Amber & Kendall Wedding/Amber&KendallTableShot3.jpeg"
  }
];

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Floating Hero Image Parallax (Vero Style)
    gsap.fromTo(".floating-hero-img-inner", 
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".floating-hero-image",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    // 2. Swiss Grid Service Images Parallax
    gsap.utils.toArray<HTMLElement>('.service-image-container').forEach((container) => {
      const img = container.querySelector('img');
      gsap.fromTo(img, 
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    // 3. Intro Text Fade-up
    gsap.fromTo(".intro-text-block", 
      { opacity: 0, y: 50 },
      {
        opacity: 1, 
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".intro-text-block",
          start: "top 80%"
        }
      }
    );

    // 4. Full Width Break Image Parallax
    gsap.fromTo(".break-image-container img", 
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".break-image-container",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className="w-full bg-ivory text-ink relative" ref={containerRef}>
      
      {/* HEADER SECTION */}
      <section className="w-full pt-48 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-ivory">
        <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-4">
           <span className="w-8 h-px bg-gold/50"></span>
           OUR EXPERTISE
           <span className="w-8 h-px bg-gold/50"></span>
        </div>
        <h1 className="font-display text-[clamp(3rem,6vw,6rem)] text-ink max-w-4xl mx-auto leading-none mb-8">
          Architects of the <span className="italic text-gold">Extraordinary</span>
        </h1>
        <p className="font-body text-ink/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          Lady Victoria Designs is a premier event architecture and floral design studio. We specialize in transforming raw spaces into highly curated, immersive environments for the most discerning clientele.
        </p>
      </section>

      {/* VERO-STYLE FLOATING HERO IMAGE */}
      <section className="w-full px-4 md:px-8 flex justify-center bg-ivory">
        <div className="w-full h-[70vh] md:h-[80vh] overflow-hidden floating-hero-image rounded-sm relative">
          <img 
            src="/gallery/Amber & Kendall Wedding/AmberKendallHero.jpeg" 
            alt="Lady Victoria Designs Excellence"
            className="w-full h-full object-cover scale-[1.3] floating-hero-img-inner origin-center"
          />
        </div>
      </section>

      {/* TYPOGRAPHY INTRO BLOCK */}
      <section className="w-full px-6 md:px-12 py-32 flex flex-col items-center justify-center text-center bg-ivory intro-text-block">
        <h2 className="font-display text-[clamp(2.5rem,4vw,4.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-12">
          Design + Décor + Details.<br/>
          <span className="italic text-gold">And everything in-between, Flawlessly Delivered.</span>
        </h2>
        <div className="font-body text-sm md:text-base text-ink/70 max-w-xl mx-auto leading-relaxed flex flex-col gap-6">
          <p>
            No two events are the same. Each vision, color scheme, idea, mood board, or inspiration is truly unique. Neither are the solutions we offer at Lady Victoria Designs.
          </p>
          <p>
            Our comprehensive range of services is tailored to each client’s unique needs to deliver stunning results that align with your aesthetic, purpose, and budget.
          </p>
        </div>
      </section>

      {/* ALTERNATING SWISS GRID SERVICES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {services.map((service, index) => {
          const isEven = index % 2 === 0;
          // isEven = Text Left (33%), Image Right (66%)
          // !isEven = Image Left (66%), Text Right (33%)
          
          return (
            <div key={service.id} className={`w-full flex flex-col lg:flex-row border-t border-ink/20 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* TEXT HALF (1/3 Width) */}
              <div className={`w-full lg:w-1/3 flex flex-col justify-between p-8 md:p-12 lg:p-16 ${isEven ? 'lg:border-r border-ink/20' : 'lg:border-l border-ink/20'} min-h-[50vh]`}>
                
                {/* Top: Title & Type */}
                <div className="mb-24">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 block mb-4">type</span>
                  <h2 className="font-display text-4xl md:text-5xl text-ink uppercase tracking-wide leading-tight">
                    {service.title}
                  </h2>
                </div>
                
                {/* Bottom: Description & Specs */}
                <div className="flex flex-col gap-12 mt-auto">
                  <p className="font-body text-sm md:text-base text-ink/80 leading-relaxed max-w-md">
                    {service.description}
                  </p>
                  
                  <div className="flex gap-12">
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/50">SCOPE</span>
                      <span className="font-body text-xs md:text-sm text-ink/90">{service.scope}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/50">INCLUDES</span>
                      <span className="font-body text-xs md:text-sm text-ink/90">{service.includes}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* IMAGE HALF (2/3 Width) */}
              <div className="w-full lg:w-2/3 p-8 md:p-12 lg:p-16">
                <div className="w-full h-[60vh] lg:h-[80vh] overflow-hidden relative service-image-container">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover scale-[1.3] origin-center"
                  />
                </div>
              </div>
              
            </div>
          )
        })}
      </section>

      {/* FULL WIDTH PARALLAX BREAK */}
      <section className="w-full h-[60vh] md:h-[80vh] overflow-hidden relative break-image-container border-b border-ink/20">
        <img 
          src="/gallery/Amber & Kendall Wedding/Amber&KendallVenueShot.jpeg" 
          alt="Lady Victoria Designs Venue Experience"
          className="w-full h-full object-cover scale-[1.3] origin-center"
        />
      </section>

      {/* FINAL CTA SECTION */}
      <section className="w-full bg-ivory text-ink py-48 px-6 flex flex-col items-center justify-center text-center">
        <h2 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none mb-12">
          Ready to <br/>
          <span className="italic text-gold">bring your vision</span><br/>
          to life?
        </h2>
        <Magnetic>
          <a href="/inquire" className="group relative inline-flex items-center justify-center font-body text-xs uppercase tracking-[0.2em] text-ink py-4 px-12 border border-ink/20 hover:border-gold hover:text-gold transition-all duration-300">
            Book a Consultation
          </a>
        </Magnetic>
      </section>

    </main>
  );
}
