"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";
import Image from "next/image";
import { media } from "@/lib/media-slots";
import { submitLead } from "@/lib/lead-submit";

type FormData = {
  celebrationType: string;
  date: string;
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

export default function ConsultationClient() {
  const [step, setStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    celebrationType: "",
    date: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Handle GSAP animation between steps
  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-content",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [step]);

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitLead({
        source: "consultation",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        celebrationType: formData.celebrationType,
        date: formData.date,
        venue: formData.venue,
        guestCount: formData.guestCount,
        services: formData.services,
        vision: formData.vision,
        investment: formData.investment,
        referralSource: formData.source,
        payload: formData,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep(6);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIntimateGuestCount = formData.guestCount === "Under 50 Guests";

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col lg:flex-row relative overflow-x-clip font-body">
      
      {/* LEFT SIDE: Sticky Editorial Image with Welcoming Social Proof for Ad Traffic */}
      {step !== 6 && (
        <div className="w-full lg:w-1/2 h-[42vh] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden z-10">
          <Image
            src={media["inquire.hero"]}
            alt="Lady Victoria Designs Luxury Wedding Production"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            fetchPriority="high"
            className="w-full h-full object-cover scale-[1.03]"
          />
          <div className="absolute inset-0 bg-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/50 to-transparent" />

          {/* Top Brand Header */}
          <div className="absolute top-6 left-6 right-6 lg:top-10 lg:left-12 lg:right-12 flex items-center justify-between text-ivory">
            <Link
              href="/"
              className="font-display italic text-lg sm:text-xl lg:text-2xl text-ivory tracking-tight hover:text-gold transition-colors"
            >
              Lady Victoria Designs
            </Link>
            <span className="font-body text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-ivory/70 hidden sm:inline-block">
              Washington D.C. · MD · VA · Destinations
            </span>
          </div>

          {/* Left Column Content: Welcome Headline on Top + Testimonial below */}
          <div className="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-8 lg:bottom-12 lg:left-12 lg:right-12 text-ivory min-w-0 flex flex-col justify-end gap-6">
            
            {/* Primary Welcome & Manifesto (Top) */}
            <div>
              <p className="font-body text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-gold mb-3">
                Welcome to Lady Victoria Designs
              </p>
              
              <h2 className="font-display text-[clamp(2.1rem,3.6vw,3.25rem)] leading-[1.02] tracking-tight text-ivory mb-3 max-w-xl">
                Let’s create something <span className="italic text-gold">unforgettable.</span>
              </h2>

              <p className="font-body text-xs sm:text-sm text-ivory/80 leading-relaxed max-w-lg font-light">
                Led by Irene, our studio brings floral design, atmosphere, and full-scale spatial production into one seamless vision—accepting a limited number of celebrations each season to ensure undivided creative focus for every couple.
              </p>
            </div>

            {/* Testimonial & Social Proof (Bottom) */}
            <div className="pt-5 border-t border-ivory/15 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">
                <span>★★★★★ 5.0</span>
                <span className="text-ivory/40">·</span>
                <span className="text-ivory/80">54 Verified Reviews</span>
              </div>
              <p className="font-display italic text-sm sm:text-base text-ivory/90 leading-snug">
                &ldquo;Every detail from the flowers to the lighting was completely unforgettable.&rdquo;
              </p>
              <span className="font-body text-[10px] uppercase tracking-widest text-ivory/50">
                — Nicole · Meridian House, Washington D.C.
              </span>
            </div>

          </div>
        </div>
      )}

      {/* RIGHT SIDE (OR FULL SCREEN ON CONFIRMATION): The Form */}
      <div className={`w-full ${step === 6 ? "lg:w-full max-w-[1100px] mx-auto" : "lg:w-1/2"} flex justify-center items-center pt-16 sm:pt-20 lg:pt-24 pb-16 px-6 sm:px-10 lg:px-16 z-20 min-h-[60vh]`}>
        <div ref={containerRef} className={`w-full ${step === 6 ? "max-w-[960px]" : "max-w-[580px]"} relative`}>
          
          {/* Progress & Intro Bar for Steps 1 - 5 */}
          {step < 6 && (
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between gap-4 pb-2.5 text-ink/50 border-b border-ink/10">
                <span className="font-body text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Date Availability &amp; Consultation
                </span>
                <span className="font-body text-[10px] font-semibold tracking-[0.2em] text-ink/60">
                  0{step} / 05
                </span>
              </div>
              <div className="h-[2px] w-full bg-ink/10 mt-[-1px]" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
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
              <div className="mb-8 sm:mb-10">
                <span className="text-gold font-display text-lg mb-2 block">01</span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-3 leading-tight">
                  What are we celebrating?
                </h1>
                <p className="font-body text-xs sm:text-sm text-ink/70 leading-relaxed">
                  Let’s see if your date is available with Irene. Choose the closest fit for your event to get started.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
                {[
                  { id: "wedding", title: "Wedding", desc: "Ceremony & reception production" },
                  { id: "private", title: "Private celebration", desc: "Milestone, dinner, or social event" },
                  { id: "corporate", title: "Corporate / Gala", desc: "Brand gala, dinner, or fundraiser" },
                  { id: "other", title: "Something else", desc: "Tell us what you have in mind" },
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setFormData((prev) => ({ ...prev, celebrationType: type.title }))}
                    aria-pressed={formData.celebrationType === type.title}
                    className={`relative border p-5 text-left cursor-pointer transition-all duration-300 rounded-sm flex flex-col justify-between ${
                      formData.celebrationType === type.title
                        ? "border-ink bg-ink/5 shadow-xs"
                        : "border-ink/20 hover:border-ink/50 bg-white/50"
                    }`}
                  >
                    <div className="pr-7 mb-1">
                      <h3 className="font-display text-lg sm:text-xl text-ink mb-1">{type.title}</h3>
                      <p className="font-body text-xs text-ink/60 leading-relaxed">{type.desc}</p>
                    </div>
                    <div
                      className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        formData.celebrationType === type.title ? "border-gold bg-gold/10" : "border-ink/25"
                      }`}
                    >
                      {formData.celebrationType === type.title && (
                        <div className="w-2 h-2 bg-gold rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Magnetic>
                  <button
                    onClick={nextStep}
                    disabled={!formData.celebrationType}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-9 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-ivory flex items-center gap-3 rounded-full cursor-pointer"
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
              <div className="mb-8 sm:mb-10">
                <span className="text-gold font-display text-lg mb-2 block">02</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-3 leading-tight">
                  Where, when, &amp; how many?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70">
                  Estimates are completely fine if your venue or date are still coming together.
                </p>
              </div>

              <div className="flex flex-col gap-7 mb-10">
                {/* Event Date */}
                <div className="flex flex-col gap-1.5 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Target Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-body text-base sm:text-lg text-ink outline-none focus:border-gold transition-colors text-ink/85 focus:text-ink"
                  />
                </div>

                {/* Venue / Location */}
                <div className="flex flex-col gap-1.5 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Venue, Estate, or Target City
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
                    className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-display text-xl sm:text-2xl text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/25"
                    placeholder="e.g. Meridian House, DC or Undecided"
                  />
                </div>

                {/* Guest Count Selector */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                    Estimated Guest Count *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["Under 50 Guests", "50 – 125 Guests", "125 – 200 Guests", "200+ Guests"].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            guestCount: count,
                            investment: prev.guestCount === count ? prev.investment : "",
                          }))
                        }
                        className={`p-3.5 border text-left text-xs font-body transition-all rounded-sm flex items-center justify-between cursor-pointer ${
                          formData.guestCount === count
                            ? "border-ink bg-ink text-ivory shadow-xs"
                            : "border-ink/20 hover:border-ink/50 text-ink bg-white/40"
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
                <button
                  onClick={prevStep}
                  className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button
                    onClick={nextStep}
                    disabled={!formData.guestCount || !formData.date}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-9 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 flex items-center gap-3 rounded-full cursor-pointer"
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
              <div className="mb-8 sm:mb-10">
                <span className="text-gold font-display text-lg mb-2 block">03</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-3 leading-tight">
                  How can we help?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70">
                  Select the services you are exploring for your celebration.
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-10">
                {[
                  "Full event design & production",
                  "Floral design & installations",
                  "Décor, rentals & styling",
                  "I'm not sure yet",
                ].map((service) => (
                  <label
                    key={service}
                    className={`border p-4.5 cursor-pointer transition-all duration-300 flex justify-between items-center rounded-sm ${
                      formData.services.includes(service)
                        ? "border-ink bg-ink/5 shadow-xs"
                        : "border-ink/20 hover:border-ink/50 bg-white/40"
                    }`}
                  >
                    <span className="font-display text-lg sm:text-xl text-ink">{service}</span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <div
                      className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                        formData.services.includes(service) ? "border-ink bg-ink" : "border-ink/30"
                      }`}
                    >
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
                <button
                  onClick={prevStep}
                  className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button
                    onClick={nextStep}
                    disabled={formData.services.length === 0}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-9 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 flex items-center gap-3 rounded-full cursor-pointer"
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
              <div className="mb-8 sm:mb-10">
                <span className="text-gold font-display text-lg mb-2 block">04</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-3 leading-tight">
                  What do you want the room to remember?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70">
                  A few words are enough. We will shape the design details together.
                </p>
              </div>

              <div className="flex flex-col gap-8 mb-10">
                {/* Vision Textarea */}
                <div className="flex flex-col gap-1.5 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    The feeling, colors, or details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.vision}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vision: e.target.value }))}
                    className="w-full bg-ink/5 border border-ink/10 p-3.5 font-body text-sm sm:text-base text-ink outline-none focus:border-gold focus:bg-transparent transition-colors placeholder:text-ink/30 resize-none rounded-sm"
                    placeholder="Candlelit, sculptural, romantic, filled with movement..."
                  />
                </div>

                {/* Investment Budget Selector */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                      Anticipated Floral &amp; Production Investment *
                    </label>
                    {isIntimateGuestCount && (
                      <span className="font-body text-[9px] uppercase tracking-widest text-gold font-semibold bg-gold/10 px-2.5 py-0.5 rounded-full">
                        Intimate Pricing Unlocked
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {(isIntimateGuestCount
                      ? [
                          {
                            tier: "$4,000 – $10,000",
                            label: "Intimate Gathering / Micro-Celebration",
                            sub: "Designed specifically for celebrations under 50 guests",
                          },
                          {
                            tier: "$10,000 – $20,000",
                            label: "Elevated Intimate Styling",
                            sub: "Bespoke ceremony arch + full tablescape installations",
                          },
                          {
                            tier: "$20,000+",
                            label: "Full Production Micro-Experience",
                            sub: "High-touch immersive transformation",
                          },
                        ]
                      : [
                          {
                            tier: "$8,000 – $15,000",
                            label: "The Essentials",
                            sub: "Signature floral styling for intimate focal points",
                          },
                          {
                            tier: "$20,000 – $35,000",
                            label: "Design + Florals",
                            sub: "Bespoke floral architecture & complete aesthetic direction",
                          },
                          {
                            tier: "$35,000 – $55,000",
                            label: "Elevated Production",
                            sub: "Grand floral arches, focal installations & ambient styling",
                          },
                          {
                            tier: "$55,000+",
                            label: "The Full Production",
                            sub: "Comprehensive custom fabrication & white-glove execution",
                          },
                        ]
                    ).map((item) => (
                      <button
                        type="button"
                        key={item.tier}
                        onClick={() => setFormData((prev) => ({ ...prev, investment: item.tier }))}
                        aria-pressed={formData.investment === item.tier}
                        className={`p-3.5 rounded-sm border text-left transition-all flex items-center justify-between cursor-pointer ${
                          formData.investment === item.tier
                            ? "border-ink bg-ink text-ivory shadow-xs"
                            : "border-ink/20 text-ink hover:border-ink/60 bg-white/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-display text-base sm:text-lg ${
                                formData.investment === item.tier ? "text-gold" : "text-ink font-semibold"
                              }`}
                            >
                              {item.tier}
                            </span>
                            <span className="font-body text-xs opacity-75">· {item.label}</span>
                          </div>
                          <p
                            className={`font-body text-[11px] mt-0.5 ${
                              formData.investment === item.tier ? "text-ivory/70" : "text-ink/55"
                            }`}
                          >
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
                <button
                  onClick={prevStep}
                  className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button
                    onClick={nextStep}
                    disabled={!formData.investment}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-9 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 flex items-center gap-3 rounded-full cursor-pointer"
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
              <div className="mb-8 sm:mb-10">
                <span className="text-gold font-display text-lg mb-2 block">05</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-3 leading-tight">
                  Where should we send your consultation details?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70">
                  Irene will review your celebration vision and open her private booking calendar next.
                </p>
              </div>

              <form onSubmit={submitForm} className="flex flex-col gap-6 mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Your Name(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nicole & Alexander"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-display text-xl text-ink outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-body text-base sm:text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/25"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-body text-base sm:text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/25"
                      placeholder="(202) 555-0123"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 relative group">
                    <label htmlFor="consultation-source" className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      How did you find us?
                    </label>
                    <select
                      id="consultation-source"
                      value={formData.source}
                      onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                      className="w-full bg-transparent border-b border-ink/20 pb-2.5 font-body text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Select one...</option>
                      <option value="instagram-ad">Instagram Ad</option>
                      <option value="facebook-ad">Facebook Ad</option>
                      <option value="google-ad">Google Search</option>
                      <option value="planner-referral">Planner or Venue Referral</option>
                      <option value="word-of-mouth">Word of Mouth / Friend</option>
                      <option value="weddingwire-theknot">WeddingWire / The Knot</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {submitError && (
                  <p className="font-body text-xs text-red-700 bg-red-50 border border-red-100 px-4 py-3" role="alert">
                    {submitError}
                  </p>
                )}

                <div className="flex justify-between items-center mt-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>←</span> Back
                  </button>
                  <Magnetic>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-9 py-4 hover:bg-gold hover:text-ink transition-colors flex items-center gap-3 rounded-full shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isSubmitting ? "Submitting..." : "Verify Date & Schedule Session"} <span className="text-sm">↗</span>
                    </button>
                  </Magnetic>
                </div>
                <p className="font-body text-[9px] text-ink/50 text-right mt-[-6px]">
                  🔒 Your details remain strictly confidential with Irene and our studio.
                </p>
              </form>
            </div>
          )}

          {/* STEP 6: Full-Screen Confirmation & Direct Calendly Booking */}
          {step === 6 && (
            <div aria-live="polite" className="step-content flex flex-col items-center justify-center text-center w-full py-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-5">
                <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
                  Date Check Received
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-3 leading-tight">
                Thank you, {formData.name.split(" ")[0] || "Friend"}.
              </h1>

              <p className="font-body text-sm sm:text-base md:text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed mb-8">
                Your celebration details have been received. We accept a limited number of events each season, and we would love to connect with you.
              </p>

              {/* Direct Booking Card with Calendly Embed */}
              <div className="w-full bg-ecru/50 border border-ink/10 rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl mb-10 text-center">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
                  FAST-TRACK YOUR CONSULTATION
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
                  Select Your Private Design Session Time
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70 max-w-xl mx-auto mb-6 leading-relaxed">
                  Reserve a 20-minute design consultation directly on Irene’s private calendar below:
                </p>

                {/* Embedded Calendly Scheduler */}
                <div 
                  className="w-full rounded-xl overflow-hidden shadow-inner border border-ink/10 bg-ivory min-h-[620px] relative"
                  data-lenis-prevent
                >
                  <iframe
                    src="https://calendly.com/ladyvictoriadesigns"
                    title="Schedule Consultation with Irene"
                    className="w-full h-[650px] border-0"
                    data-lenis-prevent
                  />
                </div>

                {/* Direct Link Fallback */}
                <div className="mt-5 flex items-center justify-center gap-2">
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
                  className="w-full sm:w-auto bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold hover:text-ink transition-colors rounded-full"
                >
                  Explore Recent Celebrations
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto border border-ink/20 text-ink font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:border-ink transition-colors rounded-full"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
