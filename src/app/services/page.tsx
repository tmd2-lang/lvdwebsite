"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Contact from "@/components/sections/Contact";
import Image from "next/image";

const services = [
  {
    id: "production",
    typeLabel: "Signature Service",
    title: "Full Production",
    description: "One vision, carried all the way through. We lead the design and production of your celebration, from floor plans, staging, lighting, and custom fabrication to florals, tablescapes, and the final room reveal. Every element is developed together, then managed by one team from load-in through the last dance.",
    scope: "Design & Production",
    includes: "Creative Direction, Logistics, Installation",
    image: "/services/full-production.jpg"
  },
  {
    id: "floral",
    typeLabel: "Artistry",
    title: "Floral Design",
    description: "Flowers set the emotional tone of a room. We design each floral story around your setting, palette, and sense of occasion, from sculptural ceremony pieces and suspended installations to layered centerpieces and personal flowers.\n\nWe also create sympathy arrangements, seasonal bouquets, and custom floral gifts with the same considered approach.",
    scope: "Floral Design",
    includes: "Installations, Centerpieces, Gifting",
    image: "/gallery/white-green-botanicals/white-green-botanicals-01.jpeg"
  },
  {
    id: "event-production",
    typeLabel: "Execution",
    title: "Staging & Lighting",
    description: "Beautiful events rely on technical work guests never see. Our production team handles stage and dance-floor treatments, draping, rigging, and lighting design, then coordinates installation and strike. With one crew overseeing the room, what was imagined is what your guests experience.",
    scope: "Technical",
    includes: "Stages, Drapery, Lighting",
    image: "/services/staging-and-lighting.jpg"
  },
  {
    id: "decor",
    typeLabel: "Curation",
    title: "Décor & Rentals",
    description: "Décor gives a room its rhythm: where guests gather, what they touch, and how each view feels. We curate furniture, linens, tabletop pieces, and finishing details to support the larger design instead of competing with it. Available as part of a full commission or for select à la carte needs.",
    scope: "Curation",
    includes: "Furniture, Linens, Tabletop",
    image: "/gallery/amber-kendall/amber-kendall-23.jpeg"
  }
];

const designFor = [
  {
    id: "weddings",
    title: "Weddings",
    description: "From ceremony to last dance, we design each chapter as part of one story.",
    image: "/services/weddings.jpg"
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Galas, brand events, and leadership gatherings shaped around the identity and purpose of the organization hosting them.",
    image: "/gallery/amber-kendall/amber-kendall-05.jpeg"
  },
  {
    id: "private",
    title: "Private Celebrations",
    description: "Milestone birthdays, anniversaries, and intimate dinners designed to feel personal, generous, and worth remembering.",
    image: "/gallery/two-tone-luxe/two-tone-luxe-08.jpeg"
  },
  {
    id: "gifting",
    title: "Floral Gifting",
    description: "Sympathy flowers, seasonal bouquets, and one-of-a-kind arrangements for moments that deserve more than something off the shelf.",
    image: "/gallery/editorial-wedding-archive/editorial-wedding-archive-16.jpg"
  }
];

const investmentsData = [
  {
    title: "The Full Production",
    desc: "Creative direction, floral design, production, custom elements, and on-site execution.",
    price: "FROM $55,000",
    image: "/investments/the-essentials.jpg"
  },
  {
    title: "Design + Florals",
    desc: "A focused design plan paired with bespoke florals and installation.",
    price: "FROM $20,000",
    image: "/investments/design-and-florals.jpeg"
  },
  {
    title: "The Essentials",
    desc: "Signature florals and considered details for intimate celebrations.",
    price: "FROM $8,000",
    image: "/gallery/white-green-botanicals/white-green-botanicals-04.jpeg"
  }
];

