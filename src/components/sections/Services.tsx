"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import InvestmentModal from "./InvestmentModal";
import { INVESTMENT_TIERS } from "@/data/investments";

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTierId, setModalTierId] = useState<string | null>(null);
  const mobileTierRailRef = useRef<HTMLDivElement>(null);

  const openModalForTier = (tierId: string) => {
    setModalTierId(tierId);
    setIsModalOpen(true);
  };

  const scrollMobileTiers = () => {
    mobileTierRailRef.current?.scrollBy({ left: 180, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-ivory px-6 py-24 md:px-12 md:py-48" id="services">
      <div className="max-w-[1440px] mx-auto flex flex-col">
        <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4 text-center">INVESTMENTS & SCOPE</div>
        <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-4 text-center">Investments</h2>
        <p className="font-body text-base md:text-lg text-ink/75 text-center max-w-2xl mx-auto mb-12 md:mb-16">
          Every event is tailored to its venue, guest count, and design scope. Click any tier below to explore its comprehensive deliverables and scope.
        </p>
        
        {/* DESKTOP VIEW: Sleek Horizontal Expanding Accordion */}
        <div className="hidden md:flex w-full h-[70vh] gap-4">
          {INVESTMENT_TIERS.map((tier, idx) => {
            const isActive = activeIndex === idx;
            
            return (
              <div
                key={tier.id}
                onClick={() => {
                  if (isActive) {
                    openModalForTier(tier.id);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`relative flex flex-col justify-end overflow-hidden group cursor-pointer transition-[flex-grow,width] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm ${
                  isActive ? "flex-[3_3_0%] w-[60%]" : "flex-[1_1_0%] w-[20%]"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={tier.image} 
                  fill
                  sizes={isActive ? "60vw" : "20vw"}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                  alt={tier.name}
                />
                
                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-50 group-hover:opacity-70"
                }`} />

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full">
                  {/* Collapsed State */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-end pb-12 transition-opacity duration-500 delay-100 ${
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}>
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-ink/90 to-transparent pointer-events-none -z-10" />
                    <h3 className="font-display text-3xl xl:text-4xl text-ivory whitespace-nowrap -rotate-90 origin-center absolute bottom-1/2 translate-y-1/2">
                      {tier.name}
                    </h3>
                    <div className="font-body text-[8px] uppercase tracking-widest text-gold mt-auto text-center px-4 w-full">
                      {tier.price}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`absolute inset-0 p-12 flex flex-col justify-end transition-all duration-700 ease-out ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                        {tier.tierLabel}
                      </span>
                    </div>
                    <h3 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 text-ivory">
                      {tier.name}
                    </h3>
                    
                    <p className="font-display italic text-lg text-gold/90 mb-6">
                      &ldquo;{tier.tagline}&rdquo;
                    </p>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-t border-ivory/30 pt-6">
                      <p className="font-body text-sm md:text-base leading-[1.6] max-w-[42ch] text-ivory/90">
                        {tier.desc}
                      </p>
                      
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        <span className="font-body text-xs uppercase tracking-[0.2em] text-gold font-medium">
                          {tier.price}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModalForTier(tier.id);
                          }}
                          className="px-5 py-2.5 rounded-full bg-ivory/15 hover:bg-gold hover:text-ink text-ivory backdrop-blur-sm border border-ivory/30 font-body text-[11px] uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Explore Full Scope</span>
                          <span className="text-xs">↗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE VIEW: Expansive Editorial Card with Tier Switcher */}
        <div className="flex md:hidden flex-col w-full">
          {/* Mobile Tier Selector Tabs */}
          <div className="relative -mx-1">
            <div ref={mobileTierRailRef} className="flex gap-2 overflow-x-auto pb-4 pl-1 pr-12 scrollbar-none snap-x">
              {INVESTMENT_TIERS.map((tier, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`snap-start shrink-0 px-4 py-2.5 rounded-full font-body text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                      isActive
                        ? "bg-ink text-ivory shadow-md font-semibold border border-ink"
                        : "bg-ecru/80 text-ink/70 hover:text-ink border border-ink/10"
                    }`}
                  >
                    {tier.name}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={scrollMobileTiers}
              aria-label="See more investment tiers"
              className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-ivory text-lg leading-none text-gold shadow-sm transition-colors hover:bg-gold hover:text-ink"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Expansive Active Tier Showcase Card */}
          <div 
            onClick={() => openModalForTier(INVESTMENT_TIERS[activeIndex].id)}
            className="relative w-full min-h-[480px] rounded-2xl overflow-hidden shadow-xl border border-ink/10 bg-ink flex flex-col justify-end p-7 mt-2 cursor-pointer group"
          >
            {/* Background Image with Transition */}
            <Image
              key={activeIndex}
              src={INVESTMENT_TIERS[activeIndex].image}
              fill
              sizes="100vw"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-700"
              alt={INVESTMENT_TIERS[activeIndex].name}
            />

            {/* Dark Gradient Overlay for Maximum Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent" />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                  {INVESTMENT_TIERS[activeIndex].tierLabel}
                </span>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/90 px-3 py-1 rounded-full bg-ivory/10 backdrop-blur-xs border border-ivory/20">
                  {INVESTMENT_TIERS[activeIndex].price}
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl text-ivory mb-2 leading-tight">
                {INVESTMENT_TIERS[activeIndex].name}
              </h3>

              <p className="font-display italic text-sm text-gold/90 mb-3">
                &ldquo;{INVESTMENT_TIERS[activeIndex].tagline}&rdquo;
              </p>

              <p className="font-body text-xs sm:text-sm text-ivory/85 leading-relaxed mb-6">
                {INVESTMENT_TIERS[activeIndex].desc}
              </p>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-ivory/20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModalForTier(INVESTMENT_TIERS[activeIndex].id);
                  }}
                  className="font-body text-xs uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>Explore Full Scope</span>
                  <span>↗</span>
                </button>
                
                {/* Navigation Dots */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {INVESTMENT_TIERS.map((_, i) => (
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

      {/* POPUP MODULE */}
      <InvestmentModal
        isOpen={isModalOpen}
        activeTierId={modalTierId}
        onClose={() => setIsModalOpen(false)}
        onSelectTier={(tierId) => setModalTierId(tierId)}
      />
    </section>
  );
}
