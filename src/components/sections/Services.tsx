"use client";
import { useState } from "react";
import Image from "next/image";

const services = [
  {
    title: "The Full Production",
    desc: "Comprehensive design, custom fabrication, and white-glove execution.",
    price: "Beginning at $55,000",
    image: "/gallery/purple-grandeur/purple-grandeur-01.jpg"
  },
  {
    title: "Design + Florals",
    desc: "Bespoke floral styling and foundational aesthetic direction.",
    price: "Beginning at $20,000",
    image: "/gallery/white-green-botanicals/white-green-botanicals-01.jpeg"
  },
  {
    title: "The Essentials",
    desc: "Our signature floral collections for intimate gatherings.",
    price: "Beginning at $8,000",
    image: "/gallery/two-tone-luxe/two-tone-luxe-01.jpeg"
  }
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full bg-ivory py-24 md:py-48 px-6 md:px-12" id="services">
      <div className="max-w-[1440px] mx-auto flex flex-col">
        <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4 text-center">INVESTMENTS & SCOPE</div>
        <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-4 text-center">Investments</h2>
        <p className="font-body text-base md:text-lg text-ink/75 text-center max-w-2xl mx-auto mb-12 md:mb-16">
          Every celebration is uniquely architected. Explore our core investment tiers or take our interactive calculator to estimate your scope.
        </p>
        
        {/* DESKTOP VIEW: Sleek Horizontal Expanding Accordion */}
        <div className="hidden md:flex w-full h-[70vh] gap-4">
          {services.map((service, idx) => {
            const isActive = activeIndex === idx;
            
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                aria-pressed={isActive}
                className={`relative flex flex-col justify-end overflow-hidden group cursor-pointer transition-[flex-grow,width] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm ${
                  isActive ? "flex-[3_3_0%] w-[60%]" : "flex-[1_1_0%] w-[20%]"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={service.image} 
                  fill
                  sizes={isActive ? "60vw" : "20vw"}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                  alt={service.title}
                />
                
                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                }`} />

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full">
                  {/* Collapsed State */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-end pb-12 transition-opacity duration-500 delay-100 ${
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}>
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-ink/90 to-transparent pointer-events-none -z-10" />
                    <h3 className="font-display text-3xl xl:text-4xl text-ivory whitespace-nowrap -rotate-90 origin-center absolute bottom-1/2 translate-y-1/2">
                      {service.title}
                    </h3>
                    <div className="font-body text-[7px] uppercase tracking-widest text-ivory mt-auto text-center px-4 w-full">
                      {service.price}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`absolute inset-0 p-12 flex flex-col justify-end transition-all duration-700 ease-out ${
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

        {/* MOBILE VIEW: Expansive Editorial Card with Tier Switcher */}
        <div className="flex md:hidden flex-col w-full">
          {/* Mobile Tier Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none snap-x">
            {services.map((service, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`snap-start shrink-0 px-4 py-2.5 rounded-full font-body text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                    isActive 
                      ? "bg-ink text-ivory shadow-md font-semibold border border-ink" 
                      : "bg-ecru/80 text-ink/70 hover:text-ink border border-ink/10"
                  }`}
                >
                  {service.title}
                </button>
              );
            })}
          </div>

          {/* Expansive Active Tier Showcase Card */}
          <div className="relative w-full min-h-[480px] rounded-2xl overflow-hidden shadow-xl border border-ink/10 bg-ink flex flex-col justify-end p-7 mt-2">
            {/* Background Image with Transition */}
            <Image
              key={activeIndex}
              src={services[activeIndex].image}
              fill
              sizes="100vw"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
              alt={services[activeIndex].title}
            />

            {/* Dark Gradient Overlay for Maximum Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                  TIER 0{activeIndex + 1} OF 03
                </span>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/80 px-3 py-1 rounded-full bg-ivory/10 backdrop-blur-xs border border-ivory/20">
                  {services[activeIndex].price}
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl text-ivory mb-3 leading-tight">
                {services[activeIndex].title}
              </h3>

              <p className="font-body text-sm text-ivory/85 leading-relaxed mb-6">
                {services[activeIndex].desc}
              </p>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-ivory/20">
                <a 
                  href="/inquire"
                  className="font-body text-xs uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors flex items-center gap-2"
                >
                  Inquire For This Tier <span>→</span>
                </a>
                
                {/* Navigation Dots */}
                <div className="flex items-center gap-1.5">
                  {services.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Go to tier ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeIndex === i ? "w-6 bg-gold" : "w-1.5 bg-ivory/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
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
  );
}
