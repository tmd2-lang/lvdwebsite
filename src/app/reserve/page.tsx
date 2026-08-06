"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";
import { media } from "@/lib/media-slots";
import { INVESTMENT_TIERS } from "@/data/investments";

const portfolioImages = [
  {
    src: media["home.work.1"],
    title: "Aniedi & Ekemini",
    detail: "Reception Design",
  },
  {
    src: media["home.work.2"],
    title: "Bespoke Floral Installation",
    detail: "Floral Artistry",
  },
  {
    src: media["home.work.3"],
    title: "Jenny & Jordan",
    detail: "Wedding Design",
  },
  {
    src: media["home.work.4"],
    title: "Sculptural Celebration",
    detail: "Ceremony Design",
  },
  {
    src: media["home.work.5"],
    title: "Royal Purple Grandeur",
    detail: "Reception Design",
  },
  {
    src: media["home.work.6"],
    title: "Eiserike Wedding",
    detail: "Floral Design",
  },
];

const reserveInvestmentRanges = {
  production: "$55,000+",
  "design-florals": "$20,000–$35,000",
  essentials: "$8,000–$15,000",
} as const;

const reserveInvestmentSummaries = {
  production:
    "Complete creative direction, floral artistry, custom fabrication, rentals, installation, and production management.",
  "design-florals":
    "Cohesive aesthetic direction, bespoke ceremony and reception florals, styling, and select rentals.",
  essentials:
    "Considered personal flowers, ceremony and reception florals, and styling for intimate celebrations.",
} as const;

const memoryCards = [
  {
    id: "handled",
    number: "01",
    front: "Everything felt handled before we even had to ask.",
    back: "From the first conversation to the final candle being lit, Irene made the process feel thoughtful, calm, and completely taken care of.",
    author: "Nicole",
    detail: "WeddingWire Verified Bride",
  },
  {
    id: "personal",
    number: "02",
    front: "It felt like us, just more beautiful than we knew how to imagine.",
    back: "Irene took our loose ideas and Pinterest boards and turned them into a celebration with a point of view, warmth, and real artistry.",
    author: "Amber & Kendall",
    detail: "Meridian House Celebration",
  },
  {
    id: "room",
    number: "03",
    front: "People are still talking about the room.",
    back: "The florals, the tables, the ceremony moment, the way everything worked together. It looked designed, not decorated.",
    author: "M & J",
    detail: "Washington D.C. Wedding",
  },
  {
    id: "presence",
    number: "04",
    front: "We were able to actually be present.",
    back: "On the wedding day, we were not worried about the details. We trusted the team completely, and that changed everything.",
    author: "C & R",
    detail: "Private Estate Celebration",
  },
];

type FormData = {
  celebrationType: string;
  date: string;
  dateUndecided: boolean;
  venue: string;
  guestCount: string;
  services: string[];
  vision: string;
  investment: string;
  name: string;
  email: string;
  phone: string;
  source: string;
};

