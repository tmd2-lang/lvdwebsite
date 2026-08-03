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
    description: "Our signature service. We orchestrate every visual and experiential element of your celebration from the ground up. From structural architecture and custom lighting design to bespoke tablescapes and spatial flow, we ensure your event holds together as one idea from the first sightline to the last dance.",
    scope: "Design & Production",
    includes: "Architecture, Logistics, Timeline",
    image: "/gallery/purple-grandeur/purple-grandeur-01.jpg"
  },
  {
    id: "floral",
    typeLabel: "Artistry",
    title: "Floral Design",
    description: "Florals are the soul of our designs. We source rare, premium blooms globally to craft breathtaking installations. Whether it is a cascading ceiling treatment, a sculptural ceremony arch, or textured, romantic centerpieces, our floral team treats every arrangement as fine art.\n\nBeyond events, we design for the smaller moments. Sympathy arrangements, seasonal bouquets, and custom gifting, treated with the same care as a full installation.",
    scope: "Floristry",
    includes: "Installations, Centerpieces, Gifting",
    image: "/gallery/white-green-botanicals/white-green-botanicals-01.jpeg"
  },
  {
    id: "event-production",
    typeLabel: "Execution",
    title: "Staging & Lighting",
    description: "The part nobody is supposed to notice. Our production team builds and runs the technical side of your event: custom stage wraps, dance floor treatments, drapery and fabric work, and full lighting design. Everything is delivered, installed, and managed by the same crew, which means one team is accountable from load-in to strike.",
    scope: "Technical",
    includes: "Staging, Drapery, Lighting",
    image: "/gallery/amber-kendall/amber-kendall-24.jpeg"
  },
  {
    id: "decor",
    typeLabel: "Curation",
    title: "Décor & Rentals",
    description: "The difference between a beautiful room and a luxury experience lies in the details. We curate an exclusive inventory of high-end linens, artisanal tableware, custom seating, and atmospheric lighting to build a tactile environment that your guests will never forget. Available à la carte or as part of a full commission.",
    scope: "Curation",
    includes: "Tablescapes, Furniture, Linens",
    image: "/gallery/two-tone-luxe/two-tone-luxe-01.jpeg"
  }
];

const designFor = [
  {
    id: "weddings",
    title: "Weddings",
    description: "Ceremony, reception, and everything in between. Our largest commissions and our first love.",
    image: "/gallery/jenny-jordan/jenny-jordan-19.jpeg"
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Branded stages, activations, and gatherings that need to look like the company hosting them.",
    image: "/gallery/r-and-j/r-and-j-01.jpeg"
  },
  {
    id: "private",
    title: "Private Celebrations",
    description: "Milestones, anniversaries, and the parties people talk about for years.",
    image: "/gallery/amber-kendall/amber-kendall-22.jpeg"
  },
  {
    id: "gifting",
    title: "Floral Gifting",
    description: "Sympathy arrangements and seasonal bouquets, designed with the same care as a full installation.",
    image: "/gallery/estate-florals/estate-florals-01.jpeg"
  }
];

const investmentsData = [
  {
    title: "The Full Production",
    desc: "Comprehensive design, custom fabrication, and white-glove execution.",
    price: "FROM $55,000",
    image: "/investments/full-production.jpg"
  },
  {
    title: "Design + Florals",
    desc: "Bespoke floral styling and foundational aesthetic direction.",
    price: "FROM $20,000",
    image: "/investments/design-and-florals.jpeg"
  },
  {
    title: "The Essentials",
    desc: "Our signature floral collections for intimate gatherings.",
    price: "FROM $8,000",
    image: "/investments/the-essentials.jpg"
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
          Lady Victoria Designs is a full-service event design and production company. We specialize in transforming raw spaces into highly curated, immersive environments for the most discerning clientele.
        </p>
      </section>

      {/* VERO-STYLE FLOATING HERO IMAGE */}
      <section className="w-full px-4 md:px-8 flex justify-center bg-ivory">
        <div className="w-full h-[70vh] md:h-[80vh] overflow-hidden floating-hero-image rounded-sm relative">
          <Image
            src="/gallery/white-green-botanicals/white-green-botanicals-04.jpeg"
            alt="Lady Victoria Designs Excellence"
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
          
          return (
            <div key={service.id} className={`w-full flex flex-col-reverse lg:flex-row border-t border-ink/20 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* TEXT HALF */}
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
            Every commission is quoted individually. These are starting points, not packages.
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
                INTERACTIVE INVESTMENT CALCULATOR
              </span>
              <h4 className="font-display text-2xl md:text-3xl text-ink mb-2">
                Not sure what your vision requires?
              </h4>
              <p className="font-body text-sm md:text-base text-ink/75 max-w-xl">
                Answer 7 brief questions about your guest count, venue, and design ambition to find your tailored tier estimate.
              </p>
            </div>
            <a
              href="/quiz"
              className="shrink-0 bg-ink text-ivory px-8 py-4 font-body text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-ink transition-colors duration-300 shadow-sm"
            >
              Take the 2-Minute Quiz →
            </a>
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <Contact />

    </main>
  );
}