export default function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeInvestmentIndex, setActiveInvestmentIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {

    // FIX: White band bug
    // Changed yPercent from -15/15 to -10/10 so the image translation 
    // doesn't exceed the scale-[1.3] overflow bounds.
    
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

    // 2. Swiss Grid Service Images Parallax
    gsap.utils.toArray<HTMLElement>('.service-image-container').forEach((container) => {
      const img = container.querySelector('img');
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
    
    // 4. What We Design For Fade-up stagger
    gsap.fromTo(".design-for-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".design-for-container",
          start: "top 75%"
        }
      }
    );

    }, containerRef);

    return () => ctx.revert();
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
          Lady Victoria Designs shapes weddings and celebrations from first concept through final installation. We bring design, florals, production, lighting, and décor together under one creative direction. The result is a room where every element feels considered and every detail belongs.
        </p>
      </section>

      {/* VERO-STYLE FLOATING HERO IMAGE */}
      <section className="w-full px-4 md:px-8 flex justify-center bg-ivory">
        <div className="w-full h-[70vh] md:h-[80vh] overflow-hidden floating-hero-image rounded-sm relative">
          <Image
            src="/gallery/editorial-wedding-archive/editorial-wedding-archive-31.jpg"
            alt="White floral ceremony aisle designed by Lady Victoria Designs"
            fill
            sizes="100vw"
            fetchPriority="high"
            className="w-full h-full object-cover scale-[1.3] floating-hero-img-inner origin-center"
          />
        </div>
      </section>

      {/* TYPOGRAPHY INTRO BLOCK */}
      <section className="w-full px-6 md:px-12 py-32 flex flex-col items-center justify-center text-center bg-ivory intro-text-block">
        <h2 className="font-display text-[clamp(2.5rem,4vw,4.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-12">
          Design + Décor + Details.<br/>
          <span className="italic text-gold">And everything in between, flawlessly delivered.</span>
        </h2>
        <div className="font-body text-sm md:text-base text-ink/70 max-w-xl mx-auto leading-relaxed flex flex-col gap-6">
          <p>
            No two celebrations begin in the same place. You may arrive with a complete vision, a favorite color, a saved image, or simply a feeling. Our work is to translate that starting point into a room that feels unmistakably yours.
          </p>
          <p>
            Each commission is shaped around your venue, guest experience, priorities, and investment, then carried from concept through installation by one accountable team.
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
              <div className={`w-full lg:w-1/3 flex flex-col justify-between p-8 md:p-12 lg:p-16 ${isEven ? 'lg:border-r border-ink/20' : 'lg:border-l border-ink/20'} min-h-[50vh]`}>
                
                {/* Top: Title & Type */}
                <div className="mb-24">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 block mb-4">{service.typeLabel}</span>
                  <h2 className="font-display text-4xl md:text-5xl text-ink uppercase tracking-wide leading-tight">
                    {service.title}
                  </h2>
                </div>
                
                {/* Bottom: Description & Specs */}
                <div className="flex flex-col gap-12 mt-auto">
                  <p className="font-body text-sm md:text-base text-ink/80 leading-relaxed max-w-md whitespace-pre-wrap">
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

              {/* IMAGE HALF */}
              <div className="w-full lg:w-2/3 p-0 md:p-8 lg:p-16">
                <div className="w-full h-[50vh] md:h-[60vh] lg:h-[80vh] overflow-hidden relative service-image-container">
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
      <section className="w-full bg-ivory py-32 px-6 md:px-12 border-b border-ink/20 design-for-container">
        <div className="max-w-[1440px] mx-auto">
          <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-16 text-center">
            WHAT WE DESIGN FOR
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {designFor.map((item) => (
              <div key={item.id} className="flex flex-col design-for-card">
                <div className="w-full aspect-[4/5] overflow-hidden mb-8 relative">
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

      {/* NEW SECTION: INVESTMENTS */}
      <section className="w-full bg-ivory py-32 md:py-48 px-6 md:px-12 border-b border-ink/20">
        <div className="max-w-[1440px] mx-auto flex flex-col">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4 text-center">INVESTMENTS</div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-4 text-center">Investments</h2>
          <p className="font-body text-ink/70 text-sm md:text-base text-center max-w-xl mx-auto mb-16">
            Every commission is tailored to its venue, guest count, and design scope. These figures are starting points, not fixed packages.
          </p>
          
          <div className="flex flex-col md:flex-row w-full h-[70vh] gap-4 md:gap-4">
            {investmentsData.map((service, idx) => {
              const isActive = activeInvestmentIndex === idx;
              
              return (
                <button
                  type="button"
                  key={idx}
                  onMouseEnter={() => setActiveInvestmentIndex(idx)}
                  onFocus={() => setActiveInvestmentIndex(idx)}
                  onClick={() => setActiveInvestmentIndex(idx)}
                  aria-pressed={isActive}
                  className={`relative flex flex-col justify-end overflow-hidden group cursor-pointer transition-[flex-grow,width] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm ${
                    isActive ? "flex-[3_3_0%] md:w-[60%]" : "flex-[1_1_0%] md:w-[20%]"
                  }`}
                >
                  <Image
                    src={service.image} 
                    fill
                    sizes={isActive ? "(max-width: 767px) 100vw, 60vw" : "(max-width: 767px) 100vw, 20vw"}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                      isActive ? "scale-100" : "scale-110"
                    }`}
                    alt={service.title}
                  />
                  
                  <div className={`absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-700 ${
                    isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                  }`} />

                  <div className="relative z-10 w-full h-full">
                    
                    {/* Collapsed State Content */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-12 transition-opacity duration-500 delay-100 ${
                      isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}>
                      {/* Subtle dark gradient scrim for bottom third */}
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-ink/90 to-transparent pointer-events-none -z-10" />
                      
                      <h3 className="font-display text-3xl xl:text-4xl text-ivory whitespace-nowrap hidden md:block -rotate-90 origin-center absolute bottom-1/2 translate-y-1/2">
                        {service.title}
                      </h3>
                      <h3 className="font-display text-2xl md:text-3xl text-ivory block md:hidden mb-1 md:mb-6 px-6 text-center">
                        {service.title}
                      </h3>
                      <div className="font-body text-[7px] uppercase tracking-widest text-ivory hidden md:block mt-auto text-center px-4 w-full">
                        {service.price}
                      </div>
                    </div>

                    {/* Expanded State Content */}
                    <div className={`absolute inset-0 p-6 md:p-12 flex flex-col justify-end transition-all duration-700 ease-out ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                    }`}>
                      <h3 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 text-ivory">
                        {service.title}
                      </h3>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-t border-ivory/30 pt-6">
                        <p className="font-body text-base md:text-lg leading-[1.6] max-w-[40ch] text-ivory/90">
                          {service.desc}
                        </p>
                        <p className="font-body text-xs uppercase tracking-[0.2em] text-gold whitespace-nowrap">
                          {service.price}
                        </p>
                      </div>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

          {/* QUIZ INTERACTIVE CALLOUT BANNER */}
          <div className="w-full mt-12 md:mt-16 bg-ecru/80 border border-ink/10 p-8 md:p-12 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="flex flex-col text-center md:text-left">
              <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-2">
                SCOPE ESTIMATOR
              </span>
              <h4 className="font-display text-2xl md:text-3xl text-ink mb-2">
                Which level of service fits your plans?
              </h4>
              <p className="font-body text-sm md:text-base text-ink/75 max-w-xl">
                Share seven details about your celebration to see which starting point most closely matches your scope.
              </p>
            </div>
            <a
              href="/quiz"
              className="shrink-0 bg-ink text-ivory px-8 py-4 font-body text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-ink transition-colors duration-300 shadow-sm"
            >
              Estimate Your Scope →
            </a>
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <Contact />

    </main>
  );
}
