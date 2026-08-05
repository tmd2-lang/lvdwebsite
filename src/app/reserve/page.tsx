"use client";

import React, { useRef, useState } from "react";
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

export default function ReservePage() {
  const portfolioRailRef = useRef<HTMLDivElement>(null);
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

  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue =
    (formData.date.trim().length > 0 || formData.dateUndecided) &&
    formData.guestCount.length > 0 &&
    formData.budget.length > 0;

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
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const continueToContact = () => {
    if (!canContinue) return;
    setFormStep(2);
    window.requestAnimationFrame(scrollToForm);
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
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/62 via-ink/22 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/48 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />

        <header className="absolute inset-x-0 top-0 z-20 flex justify-center px-6 py-7 sm:py-8">
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
            <h1 className="font-display text-[clamp(3.25rem,6vw,6.5rem)] leading-[0.92] tracking-tight text-ivory">
              Wedding design, <span className="italic">reimagined.</span>
            </h1>

            <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-ivory/88 sm:text-lg">
              Florals, atmosphere, and artful direction for celebrations with a point of view.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <button
                onClick={scrollToForm}
                className="border-b border-ivory/70 pb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                Inquire About Your Date
              </button>

              <Link
                href="/quiz"
                className="border-b border-ivory/45 pb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/85 transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                Estimate Your Investment
              </Link>
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

          <p className="font-display text-[clamp(2.15rem,4.25vw,4.9rem)] leading-[1.04] tracking-tight text-ink">
            Lady Victoria Designs creates weddings that feel{" "}
            <span className="italic">deeply personal</span>, beautifully
            composed, and impossible to forget. Led by Irene, our work brings
            floral design, atmosphere, styling, and event direction into{" "}
            <span className="italic">one considered vision</span>, so every
            detail feels intentional from the first impression to the final
            toast.
          </p>
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

        <div className="pointer-events-none absolute inset-x-0 -bottom-[5svh] top-[16svh] z-10 flex">
          <p
            aria-hidden="true"
            data-sticky-mark
            className="sticky bottom-[-5svh] mt-auto w-full px-6 font-display text-[clamp(9rem,25vw,28rem)] leading-[0.7] tracking-[-0.09em] text-ivory sm:px-10 md:px-12"
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
      <section className="w-full bg-ink text-ivory py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          
          <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-6">
            WHAT OUR COUPLES SAY
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 text-left">
            <div className="bg-ivory/[0.04] border border-ivory/10 p-8 rounded-xl flex flex-col justify-between">
              <p className="font-display italic text-lg sm:text-xl text-ivory/90 leading-relaxed mb-6">
                &ldquo;Working with Irene for my wedding was the best decision we made! From day one, the level of professionalism and design recommendations was unmatched. On the day of, everything was beautiful beyond our imagination.&rdquo;
              </p>
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-gold font-semibold">Nicole</p>
                <p className="font-body text-[11px] text-ivory/50">WeddingWire Verified Bride</p>
              </div>
            </div>

            <div className="bg-ivory/[0.04] border border-ivory/10 p-8 rounded-xl flex flex-col justify-between">
              <p className="font-display italic text-lg sm:text-xl text-ivory/90 leading-relaxed mb-6">
                &ldquo;Irene took our loose ideas and Pinterest boards and completely exceeded our expectations. She was poised, kind, and brought true artistry to every floral piece.&rdquo;
              </p>
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-gold font-semibold">Amber &amp; Kendall</p>
                <p className="font-body text-[11px] text-ivory/50">Meridian House Celebration</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. TWO-STEP DATE AVAILABILITY FORM */}
      <section
        id="reserve-form"
        className="w-full bg-ivory px-6 py-20 scroll-mt-10 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[920px]">
          <div className="mb-12 grid gap-7 border-b border-ink/15 pb-10 md:grid-cols-[180px_1fr] md:gap-12 md:pb-12">
            <p className="pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Your Date
            </p>
            <div>
              <h2 className="font-display text-[clamp(2.8rem,5.5vw,5.6rem)] leading-[0.95] tracking-tight text-ink">
                Let&rsquo;s see if your date is <span className="italic">available.</span>
              </h2>
              <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-ink/65 sm:text-base">
                Share a few details and Irene will personally follow up within one to two business days.
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="animate-fade-in border-b border-ink/15 pb-14 pt-3 text-center sm:pb-20 sm:pt-8">
              <span className="mx-auto mb-7 flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 font-display text-xl text-gold">
                ✓
              </span>
              <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
                Date Request Received
              </p>
              <h3 className="font-display text-4xl text-ink sm:text-5xl">
                Thank you. <span className="italic">We&rsquo;ll be in touch.</span>
              </h3>
              <p className="mx-auto mb-9 mt-5 max-w-xl font-body text-sm leading-relaxed text-ink/65 sm:text-base">
                Irene will review your celebration details and reply with availability and next steps within one to two business days.
              </p>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 border-b border-ink/45 pb-1 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-gold sm:text-[11px]"
              >
                Browse Our Gallery <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-10 flex items-center gap-5" aria-label={`Step ${formStep} of 2`}>
                <p className="shrink-0 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/55">
                  Step {formStep} of 2
                </p>
                <div className="h-px flex-1 bg-ink/15">
                  <div
                    className="h-px bg-gold transition-[width] duration-500"
                    style={{ width: formStep === 1 ? "50%" : "100%" }}
                  />
                </div>
              </div>

              {formStep === 1 ? (
                <div className="space-y-11 animate-fade-in">
                  <fieldset>
                    <legend className="mb-5 font-display text-2xl text-ink sm:text-3xl">
                      When are you celebrating?
                    </legend>
                    <input
                      type="text"
                      aria-label="Wedding or event date"
                      placeholder="October 2027, or a date if you have one"
                      value={formData.date}
                      disabled={formData.dateUndecided}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 font-body text-xs text-ink/60">
                      <input
                        type="checkbox"
                        checked={formData.dateUndecided}
                        onChange={(e) =>
                          setFormData({ ...formData, dateUndecided: e.target.checked })
                        }
                        className="h-4 w-4 accent-[var(--color-gold)]"
                      />
                      We&rsquo;re still deciding
                    </label>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="reserve-venue"
                      className="mb-2 block font-display text-2xl text-ink sm:text-3xl"
                    >
                      Where will it take place? <span className="font-body text-[10px] uppercase tracking-[0.18em] text-ink/40">Optional</span>
                    </label>
                    <input
                      id="reserve-venue"
                      type="text"
                      placeholder="Venue or city"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                    />
                  </div>

                  <fieldset>
                    <legend className="mb-5 font-display text-2xl text-ink sm:text-3xl">
                      About how many guests?
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {["Under 50", "50–125", "125–200", "200+"].map((option) => (
                        <label
                          key={option}
                          className={`flex min-h-14 cursor-pointer items-center justify-center border px-3 text-center font-body text-xs transition-colors sm:text-sm ${
                            formData.guestCount === option
                              ? "border-ink bg-ink text-ivory"
                              : "border-ink/20 text-ink hover:border-gold hover:text-gold"
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
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-2 font-display text-2xl text-ink sm:text-3xl">
                      What investment feels most aligned?
                    </legend>
                    <p className="mb-5 font-body text-xs leading-relaxed text-ink/50">
                      An estimate is perfectly fine. Final proposals are tailored to your celebration.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["$8,000–$15,000", "The Essentials"],
                        ["$20,000–$35,000", "Design + Florals"],
                        ["$55,000+", "The Full Production"],
                        ["Not sure yet", "I’d like Irene’s guidance"],
                      ].map(([value, detail]) => (
                        <label
                          key={value}
                          className={`flex min-h-20 cursor-pointer items-center justify-between gap-4 border px-5 py-4 transition-colors ${
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
                          <span className="font-display text-xl sm:text-2xl">{value}</span>
                          <span
                            className={`max-w-28 text-right font-body text-[9px] uppercase tracking-[0.14em] ${
                              formData.budget === value ? "text-ivory/55" : "text-ink/40"
                            }`}
                          >
                            {detail}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="flex flex-col items-start justify-between gap-5 border-t border-ink/15 pt-7 sm:flex-row sm:items-center">
                    <p className="font-body text-xs text-ink/45">
                      Takes about one minute. No pressure&mdash;just availability and next steps.
                    </p>
                    <button
                      type="button"
                      onClick={continueToContact}
                      disabled={!canContinue}
                      className="w-full bg-ink px-9 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:text-[11px]"
                    >
                      Continue <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-9 animate-fade-in">
                  <div>
                    <h3 className="font-display text-3xl text-ink sm:text-4xl">
                      Where should we follow up?
                    </h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-ink/55">
                      Just the essentials. Your phone number and vision notes are optional.
                    </p>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <label htmlFor="reserve-names" className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
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
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="reserve-email" className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
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
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reserve-phone" className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                      Phone Number <span className="font-normal text-ink/35">Optional</span>
                    </label>
                    <input
                      id="reserve-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(202) 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                    />
                  </div>

                  <div>
                    <label htmlFor="reserve-notes" className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                      Anything you&rsquo;d like Irene to know? <span className="font-normal text-ink/35">Optional</span>
                    </label>
                    <textarea
                      id="reserve-notes"
                      rows={3}
                      placeholder="A few words about the feeling, setting, or vision you have in mind."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full resize-y border-0 border-b border-ink/25 bg-transparent px-0 py-4 font-body text-base leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                    />
                  </div>

                  <div className="flex flex-col-reverse items-stretch justify-between gap-5 border-t border-ink/15 pt-7 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50 transition-colors hover:text-gold sm:text-left"
                    >
                      <span aria-hidden="true">←</span> Back
                    </button>
                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-ink px-9 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-50 sm:text-[11px]"
                      >
                        {isSubmitting ? "Checking Your Date..." : "Check My Date"}
                      </button>
                      <p className="text-center font-body text-[10px] text-ink/40 sm:text-right">
                        Your details stay private and are never shared.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>

      {/* 8. STUDIO PROMISE */}
      <section className="w-full max-w-4xl mx-auto px-6 mb-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-px bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
            OUR COMMITMENT
          </span>
          <div className="w-12 h-px bg-gold/40" />
        </div>
        <p className="font-body text-sm sm:text-base text-ink/70 leading-relaxed italic max-w-2xl mx-auto">
          &ldquo;To protect the artistry and dedicated attention behind every celebration, our studio accepts a limited number of full-scale productions each season.&rdquo;
        </p>
      </section>

      {/* 9. MINIMAL FOOTER */}
      <footer className="w-full border-t border-ink/10 py-8 px-6 text-center font-body text-xs text-ink/50 bg-ivory">
        <p>© {new Date().getFullYear()} Lady Victoria Designs. All rights reserved.</p>
        <p className="mt-1">
          <Link href="/" className="underline hover:text-gold transition-colors">
            Return to Main Website
          </Link>
        </p>
      </footer>

      {/* 10. STICKY MOBILE CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-ivory/95 backdrop-blur-md border-t border-ink/10 sm:hidden z-40 flex items-center justify-between shadow-2xl">
        <div className="flex flex-col">
          <span className="font-display text-xs text-ink font-semibold">2026/2027 Dates</span>
          <span className="font-body text-[10px] text-gold font-medium">Limited Availability</span>
        </div>
        <button
          onClick={scrollToForm}
          className="px-6 py-2.5 bg-ink text-ivory rounded-full font-body text-[10px] uppercase tracking-widest font-semibold"
        >
          Reserve Date
        </button>
      </div>

    </main>
  );
}
