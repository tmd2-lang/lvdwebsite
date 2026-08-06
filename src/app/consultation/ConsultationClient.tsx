"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media-slots";

interface ConsultationFormState {
  dateType: "exact" | "flexible" | "";
  exactDate: string;
  flexibleSeason: string;
  venue: string;
  guestCount: string;
  scopeTier: string;
  name: string;
  partnerName: string;
  email: string;
  phone: string;
  visionNotes: string;
}

const INITIAL_FORM: ConsultationFormState = {
  dateType: "",
  exactDate: "",
  flexibleSeason: "",
  venue: "",
  guestCount: "",
  scopeTier: "",
  name: "",
  partnerName: "",
  email: "",
  phone: "",
  visionNotes: "",
};

const SCOPE_OPTIONS = [
  {
    id: "production",
    label: "Full Spatial & Floral Production",
    price: "From $35,000+",
    tagline: "Total Room Transformation & Artistry",
    desc: "Complete creative direction, ceiling installations, bespoke ceremony arches, luxury floral design, custom fabrication, and turnkey production.",
  },
  {
    id: "design-florals",
    label: "Floral Artistry & Styling",
    price: "From $15,000 – $35,000",
    tagline: "Signature Floral Statements",
    desc: "Elevated ceremony statements, reception centerpieces, personal florals, tablescape styling, and select rental curations.",
  },
  {
    id: "essentials",
    label: "The Essentials",
    price: "From $8,000 – $15,000",
    tagline: "Intimate & Focused Artistry",
    desc: "Considered personal flowers, ceremony focal point, and reception floral styling for intimate celebrations.",
  },
];

