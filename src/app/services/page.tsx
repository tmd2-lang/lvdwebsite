"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Contact from "@/components/sections/Contact";
import Image from "next/image";
import Investments from "@/components/sections/Services";
import { media } from "@/lib/media-slots";

const services = [
  {
    id: "production",
    typeLabel: "Signature Service",
    title: "Full Production",
    description: "One vision, carried all the way through. We lead the design and production of your celebration, from floor plans, staging, lighting, and custom fabrication to florals, tablescapes, and the final room reveal. Every element is developed together, then managed by one team from load-in through the last dance.",
    scope: "Design & Production",
    includes: "Creative Direction, Logistics, Installation",
    image: media["services.capability.1"]
  },
  {
    id: "floral",
    typeLabel: "Artistry",
    title: "Floral Design",
    description: "Flowers set the emotional tone of a room. We design each floral story around your setting, palette, and sense of occasion, from sculptural ceremony pieces and suspended installations to layered centerpieces and personal flowers.\n\nWe also create sympathy arrangements, seasonal bouquets, and custom floral gifts with the same considered approach.",
    scope: "Floral Design",
    includes: "Installations, Centerpieces, Gifting",
    image: media["services.capability.2"]
  },
  {
    id: "event-production",
    typeLabel: "Execution",
    title: "Staging & Lighting",
    description: "Beautiful events rely on technical work guests never see. Our production team handles stage and dance-floor treatments, draping, rigging, and lighting design, then coordinates installation and strike. With one crew overseeing the room, what was imagined is what your guests experience.",
    scope: "Technical",
    includes: "Stages, Drapery, Lighting",
    image: media["services.capability.3"]
  },
  {
    id: "decor",
    typeLabel: "Curation",
    title: "Décor & Rentals",
    description: "Décor gives a room its rhythm: where guests gather, what they touch, and how each view feels. We curate furniture, linens, tabletop pieces, and finishing details to support the larger design instead of competing with it. Available as part of a full-service design experience or for select à la carte needs.",
    scope: "Curation",
    includes: "Furniture, Linens, Tabletop",
    image: media["services.capability.4"]
  }
];

