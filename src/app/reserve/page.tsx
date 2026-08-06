"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

export default function ReservePage() {
  const portfolioRailRef = useRef<HTMLDivElement>(null);
  const reserveFormRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    names: "",
    email: "",
    phone: "",
    date: "",
    dateUndecided: false,
    venue: "",
    guestCount: "",
    budget: "",
    notes: "",
  });

  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeMemoryCard, setActiveMemoryCard] = useState<string | null>(null);
  const [isTakeoverVisible, setIsTakeoverVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const canAdvance =
    formStep === 1
      ? formData.date.trim().length > 0 || formData.dateUndecided
      : formStep === 2
        ? formData.guestCount.length > 0
        : formStep === 3
          ? formData.budget.length > 0
          : true;

  useEffect(() => {
    const section = reserveFormRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsTakeoverVisible(true);
        observer.disconnect();
      },
      { threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCalendlyOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCalendlyOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendlyOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const scrollToForm = () => {
    const el = document.getElementById("reserve-form");
    if (el) {
      window.scrollTo({
        top: el.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setFormStep(step);
    window.requestAnimationFrame(scrollToForm);
  };

  const continueForm = () => {
    if (!canAdvance || formStep === 4) return;
    goToStep((formStep + 1) as 2 | 3 | 4);
  };

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
                className="border-b border-ivory/70 pb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                Inquire About Your Date
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL STATEMENT */}
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
                className="flex h-11 w-11 items-center justify-center border border-ink/20 font-body text-lg text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollPortfolio(1)}
                aria-label="View next portfolio images"
                className="flex h-11 w-11 items-center justify-center border border-ink/20 font-body text-lg text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory"
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

      {/* 4. STICKY EDITORIAL IMAGE */}
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

      {/* 5. WAYS TO WORK TOGETHER */}
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
              className="shrink-0 border-b border-ink/45 pb-1 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:border-gold hover:text-gold sm:text-[11px]"
            >
              Discuss Your Celebration
            </button>
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF & BRIDE REVIEWS */}
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
                  className="group h-[23rem] min-w-0 snap-start [perspective:1400px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ink md:h-[25rem] lg:h-[22rem] xl:h-[24rem]"
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

      {/* 7. FULL-SCREEN DATE AVAILABILITY EXPERIENCE */}
      <section
        ref={reserveFormRef}
        id="reserve-form"
        className={`reserve-takeover relative z-20 w-full min-h-[100vh] scroll-mt-0 bg-ivory px-6 md:px-12 lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden ${
          isTakeoverVisible ? "is-visible" : ""
        }`}
      >
        <div className="mx-auto flex min-h-[100vh] max-w-[1440px] flex-col py-7 lg:h-full lg:min-h-0 lg:py-6">
          <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-5">
            <Link
              href="/"
              className="font-display text-lg uppercase tracking-[0.16em] text-ink transition-colors hover:text-gold sm:text-xl"
            >
              Lady Victoria <span className="italic font-normal">Designs</span>
            </Link>
            {!isSubmitted && (
              <div className="flex items-center gap-4 sm:gap-8">
                <p className="hidden font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-ink/40 sm:block">
                  Check Your Date
                </p>
                <p className="font-body text-[10px] font-semibold tracking-[0.18em] text-ink/55">
                  {String(formStep).padStart(2, "0")} / 04
                </p>
              </div>
            )}
          </div>

          {isSubmitted ? (
            <div className="flex flex-1 animate-fade-in items-center justify-center py-10 text-center lg:py-6">
              <div className="w-full max-w-4xl">
                <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-gold/35 bg-gold/8 px-5 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  <p className="font-body text-[9px] font-semibold uppercase tracking-[0.26em] text-gold sm:text-[10px]">
                    Your Inquiry Is In
                  </p>
                </div>

                <h2 className="font-display text-[clamp(3.4rem,6.5vw,7rem)] leading-[0.9] text-ink">
                  Thank you{formData.names.trim() ? `, ${formData.names.trim().split(" ")[0]}` : ""}.
                  <span className="block italic">Your date is with us.</span>
                </h2>
                <p className="mx-auto mt-7 max-w-2xl font-body text-sm leading-relaxed text-ink/62 sm:text-base md:text-lg">
                  Irene and the team will review your date, venue, and vision and
                  reply within one to two business days. If you&rsquo;re ready,
                  you can choose a consultation time now.
                </p>

                <div className="mx-auto mt-9 flex max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => setIsCalendlyOpen(true)}
                    className="bg-ink px-8 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold hover:text-ink sm:text-[11px]"
                  >
                    Schedule a Consultation
                  </button>
                  <Link
                    href="/gallery"
                    className="border border-ink/20 px-8 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink sm:text-[11px]"
                  >
                    Explore Our Work
                  </Link>
                </div>

                <p className="mt-7 font-body text-xs leading-relaxed text-ink/45">
                  Still shaping the scope?{" "}
                  <Link
                    href="/quiz"
                    className="border-b border-ink/35 pb-0.5 text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    Take the investment quiz
                  </Link>
                  .
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div
                className="h-px w-full bg-ink/10"
                role="progressbar"
                aria-label={`Step ${formStep} of 4`}
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={formStep}
              >
                <div
                  className="h-px bg-gold transition-[width] duration-500"
                  style={{ width: `${formStep * 25}%` }}
                />
              </div>

              <div className="flex flex-1 items-center py-10 lg:min-h-0 lg:py-6">
                {formStep === 1 && (
                  <div className="w-full animate-fade-in">
                    <p className="mb-5 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                      01 · The Date
                    </p>
                    <h2 className="max-w-5xl font-display text-[clamp(3.8rem,7.5vw,8rem)] leading-[0.88] tracking-tight text-ink">
                      When are you <span className="italic">celebrating?</span>
                    </h2>
                    <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-ink/55 sm:text-base">
                      A season or approximate month is completely fine.
                    </p>

                    <div className="mt-10 grid gap-9 md:grid-cols-2 md:gap-16 lg:mt-12">
                      <fieldset>
                        <legend className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Wedding or Event Date
                        </legend>
                        <input
                          type="text"
                          aria-label="Wedding or event date"
                          placeholder="October 2027, or a date"
                          value={formData.date}
                          disabled={formData.dateUndecided}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-2xl text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold disabled:cursor-not-allowed disabled:opacity-35 sm:text-3xl lg:text-4xl"
                        />
                        <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 font-body text-xs text-ink/55">
                          <input
                            type="checkbox"
                            checked={formData.dateUndecided}
                            onChange={(e) => setFormData({ ...formData, dateUndecided: e.target.checked })}
                            className="h-5 w-5 accent-[var(--color-gold)]"
                          />
                          We&rsquo;re still deciding
                        </label>
                      </fieldset>

                      <div>
                        <label htmlFor="reserve-venue" className="mb-3 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Venue or City <span className="font-normal text-ink/30">Optional</span>
                        </label>
                        <input
                          id="reserve-venue"
                          type="text"
                          placeholder="Meridian House, Washington D.C."
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-2xl text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold sm:text-3xl lg:text-4xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <fieldset className="w-full animate-fade-in">
                    <legend className="sr-only">About how many guests?</legend>
                    <p className="mb-5 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                      02 · The Gathering
                    </p>
                    <h2 className="max-w-5xl font-display text-[clamp(3.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight text-ink">
                      How many people are you <span className="italic">celebrating with?</span>
                    </h2>
                    <div className="mt-10 grid grid-cols-2 gap-3 lg:mt-12 lg:grid-cols-4">
                      {["Under 50", "50–125", "125–200", "200+"].map((option, index) => (
                        <label
                          key={option}
                          className={`group flex min-h-32 cursor-pointer flex-col justify-between border p-5 transition-all sm:min-h-40 sm:p-7 lg:min-h-48 ${
                            formData.guestCount === option
                              ? "border-ink bg-ink text-ivory"
                              : "border-ink/20 text-ink hover:border-gold"
                          }`}
                        >
                          <input
                            type="radio"
                            name="guestCount"
                            value={option}
                            checked={formData.guestCount === option}
                            onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                            className="sr-only"
                          />
                          <span className={`font-body text-[9px] font-semibold tracking-[0.18em] ${formData.guestCount === option ? "text-ivory/45" : "text-ink/35"}`}>
                            0{index + 1}
                          </span>
                          <span className="font-display text-2xl sm:text-3xl lg:text-4xl">{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {formStep === 3 && (
                  <fieldset className="w-full animate-fade-in">
                    <legend className="sr-only">What investment feels most aligned?</legend>
                    <p className="mb-5 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                      03 · The Investment
                    </p>
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                      <h2 className="max-w-4xl font-display text-[clamp(3.5rem,6.3vw,6.8rem)] leading-[0.9] tracking-tight text-ink">
                        What investment feels most <span className="italic">aligned?</span>
                      </h2>
                      <p className="max-w-sm font-body text-xs leading-relaxed text-ink/50 sm:text-sm">
                        An estimate is perfectly fine. Final proposals are tailored to your celebration.
                      </p>
                    </div>
                    <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:mt-10">
                      {[
                        ["$8,000–$15,000", "The Essentials"],
                        ["$20,000–$35,000", "Design + Florals"],
                        ["$55,000+", "The Full Production"],
                        ["Not sure yet", "I’d like Irene’s guidance"],
                      ].map(([value, detail], index) => (
                        <label
                          key={value}
                          className={`flex min-h-24 cursor-pointer items-center justify-between gap-6 border px-5 py-4 transition-all sm:min-h-28 sm:px-7 ${
                            formData.budget === value
                              ? "border-ink bg-ink text-ivory"
                              : "border-ink/20 text-ink hover:border-gold"
                          }`}
                        >
                          <input
                            type="radio"
                            name="budget"
                            value={value}
                            checked={formData.budget === value}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className="sr-only"
                          />
                          <div>
                            <span className={`mb-2 block font-body text-[8px] font-semibold tracking-[0.18em] ${formData.budget === value ? "text-ivory/40" : "text-ink/30"}`}>
                              0{index + 1}
                            </span>
                            <span className="font-display text-2xl sm:text-3xl lg:text-4xl">{value}</span>
                          </div>
                          <span className={`max-w-36 text-right font-body text-[9px] uppercase tracking-[0.16em] ${formData.budget === value ? "text-ivory/50" : "text-ink/40"}`}>
                            {detail}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {formStep === 4 && (
                  <div className="w-full animate-fade-in">
                    <p className="mb-4 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                      04 · The Introduction
                    </p>
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                      <h2 className="max-w-4xl font-display text-[clamp(3.2rem,5.8vw,6.2rem)] leading-[0.9] tracking-tight text-ink">
                        Where should we send your <span className="italic">availability?</span>
                      </h2>
                      <p className="font-body text-xs text-ink/45">Phone and vision notes are optional.</p>
                    </div>

                    <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label htmlFor="reserve-names" className="mb-2 block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Your Name(s) <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="reserve-names"
                          type="text"
                          autoComplete="name"
                          required
                          placeholder="Victoria & Alexander"
                          value={formData.names}
                          onChange={(e) => setFormData({ ...formData, names: e.target.value })}
                          className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-xl text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold sm:text-2xl"
                        />
                      </div>
                      <div>
                        <label htmlFor="reserve-email" className="mb-2 block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Email Address <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="reserve-email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="victoria@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-xl text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold sm:text-2xl"
                        />
                      </div>
                      <div>
                        <label htmlFor="reserve-phone" className="mb-2 block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Phone Number <span className="font-normal text-ink/30">Optional</span>
                        </label>
                        <input
                          id="reserve-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="(202) 555-0199"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-xl text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold sm:text-2xl"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label htmlFor="reserve-notes" className="mb-2 block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                          Anything you&rsquo;d like Irene to know? <span className="font-normal text-ink/30">Optional</span>
                        </label>
                        <textarea
                          id="reserve-notes"
                          rows={2}
                          placeholder="A few words about the feeling, setting, or vision you have in mind."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full resize-none border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-display text-xl leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-gold sm:text-2xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-5 border-t border-ink/15 pt-5">
                <button
                  type="button"
                  onClick={() => formStep > 1 && goToStep((formStep - 1) as 1 | 2 | 3)}
                  disabled={formStep === 1}
                  className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50 transition-colors hover:text-gold disabled:invisible"
                >
                  <span aria-hidden="true">←</span> Back
                </button>

                <div className="flex flex-col items-end gap-2">
                  {formStep < 4 ? (
                    <button
                      type="button"
                      onClick={continueForm}
                      disabled={!canAdvance}
                      className="min-w-44 bg-ink px-9 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-25 sm:text-[11px]"
                    >
                      Continue <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-48 bg-ink px-9 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-50 sm:text-[11px]"
                    >
                      {isSubmitting ? "Checking Your Date..." : "Check My Date"}
                    </button>
                  )}
                  <p className="hidden font-body text-[9px] text-ink/35 sm:block">
                    {formStep === 4 ? "Your details stay private and are never shared." : "About one minute from start to finish."}
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {isCalendlyOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-calendar-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsCalendlyOpen(false);
          }}
        >
          <div className="relative flex h-[min(88dvh,850px)] w-full max-w-5xl flex-col overflow-hidden bg-ivory shadow-2xl">
            <div className="flex items-center justify-between gap-6 border-b border-ink/15 px-5 py-4 sm:px-7">
              <div>
                <p className="mb-1 font-body text-[9px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Next Step
                </p>
                <h2 id="reserve-calendar-title" className="font-display text-2xl text-ink sm:text-3xl">
                  Choose a time with Irene
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendlyOpen(false)}
                aria-label="Close scheduling calendar"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/20 font-body text-xl text-ink transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
              >
                ×
              </button>
            </div>
            <iframe
              src="https://calendly.com/ladyvictoriadesigns"
              title="Schedule a consultation with Irene"
              className="min-h-0 flex-1 border-0 bg-white"
            />
            <div className="border-t border-ink/15 px-5 py-3 text-center sm:px-7">
              <a
                href="https://calendly.com/ladyvictoriadesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/55 transition-colors hover:text-gold"
              >
                Open calendar in a new tab ↗
              </a>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