export default function ConsultationClient() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top of card on step change
  useEffect(() => {
    setErrorMsg("");
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Keyboard navigation: Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && step > 0 && step < 4) {
        if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
        e.preventDefault();
        handleNextStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleNextStep = () => {
    setErrorMsg("");

    if (step === 1) {
      if (!formData.exactDate && !formData.flexibleSeason) {
        setErrorMsg("Please select your date or a target season to continue.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.venue.trim()) {
        setErrorMsg("Please share your venue name or city.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.scopeTier) {
        setErrorMsg("Please select your anticipated scope tier.");
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    if (step > 0) setStep(step - 1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg("Please provide your name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setStep(5); // Confirmation with Calendly
  };

  const progressPercentage = step === 0 ? 0 : Math.round((step / 4) * 100);

  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col justify-between selection:bg-gold/30 selection:text-ink font-body">
      
      {/* 1. MINIMAL FOCUSED AD HEADER (Zero Distraction Leaks) */}
      <header className="w-full border-b border-ink/10 bg-ivory/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-display italic text-xl sm:text-2xl text-ink tracking-tight hover:text-gold transition-colors"
          >
            Lady Victoria Designs
          </Link>

          {/* Social Proof Trust Pill */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-ink/70 bg-ink/5 px-3 py-1.5 border border-ink/10">
            <span className="text-gold font-bold">★★★★★ 5.0</span>
            <span className="hidden sm:inline">· 54 Verified Reviews</span>
          </div>
        </div>

        {/* Progress Bar (Visible during questions) */}
        {step > 0 && step <= 4 && (
          <div className="w-full max-w-5xl mx-auto mt-3">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-ink/50 mb-1.5 font-medium">
              <span>
                {step === 1 && "Step 01 of 04 · Celebration Date"}
                {step === 2 && "Step 02 of 04 · Venue & Setting"}
                {step === 3 && "Step 03 of 04 · Design Scope"}
                {step === 4 && "Step 04 of 04 · Contact Details"}
              </span>
              <span className="text-gold font-semibold">{progressPercentage}% Complete</span>
            </div>
            <div className="w-full h-[2px] bg-ink/10 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gold transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN INTERACTIVE CARD CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 my-auto">
        <div
          ref={formTopRef}
          className="w-full max-w-3xl bg-white border border-ink/15 shadow-xl p-6 sm:p-10 md:p-14 relative overflow-hidden"
        >

          {/* ============================================================ */}
          {/* STEP 0: THE WELCOME SCREEN                                  */}
          {/* ============================================================ */}
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
                  PRIVATE CONSULTATION INQUIRY
                </span>
                <span className="h-px flex-1 bg-ink/10" />
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15] tracking-tight">
                  Check Date Availability &amp; Request a Consultation
                </h1>
                <p className="font-body text-sm sm:text-base text-ink/75 font-light leading-relaxed max-w-2xl">
                  We accept a curated number of celebrations each season to maintain our uncompromising standard of artistry. Complete this 60-second check to review our studio calendar with Irene.
                </p>
              </div>

              {/* Visual + Social Proof Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-5 bg-ivory border border-ink/10 items-center">
                <div className="sm:col-span-4 relative h-36 sm:h-full min-h-[140px] overflow-hidden">
                  <Image
                    src={media["inquire.hero"]}
                    alt="Lady Victoria Designs Wedding Production"
                    fill
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex items-center gap-1 text-gold text-xs">
                    ★★★★★ <span className="text-ink/60 font-body text-[10px] uppercase tracking-wider ml-1">Verified Client Letter</span>
                  </div>
                  <p className="font-display italic text-sm sm:text-base text-ink/90 leading-snug">
                    &ldquo;Irene completely understood our aesthetic from our very first call. Walking into our ballroom took our breath away.&rdquo;
                  </p>
                  <span className="font-body text-[10px] uppercase tracking-widest text-ink/50 block">
                    — Ashley &amp; Brandon · Meridian House, DC
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-10 py-4.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[11px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-3"
                >
                  <span>Begin Availability Check</span>
                  <span className="text-gold font-normal">→</span>
                </button>
                <span className="font-body text-[11px] text-ink/50">
                  Takes less than 60 seconds · No spam
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: THE DATE                                            */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-bold block mb-2">
                  QUESTION 01
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink mb-2">
                  When is your wedding or celebration?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/60 font-light">
                  If you have a confirmed date, select it below. Otherwise, pick your target season.
                </p>
              </div>

              {/* Exact Date Option */}
              <div className="space-y-2">
                <label className="font-body text-[11px] uppercase tracking-widest text-ink/70 font-semibold block">
                  Exact Date (If Confirmed)
                </label>
                <input
                  type="date"
                  value={formData.exactDate}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      exactDate: e.target.value,
                      flexibleSeason: "",
                      dateType: "exact",
                    });
                  }}
                  className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-ink/10 flex-1" />
                <span className="font-body text-[10px] uppercase tracking-widest text-ink/40">OR SELECT TARGET SEASON</span>
                <div className="h-px bg-ink/10 flex-1" />
              </div>

              {/* Flexible Season Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  "Spring 2025",
                  "Summer 2025",
                  "Fall 2025",
                  "Winter 2025",
                  "Spring 2026",
                  "Summer 2026",
                  "Fall 2026",
                  "2027",
                ].map((season) => {
                  const isSelected = formData.flexibleSeason === season;
                  return (
                    <button
                      key={season}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          flexibleSeason: season,
                          exactDate: "",
                          dateType: "flexible",
                        });
                      }}
                      className={`p-3.5 text-center border font-body text-xs transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-gold bg-gold/10 text-ink font-semibold ring-1 ring-gold"
                          : "border-ink/15 bg-white text-ink/80 hover:border-ink/40"
                      }`}
                    >
                      {season}
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <p className="text-red-700 text-xs font-body italic animate-shake">
                  {errorMsg}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-ink/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: THE VENUE & GUEST COUNT                              */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-bold block mb-2">
                  QUESTION 02
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink mb-2">
                  Where is the celebration taking place?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/60 font-light">
                  Share your venue name, estate, or target city in Washington DC, MD, VA, or destination.
                </p>
              </div>

              {/* Clean Venue Input */}
              <div className="space-y-3">
                <label className="font-body text-[11px] uppercase tracking-widest text-ink/70 font-semibold block">
                  Venue Name or City / Region *
                </label>
                <input
                  type="text"
                  placeholder={
                    formData.venue === "Still Scouting / Venue Undecided"
                      ? "Venue Undecided (Washington DC / MD / VA / Destination)"
                      : "e.g., Meridian House, DC or Salamander Resort, VA"
                  }
                  value={
                    formData.venue === "Still Scouting / Venue Undecided"
                      ? ""
                      : formData.venue
                  }
                  disabled={formData.venue === "Still Scouting / Venue Undecided"}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />

                {/* Undecided / Still Scouting Venue Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      venue:
                        formData.venue === "Still Scouting / Venue Undecided"
                          ? ""
                          : "Still Scouting / Venue Undecided",
                    });
                  }}
                  className={`font-body text-xs flex items-center gap-2.5 cursor-pointer transition-colors py-1 ${
                    formData.venue === "Still Scouting / Venue Undecided"
                      ? "text-ink font-semibold"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] transition-all ${
                      formData.venue === "Still Scouting / Venue Undecided"
                        ? "border-gold bg-gold text-ink font-bold"
                        : "border-ink/30 bg-white"
                    }`}
                  >
                    {formData.venue === "Still Scouting / Venue Undecided" && "✓"}
                  </span>
                  <span>We are still scouting venues / Venue undecided</span>
                </button>
              </div>

              {/* Estimated Guest Count */}
              <div className="space-y-2 pt-2">
                <label className="font-body text-[11px] uppercase tracking-widest text-ink/70 font-semibold block">
                  Anticipated Guest Count (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Under 75", "75 – 150", "150 – 250", "250+ Guests"].map((count) => {
                    const isSelected = formData.guestCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: count })}
                        className={`p-2.5 text-center border font-body text-xs transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-gold bg-gold/15 text-ink font-semibold"
                            : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-700 text-xs font-body italic animate-shake">
                  {errorMsg}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-ink/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: SCOPE & LEVEL OF ARTISTRY                           */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-bold block mb-2">
                  QUESTION 03
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink mb-2">
                  What level of design are you imagining?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/60 font-light">
                  Every celebration is customized. Select the tier that best matches your vision.
                </p>
              </div>

              {/* Scope Option Cards (3 distinct luxury tiers) */}
              <div className="space-y-3.5">
                {SCOPE_OPTIONS.map((option) => {
                  const isSelected = formData.scopeTier === option.label;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setFormData({ ...formData, scopeTier: option.label })}
                      className={`p-5 border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-gold bg-gold/10 ring-1 ring-gold shadow-xs"
                          : "border-ink/15 bg-white hover:border-ink/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                        <h3 className="font-display text-lg sm:text-xl text-ink font-semibold">
                          {option.label}
                        </h3>
                        <span className="font-display italic text-sm text-gold font-medium">
                          {option.price}
                        </span>
                      </div>
                      <p className="font-body text-xs text-ink/75 font-light leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {errorMsg && (
                <p className="text-red-700 text-xs font-body italic animate-shake">
                  {errorMsg}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-ink/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: CONTACT DETAILS                                     */}
          {/* ============================================================ */}
          {step === 4 && (
            <form onSubmit={handleFormSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-bold block mb-2">
                  FINAL STEP
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink mb-2">
                  Who is Irene speaking with?
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/60 font-light">
                  Please provide your contact details to verify studio availability and schedule your private consultation session.
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="client-name" className="font-body text-[10px] uppercase tracking-widest text-ink/70 font-semibold block">
                    Your Full Name *
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="partner-name" className="font-body text-[10px] uppercase tracking-widest text-ink/70 font-semibold block">
                    Partner&rsquo;s Name (Optional)
                  </label>
                  <input
                    id="partner-name"
                    type="text"
                    placeholder="John Smith"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="client-email" className="font-body text-[10px] uppercase tracking-widest text-ink/70 font-semibold block">
                    Email Address *
                  </label>
                  <input
                    id="client-email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="client-phone" className="font-body text-[10px] uppercase tracking-widest text-ink/70 font-semibold block">
                    Phone Number (for SMS &amp; Call Confirmation) *
                  </label>
                  <input
                    id="client-phone"
                    type="tel"
                    required
                    placeholder="(202) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label htmlFor="client-notes" className="font-body text-[10px] uppercase tracking-widest text-ink/70 font-semibold block">
                  Any specific notes or questions for Irene? (Optional)
                </label>
                <textarea
                  id="client-notes"
                  rows={3}
                  placeholder="Tell us about color palettes, floral installations, or any questions you have."
                  value={formData.visionNotes}
                  onChange={(e) => setFormData({ ...formData, visionNotes: e.target.value })}
                  className="w-full bg-ivory border border-ink/20 px-4 py-3.5 text-ink font-body text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {errorMsg && (
                <p className="text-red-700 text-xs font-body italic animate-shake">
                  {errorMsg}
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[11px] uppercase tracking-[0.25em] font-semibold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Availability...</span>
                  ) : (
                    <>
                      <span>Submit &amp; Schedule Session</span>
                      <span className="text-gold">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 5: CONFIRMATION & EMBEDDED CALENDLY SCHEDULER           */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="text-center py-4 sm:py-6 space-y-8 animate-in zoom-in-95 duration-400">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold text-2xl">
                ✓
              </div>

              <div className="space-y-2">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">
                  INQUIRY RECEIVED
                </span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
                  Thank You, {formData.name.split(" ")[0] || "Friend"}
                </h2>
                <p className="font-body text-sm sm:text-base text-ink/75 max-w-xl mx-auto font-light leading-relaxed pt-2">
                  Your celebration details have been received for{" "}
                  <strong className="text-ink font-semibold">
                    {formData.exactDate || formData.flexibleSeason || "your celebration"}
                  </strong>{" "}
                  at{" "}
                  <strong className="text-ink font-semibold">
                    {formData.venue || "your venue"}
                  </strong>.
                </p>
              </div>

              {/* CALENDLY EMBED CARD */}
              <div className="w-full bg-ivory border border-ink/15 p-4 sm:p-8 text-center space-y-4">
                <div className="space-y-1">
                  <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-bold block">
                    FAST-TRACK YOUR CONSULTATION
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink">
                    Select Your Consultation Time Below
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-ink/70 max-w-md mx-auto font-light leading-relaxed">
                    Pick a 20-minute slot on Irene&rsquo;s calendar to discuss your floral and spatial vision:
                  </p>
                </div>

                {/* Live Calendly Iframe */}
                <div 
                  className="w-full rounded-sm overflow-hidden border border-ink/15 bg-white min-h-[620px] relative shadow-xs"
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
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="font-body text-xs text-ink/60">Prefer opening calendar in a full window?</span>
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
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/gallery"
                  className="w-full sm:w-auto px-8 py-3.5 bg-ink text-ivory hover:bg-gold hover:text-ink font-body text-[10px] uppercase tracking-[0.2em] font-medium transition-colors"
                >
                  Explore Recent Celebrations
                </Link>
                <Link
                  href="/testimonials"
                  className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-ink/20 text-ink hover:bg-ink hover:text-ivory font-body text-[10px] uppercase tracking-[0.2em] transition-colors"
                >
                  Read 54 Client Letters
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3. MINIMAL FOOTER */}
      <footer className="w-full border-t border-ink/10 py-6 px-6 text-center text-ink/40 font-body text-[11px]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Lady Victoria Designs. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Direct studio inquiries:</span>
            <a href="mailto:info@ladyvictoriadesigns.com" className="text-ink/70 hover:text-gold underline">
              info@ladyvictoriadesigns.com
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}