const designFor = [
  {
    id: "weddings",
    title: "Weddings",
    description: "From ceremony to last dance, we design each chapter as part of one story.",
    image: media["services.occasion.1"]
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Galas, brand events, and leadership gatherings shaped around the identity and purpose of the organization hosting them.",
    image: media["services.occasion.2"]
  },
  {
    id: "private",
    title: "Private Celebrations",
    description: "Milestone birthdays, anniversaries, and intimate dinners designed to feel personal, generous, and worth remembering.",
    image: media["services.occasion.3"]
  },
  {
    id: "gifting",
    title: "Floral Gifting",
    description: "Sympathy flowers, seasonal bouquets, and one-of-a-kind arrangements for moments that deserve more than something off the shelf.",
    image: media["services.occasion.4"]
  }
];

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
    
    // 1. Floating Hero Image Parallax (Vero Style)
    gsap.fromTo(".floating-hero-img-inner", 
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".floating-hero-image",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    // 2. Service Images Parallax
    gsap.utils.toArray<HTMLElement>(".service-image-container").forEach((container) => {
      const img = container.querySelector("img");
      if (!img) return;

      gsap.fromTo(img, 
        { yPercent: -10 },
        {
          yPercent: 10,
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

    // 3. Design For Cards Stagger
    gsap.from(".design-for-card", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".design-for-container",
        start: "top 80%"
      }
    });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="w-full bg-ivory text-ink flex flex-col relative">
      
      {/* HERO SECTION */}
      <section className="w-full min-h-[70vh] flex flex-col justify-center items-center text-center px-6 md:px-12 py-32 md:py-48 border-b border-ink/20">
        <div className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-body">SERVICES &amp; CAPABILITIES</div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,6.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-8">
          Architects of the <span className="italic text-gold">Extraordinary</span>
        </h1>
        <p className="font-body text-ink/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          Lady Victoria Designs is a full-service event design and production company. We specialize in transforming raw spaces into highly curated, immersive environments for the most discerning clientele.
        </p>
      </section>

      {/* FLOATING HERO IMAGE */}
      <section className="w-full px-6 md:px-12 py-12 md:py-20 border-b border-ink/20 flex justify-center bg-ivory">
        <div className="max-w-[1440px] w-full h-[50vh] md:h-[70vh] overflow-hidden relative floating-hero-image">
          <Image
            src={media["services.hero"]}
            alt="Luxury celebration design and floral artistry by Lady Victoria Designs"
            fill
            sizes="100vw"
            className="w-full h-full object-cover scale-[1.3] floating-hero-img-inner origin-center"
            priority
          />
        </div>
      </section>

      {/* TYPOGRAPHY INTRO BLOCK */}
      <section className="w-full px-6 md:px-12 py-20 md:py-32 flex flex-col items-center justify-center text-center bg-ivory intro-text-block">
        <h2 className="font-display text-[clamp(2.5rem,4vw,4.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-8 md:mb-12">
          Design + Décor + Details.<br/>
          <span className="italic text-gold">And everything in between, flawlessly delivered.</span>
        </h2>
        <div className="font-body text-sm md:text-base text-ink/70 max-w-xl mx-auto leading-relaxed flex flex-col gap-6">
          <p>
            No two celebrations begin in the same place. You may arrive with a complete vision, a favorite color, a saved image, or simply a feeling. Our work is to translate that starting point into a room that feels unmistakably yours.
          </p>
          <p>
            Each celebration is shaped around your venue, guest experience, priorities, and investment, then carried from concept through installation by one accountable team.
          </p>
        </div>
      </section>

      {/* ALTERNATING SWISS GRID SERVICES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {services.map((service, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div key={service.id} className={`w-full flex flex-col-reverse lg:flex-row border-t border-ink/20 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* TEXT HALF */}
              <div className={`w-full lg:w-1/3 flex flex-col justify-between p-8 md:p-12 lg:p-16 ${isEven ? 'lg:border-r border-ink/20' : 'lg:border-l border-ink/20'} min-h-0 lg:min-h-[50vh]`}>
                
                {/* Top: Title & Type */}
                <div className="mb-12 md:mb-16 lg:mb-24">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 block mb-4">{service.typeLabel}</span>
                  <h2 className="font-display text-4xl md:text-5xl text-ink uppercase tracking-wide leading-tight">
                    {service.title}
                  </h2>
                </div>
                
                {/* Bottom: Description & Specs */}
                <div className="flex flex-col gap-8 md:gap-12 mt-auto">
                  <p className="font-body text-sm md:text-base text-ink/80 leading-relaxed max-w-md whitespace-pre-wrap">
                    {service.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-8 md:gap-12">
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

              {/* IMAGE HALF */}
              <div className="w-full lg:w-2/3 p-0 md:p-8 lg:p-16">
                <div className="w-full h-[45vh] sm:h-[50vh] md:h-[60vh] lg:h-[80vh] overflow-hidden relative service-image-container">
                  <Image
                    src={service.image} 
                    alt={service.title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 67vw"
                    className="w-full h-full object-cover scale-[1.3] origin-center"
                  />
                </div>
              </div>
              
            </div>
          )
        })}
      </section>

      {/* NEW SECTION: WHAT WE DESIGN FOR */}
      <section className="w-full bg-ivory py-20 md:py-32 px-6 md:px-12 border-b border-ink/20 design-for-container">
        <div className="max-w-[1440px] mx-auto">
          <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-10 md:mb-16 text-center">
            WHAT WE DESIGN FOR
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {designFor.map((item) => (
              <div key={item.id} className="flex flex-col design-for-card">
                <div className="w-full aspect-[4/5] overflow-hidden mb-5 md:mb-8 relative">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display text-2xl text-ink mb-4">{item.title}</h3>
                <p className="font-body text-sm text-ink/70 leading-relaxed max-w-[35ch]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Investments />

      {/* FINAL CTA SECTION */}
      <Contact />

    </main>
  );
}