export default function ReservePage() {
  const portfolioRailRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [activeMemoryCard, setActiveMemoryCard] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    celebrationType: "",
    date: "",
    dateUndecided: false,
    venue: "",
    guestCount: "",
    services: [],
    vision: "",
    investment: "",
    name: "",
    email: "",
    phone: "",
    source: "",
  });

  // Handle GSAP animation between steps
  useEffect(() => {
    if (!formContainerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-content",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }, formContainerRef);
    return () => ctx.revert();
  }, [step]);

  const scrollToForm = () => {
    const el = document.getElementById("reserve-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextStep = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
      setTimeout(() => {
        const el = document.getElementById("reserve-form");
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 0 || rect.top > 250) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }, 50);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reservation Inquiry Submitted:", formData);
    setStep(6);
    setTimeout(() => {
      const el = document.getElementById("reserve-form");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const isIntimateGuestCount = formData.guestCount === "Under 50 Guests";

  const scrollPortfolio = (direction: -1 | 1) => {
    const rail = portfolioRailRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.78,
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center justify-start overflow-x-clip">
      
      {/* 1. FULL-SCREEN HERO */}
      <section className="relative w-full min-h-[100svh] overflow-hidden bg-ink text-ivory">
        <Image
          src="/reserve/reserve-hero.jpeg"
          alt="A refined wedding reception designed with white florals, greenery, candlelight, and gold accents"
          fill
          sizes="100vw"
          className="reserve-hero__image object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/62 via-ink/22 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/48 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />

        <header className="reserve-hero__wordmark absolute inset-x-0 top-0 z-20 flex justify-center px-6 py-7 sm:py-8">
          <Link
            href="/"
            aria-label="Lady Victoria Designs home"
            className="flex flex-col items-center text-center text-ivory transition-colors duration-300 hover:text-gold"
          >
            <span className="font-display text-lg uppercase tracking-[0.2em] sm:text-xl md:text-2xl">
              Lady Victoria <span className="italic font-normal">Designs</span>
            </span>
            <span className="mt-0.5 hidden font-body text-[8px] uppercase tracking-[0.34em] text-ivory/75 sm:block">
              Washington D.C. · Floral &amp; Event Design
            </span>
          </Link>
        </header>

        <div className="relative z-10 flex min-h-[100svh] w-full items-end px-6 pb-14 pt-28 sm:px-10 md:px-12 md:pb-16">
          <div className="max-w-2xl">
            <h1 className="reserve-hero__headline font-display text-[clamp(3.25rem,6vw,6.5rem)] leading-[0.92] tracking-tight text-ivory">
              Wedding design, <span className="italic">reimagined.</span>
            </h1>

            <p className="reserve-hero__copy mt-5 max-w-xl font-body text-base leading-relaxed text-ivory/88 sm:text-lg">
              Florals, atmosphere, and artful direction for celebrations with a point of view.
            </p>

            <div className="reserve-hero__cta mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <button
                onClick={scrollToForm}
                className="border-b border-ivory/70 pb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:border-gold hover:text-gold cursor-pointer"
              >
                Inquire About Your Date
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL STATEMENT & GALLERY RAIL */}
      <section className="w-full bg-ivory px-6 pb-12 pt-16 text-ink sm:pt-20 md:px-12 md:pb-16 md:pt-24">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-[180px_1fr] md:items-start md:gap-12">
          <p className="pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/65">
            The Art of the Occasion
          </p>

          <div>
            <p className="font-display text-[clamp(2.15rem,4.25vw,4.9rem)] leading-[1.04] tracking-tight text-ink">
              Lady Victoria Designs creates weddings that feel{" "}
              <span className="italic">deeply personal</span>, beautifully
              composed, and impossible to forget.
            </p>
            <p className="mt-8 max-w-3xl border-t border-ink/20 pt-6 font-body text-sm leading-relaxed text-ink/65 sm:text-base md:mt-10 md:pt-8 md:text-lg">
              Led by Irene, our work brings floral design, atmosphere, styling,
              and event direction into one considered vision—so every detail
              feels intentional from the first impression to the final toast.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-[1440px] md:mt-20">
          <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
            <h2 className="font-body text-[10px] font-semibold uppercase tracking-[0.26em] text-ink/60">
              Selected Celebrations
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollPortfolio(-1)}
                aria-label="View previous portfolio images"
                className="flex h-11 w-11 items-center justify-center border border-ink/20 font-body text-lg text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollPortfolio(1)}
                aria-label="View next portfolio images"
                className="flex h-11 w-11 items-center justify-center border border-ink/20 font-body text-lg text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory cursor-pointer"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={portfolioRailRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
          >
            {portfolioImages.map((image) => (
              <article
                key={image.src}
                className="min-w-0 shrink-0 basis-[82vw] snap-start sm:basis-[54vw] md:basis-[38vw] lg:basis-[30vw]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ecru">
                  <Image
                    src={image.src}
                    alt={`${image.title} by Lady Victoria Designs`}
                    fill
                    sizes="(max-width: 639px) 82vw, (max-width: 767px) 54vw, (max-width: 1023px) 38vw, 30vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <h3 className="font-body text-xs uppercase tracking-[0.08em] text-ink sm:text-sm">
                    {image.title}
                  </h3>
                  <p className="shrink-0 font-body text-[9px] uppercase tracking-[0.16em] text-ink/50 sm:text-[10px]">
                    {image.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STICKY EDITORIAL IMAGE BREAK */}
      <section
        aria-label="A celebration should feel like no one else's"
        className="relative h-[180svh] w-full bg-ink md:h-[200svh]"
      >
        <Image
          src="/reserve/nac-9090.jpg"
          alt="A transformed reception room with sculptural florals, candlelit tables, and an illuminated ceiling installation"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/14 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />

        <div className="pointer-events-none absolute inset-x-0 bottom-[28svh] top-[5svh] z-10">
          <div
            data-sticky-copy
            className="sticky top-[12svh] px-6 sm:px-10 md:top-[14svh] md:px-12"
          >
            <p className="max-w-5xl font-display text-[clamp(2.9rem,6vw,7rem)] leading-[0.94] tracking-tight text-ivory">
              A celebration should feel like{" "}
              <span className="italic">no one else&apos;s.</span>
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden px-6 sm:px-10 md:px-12">
          <p
            aria-hidden="true"
            className="translate-y-[0.08em] font-display text-[clamp(8rem,22vw,23rem)] leading-[0.72] tracking-[-0.09em] text-ivory"
          >
            LVD
          </p>
        </div>
      </section>

      {/* 4. WAYS TO WORK TOGETHER (INVESTMENT TIERS) */}
      <section className="w-full bg-ivory text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
          <header className="grid gap-8 pb-14 md:grid-cols-[220px_1fr] md:gap-12 md:pb-20">
            <p className="pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold sm:text-xs">
              Ways to Work Together
            </p>

            <div className="max-w-5xl">
              <h2 className="font-display text-[clamp(2.9rem,6vw,6.75rem)] leading-[0.94] tracking-tight">
                Designed around{" "}
                <span className="italic text-gold">your celebration.</span>
              </h2>
              <p className="mt-7 max-w-2xl font-body text-sm leading-relaxed text-ink/68 sm:text-base md:text-lg">
                Every celebration is custom. These ranges offer a starting
                point based on your venue, guest count, floral scope, and
                production needs.
              </p>
            </div>
          </header>

          <div className="border-t border-ink/25">
            {INVESTMENT_TIERS.map((tier) => (
              <article
                key={tier.id}
                className="group grid gap-5 border-b border-ink/20 py-9 transition-colors duration-300 hover:bg-ecru/40 md:grid-cols-[72px_minmax(220px,0.9fr)_minmax(300px,1.25fr)_auto] md:items-center md:gap-8 md:px-4 md:py-12"
              >
                <p className="font-body text-[10px] uppercase tracking-[0.22em] text-ink/45">
                  {tier.tierNumber}
                </p>

                <h3 className="font-display text-3xl leading-none transition-colors duration-300 group-hover:text-gold md:text-4xl lg:text-5xl">
                  {tier.name}
                </h3>

                <p className="max-w-xl font-body text-sm leading-relaxed text-ink/65 md:text-base">
                  {reserveInvestmentSummaries[tier.id]}
                </p>

                <div className="md:min-w-52 md:text-right">
                  <p className="mb-2 font-body text-[9px] uppercase tracking-[0.2em] text-ink/45 sm:text-[10px]">
                    Investment Range
                  </p>
                  <p className="font-display text-2xl leading-none text-ink md:text-3xl">
                    {reserveInvestmentRanges[tier.id]}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-start justify-between gap-7 pt-8 sm:flex-row sm:items-center md:px-4 md:pt-10">
            <p className="max-w-2xl font-body text-xs leading-relaxed text-ink/50 sm:text-sm">
              Final proposals are tailored to the venue, guest count, season,
              and custom production elements selected for your celebration.
            </p>
            <button
              type="button"
              onClick={scrollToForm}
              className="shrink-0 border-b border-ink/45 pb-1 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:border-gold hover:text-gold sm:text-[11px] cursor-pointer"
            >
              Discuss Your Celebration
            </button>
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF & BRIDE REVIEWS (3D FLIP CARDS) */}
      <section className="sticky top-0 z-0 flex min-h-[100vh] w-full items-center bg-ink px-6 py-14 text-ivory md:px-12 lg:py-10 xl:py-16">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col">
          <div className="mb-9 grid gap-7 md:mb-10 md:grid-cols-[220px_1fr] md:gap-12 xl:mb-14">
            <p className="pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold sm:text-xs">
              What They Remember Most
            </p>

            <div>
              <h2 className="max-w-5xl font-display text-[clamp(2.8rem,4.8vw,5.5rem)] leading-[0.92] text-ivory">
                The feeling that stayed after the <span className="italic text-gold">last candle burned.</span>
              </h2>
              <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-ivory/60 sm:text-base">
                A few notes from celebrations where the details mattered, the timing mattered, and the room needed to feel entirely their own.
              </p>
            </div>
          </div>

          <div className="grid auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4 md:auto-cols-[minmax(21rem,1fr)] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
            {memoryCards.map((card) => {
              const isActive = activeMemoryCard === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveMemoryCard(isActive ? null : card.id)}
                  className="group h-[23rem] min-w-0 snap-start [perspective:1400px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ink md:h-[25rem] lg:h-[22rem] xl:h-[24rem] cursor-pointer"
                >
                  <span
                    className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                      isActive ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <span className="absolute inset-0 flex h-full flex-col justify-between rounded-[6px] border border-ivory/10 bg-ivory p-6 text-left text-ink shadow-2xl shadow-black/15 [backface-visibility:hidden] transition-colors duration-300 group-hover:border-gold/60 md:p-7 xl:p-8">
                      <span className="flex items-center justify-between">
                        <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                          Memory {card.number}
                        </span>
                        <span className="font-body text-[10px] uppercase tracking-[0.18em] text-ink/30">
                          Read Note
                        </span>
                      </span>

                      <span className="block font-display text-[clamp(1.75rem,1.85vw,2.45rem)] leading-[1.04] text-ink">
                        &ldquo;{card.front}&rdquo;
                      </span>

                      <span>
                        <span className="block font-display text-2xl italic text-ink">
                          {card.author}
                        </span>
                        <span className="mt-2 block font-body text-[10px] uppercase tracking-[0.18em] text-ink/42">
                          {card.detail}
                        </span>
                      </span>
                    </span>

                    <span className="absolute inset-0 flex h-full flex-col justify-between rounded-[6px] border border-gold/45 bg-ecru p-6 text-left text-ink [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-7 xl:p-8">
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                        Full Note
                      </span>
                      <span className="block font-display text-[clamp(1.45rem,1.6vw,2.1rem)] leading-[1.1] text-ink">
                        &ldquo;{card.back}&rdquo;
                      </span>
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">
                        Tap to return
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FULL INQUIRY & RESERVATION FORM (NON-SPLIT SCREEN) */}
      <section
        id="reserve-form"
        className="w-full bg-ivory text-ink py-20 sm:py-24 md:py-32 px-6 sm:px-10 md:px-12 flex flex-col items-center justify-center relative z-20 border-t border-ink/10"
      >
        {/* Editorial Section Header (visible during inquiry steps) */}
        {step < 6 && (
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="font-body text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-gold mb-3 sm:mb-4">
              Reserve Your Date
            </p>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,4.25rem)] leading-[0.96] tracking-tight text-ink">
              Let’s create something <span className="italic text-gold">unforgettable.</span>
            </h2>
            <p className="mt-4 sm:mt-5 font-body text-xs sm:text-sm md:text-base leading-relaxed text-ink/65 max-w-lg mx-auto">
              We accept a limited number of celebrations each season to ensure uncompromising focus, artistry, and white-glove execution for every couple.
            </p>
          </div>
        )}

        <div ref={formContainerRef} className={`w-full ${step === 6 ? "max-w-[1000px]" : "max-w-[660px]"} relative mx-auto`}>
          
          {/* Form Progress Bar (Steps 1 - 5) */}
          {step < 6 && (
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between gap-4 pb-3 text-ink/50 border-b border-ink/10">
                <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                  Date Availability &amp; Inquiry
                </span>
                <span className="font-body text-[10px] font-semibold tracking-[0.2em] text-ink/60">
                  0{step} / 05
                </span>
              </div>
              <div className="h-0.5 w-full bg-ink/10 mt-[-1px]" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
                <div
                  className="h-full bg-gold transition-[width] duration-500 ease-out"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Celebration Type */}
          {step === 1 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">01</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">What are we celebrating?</h2>
                <p className="font-body text-sm text-ink/70">Choose the closest fit for your event.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {[
                  { id: "wedding", title: "Wedding", desc: "Ceremony and reception" },
                  { id: "private", title: "Private celebration", desc: "Milestone or social event" },
                  { id: "corporate", title: "Corporate or nonprofit", desc: "Gala, dinner, or brand event" },
                  { id: "other", title: "Something else", desc: "Tell us what you have in mind" }
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setFormData((prev) => ({ ...prev, celebrationType: type.title }))}
                    aria-pressed={formData.celebrationType === type.title}
                    className={`relative border p-6 text-left cursor-pointer transition-all duration-300 rounded-sm flex flex-col justify-between ${
                      formData.celebrationType === type.title 
                        ? 'border-ink bg-ink/5 shadow-sm' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <div className="pr-8 mb-2">
                      <h3 className="font-display text-xl text-ink mb-1">{type.title}</h3>
                      <p className="font-body text-xs text-ink/60 leading-relaxed">{type.desc}</p>
                    </div>
                    <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      formData.celebrationType === type.title ? 'border-gold bg-gold/10' : 'border-ink/25'
                    }`}>
                      {formData.celebrationType === type.title && <div className="w-2.5 h-2.5 bg-gold rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.celebrationType}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 disabled:hover:bg-ink disabled:hover:text-ivory flex items-center gap-3 rounded-full cursor-pointer"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 2: Date, Venue & Guest Count */}
          {step === 2 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">02</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">Where, when, &amp; how many?</h2>
                <p className="font-body text-sm text-ink/70">Estimates are fine if details are still coming together.</p>
              </div>

              <div className="flex flex-col gap-8 mb-12">
                
                {/* Event Date */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Event Date *
                  </label>
                  <input 
                    type="date" 
                    required={!formData.dateUndecided}
                    disabled={formData.dateUndecided}
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors text-ink/80 focus:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <label className="mt-2 flex w-fit cursor-pointer items-center gap-2.5 font-body text-xs text-ink/55 hover:text-ink transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.dateUndecided || false}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateUndecided: e.target.checked, date: e.target.checked ? "" : prev.date }))}
                      className="h-4 w-4 rounded-sm accent-[var(--color-gold)]"
                    />
                    We&rsquo;re still deciding on the exact date
                  </label>
                </div>
                
                {/* Venue / Location */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Venue or City (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={formData.venue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-2xl text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                    placeholder="e.g. Meridian House, Washington, D.C."
                  />
                </div>

                {/* Guest Count Selector */}
                <div className="flex flex-col gap-3 pt-2">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                    Estimated Guest Count *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Under 50 Guests",
                      "50 – 125 Guests",
                      "125 – 200 Guests",
                      "200+ Guests"
                    ].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          guestCount: count,
                          investment: prev.guestCount === count ? prev.investment : ""
                        }))}
                        className={`p-4 border text-left text-xs font-body transition-all rounded-sm flex items-center justify-between cursor-pointer ${
                          formData.guestCount === count
                            ? 'border-ink bg-ink text-ivory shadow-sm'
                            : 'border-ink/20 hover:border-ink/50 text-ink bg-ivory'
                        }`}
                      >
                        <span className="font-medium">{count}</span>
                        {formData.guestCount === count && <span className="text-gold text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.guestCount || (!formData.date && !formData.dateUndecided)}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full cursor-pointer"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 3: Services */}
          {step === 3 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">03</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">How can we help?</h2>
                <p className="font-body text-sm text-ink/70">Select all that apply.</p>
              </div>

              <div className="flex flex-col gap-3 mb-12">
                {[
                  "Full event design & production",
                  "Floral design & installations",
                  "Décor, rentals & styling",
                  "I'm not sure yet"
                ].map((service) => (
                  <label 
                    key={service}
                    className={`border p-5 cursor-pointer transition-all duration-300 flex justify-between items-center rounded-sm ${
                      formData.services.includes(service)
                        ? 'border-ink bg-ink/5 shadow-sm' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <span className="font-display text-xl text-ink">{service}</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                      formData.services.includes(service) ? 'border-ink bg-ink' : 'border-ink/30'
                    }`}>
                      {formData.services.includes(service) && (
                        <svg className="w-3 h-3 text-ivory" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={formData.services.length === 0}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full cursor-pointer"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 4: Vision & Dynamic Investment */}
          {step === 4 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">04</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">What do you want the room to remember?</h2>
                <p className="font-body text-sm text-ink/70">A few words are enough. We will develop the details together.</p>
              </div>

              <div className="flex flex-col gap-10 mb-12">
                
                {/* Vision Textarea */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    The feeling, colors, or details (Optional)
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.vision}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vision: e.target.value }))}
                    className="w-full bg-ink/5 border border-ink/10 p-4 font-body text-base text-ink outline-none focus:border-gold focus:bg-transparent transition-colors placeholder:text-ink/30 resize-none rounded-sm"
                    placeholder="Candlelit, sculptural, romantic, filled with movement..."
                  />
                </div>

                {/* Investment Budget Selector (Dynamic based on Guest Count) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                      Anticipated Floral &amp; Production Investment *
                    </label>
                    {isIntimateGuestCount && (
                      <span className="font-body text-[9px] uppercase tracking-widest text-gold font-semibold bg-gold/10 px-2.5 py-0.5 rounded-full">
                        Intimate Event Pricing Unlocked
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {(isIntimateGuestCount
                      ? [
                          { tier: "$4,000 – $10,000", label: "Intimate Gathering / Micro-Celebration", sub: "Designed specifically for gatherings under 50 guests" },
                          { tier: "$10,000 – $20,000", label: "Elevated Intimate Styling", sub: "Bespoke ceremony arch + full tablescape installations" },
                          { tier: "$20,000+", label: "Full Production Micro-Experience", sub: "High-touch immersive transformation" }
                        ]
                      : [
                          { tier: "$8,000 – $15,000", label: "The Essentials", sub: "Signature floral styling for intimate gatherings" },
                          { tier: "$20,000 – $35,000", label: "Design + Florals", sub: "Bespoke floral architecture & complete aesthetic direction" },
                          { tier: "$35,000 – $55,000", label: "Elevated Production", sub: "Grand floral arches, focal installations & ambient styling" },
                          { tier: "$55,000+", label: "The Full Production", sub: "Comprehensive custom fabrication & white-glove execution" }
                        ]
                    ).map((item) => (
                      <button
                        type="button"
                        key={item.tier}
                        onClick={() => setFormData((prev) => ({ ...prev, investment: item.tier }))}
                        aria-pressed={formData.investment === item.tier}
                        className={`p-4 rounded-sm border text-left transition-all flex items-center justify-between cursor-pointer ${
                          formData.investment === item.tier 
                            ? 'border-ink bg-ink text-ivory shadow-md' 
                            : 'border-ink/20 text-ink hover:border-ink/60 bg-ivory'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-lg ${formData.investment === item.tier ? 'text-gold' : 'text-ink font-semibold'}`}>
                              {item.tier}
                            </span>
                            <span className="font-body text-xs opacity-75">· {item.label}</span>
                          </div>
                          <p className={`font-body text-[11px] mt-0.5 ${formData.investment === item.tier ? 'text-ivory/70' : 'text-ink/55'}`}>
                            {item.sub}
                          </p>
                        </div>
                        {formData.investment === item.tier && <span className="text-gold font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.investment}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full cursor-pointer"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 5: Contact Details */}
          {step === 5 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">05</span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">Where should we send your proposal?</h2>
                <p className="font-body text-sm text-ink/70">Irene will review your vision and follow up directly.</p>
              </div>

              <form onSubmit={submitForm} className="flex flex-col gap-8 mb-12">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Your Name(s) *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Nicole & Alexander"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-xl text-ink outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                      placeholder="(202) 555-0123"
                    />
                  </div>

                  <div className="flex flex-col gap-2 relative group">
                    <label htmlFor="reserve-inquiry-source" className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      How did you hear about us?
                    </label>
                    <select 
                      id="reserve-inquiry-source"
                      value={formData.source}
                      onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Select one...</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="planner-referral">Planner or Venue Referral</option>
                      <option value="word-of-mouth">Word of Mouth / Friend</option>
                      <option value="google">Google Search</option>
                      <option value="weddingwire-theknot">WeddingWire / The Knot</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button type="button" onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer">
                    <span>←</span> Back
                  </button>
                  <Magnetic>
                    <button 
                      type="submit"
                      className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors flex items-center gap-3 rounded-full shadow-lg cursor-pointer"
                    >
                      Submit Consultation Request <span className="text-sm">↗</span>
                    </button>
                  </Magnetic>
                </div>
                <p className="font-body text-[9px] text-ink/50 text-right mt-[-10px]">
                  🔒 Your details remain strictly confidential with Irene and our team.
                </p>

              </form>
            </div>
          )}

          {/* STEP 6: Full Confirmation & Direct Calendly Booking */}
          {step === 6 && (
            <div aria-live="polite" className="step-content flex flex-col items-center justify-center text-center w-full py-8 animate-fade-in">
              
              {/* Top Thank You Header */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-6">
                <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
                  Your Inquiry Is In
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-4 leading-tight">
                Thank you, {formData.name.split(' ')[0] || "Friend"}.
              </h2>

              <p className="font-body text-base md:text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed mb-10">
                Your celebration details have been sent to Irene and our team. We will review your date and venue and reach out within 24 to 48 hours.
              </p>

              {/* Direct Booking Card with Calendly Embed */}
              <div className="w-full bg-ecru/50 border border-ink/10 rounded-2xl p-6 sm:p-10 shadow-xl mb-12 text-center">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
                  FAST-TRACK YOUR CONSULTATION
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-ink mb-3">
                  Schedule Your Private Design Session Now
                </h3>
                <p className="font-body text-xs sm:text-sm text-ink/70 max-w-xl mx-auto mb-8 leading-relaxed">
                  If you are ready to explore your date and aesthetic vision right away, select a 20-minute consultation slot on Irene’s private calendar below:
                </p>

                {/* Embedded Calendly Scheduler */}
                <div className="w-full rounded-xl overflow-hidden shadow-inner border border-ink/10 bg-ivory min-h-[620px] relative">
                  <iframe
                    src="https://calendly.com/ladyvictoriadesigns"
                    title="Schedule Consultation with Irene"
                    className="w-full h-[650px] border-0"
                  />
                </div>

                {/* Direct Link Fallback */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="font-body text-xs text-ink/60">Prefer opening in a new tab?</span>
                  <a
                    href="https://calendly.com/ladyvictoriadesigns"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs uppercase tracking-widest text-gold font-semibold underline hover:text-ink transition-colors"
                  >
                    Open Calendar Full Screen ↗
                  </a>
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link 
                  href="/gallery" 
                  className="w-full sm:w-auto bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold hover:text-ink transition-colors rounded-full text-center"
                >
                  Explore Our Work
                </Link>
                <Link 
                  href="/" 
                  className="w-full sm:w-auto border border-ink/20 text-ink font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:border-ink transition-colors rounded-full text-center"
                >
                  Return to Home
                </Link>
              </div>

            </div>
          )}

        </div>
      </section>

    </main>
  );
}
