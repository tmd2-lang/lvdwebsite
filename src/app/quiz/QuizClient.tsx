"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const ArrowLeft = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const X = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const CheckCircle2 = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default function QuizClient() {
  const [step, setStep] = useState<number | "results">(0);
  const [score, setScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const questions = [
    {
      id: "guests",
      question: "How many guests are you expecting?",
      options: [
        { label: "Under 75 guests (Intimate)", points: 5 },
        { label: "75–125 guests", points: 10 },
        { label: "125–200 guests", points: 18 },
        { label: "200–300 guests", points: 25 },
        { label: "300+ guests (Grand Celebration)", points: 35 },
      ],
    },
    {
      id: "venue",
      question: "Tell us about your venue.",
      options: [
        { label: "Outdoor garden, private estate, or vineyard", points: 5 },
        { label: "Historic mansion or boutique museum", points: 8 },
        { label: "Luxury hotel ballroom", points: 12 },
        { label: "Industrial loft, warehouse, or modern space", points: 15 },
        { label: "Custom tent or raw blank canvas property", points: 18 },
      ],
    },
    {
      id: "floralStyle",
      question: "Which floral aesthetic speaks to you?",
      options: [
        { label: "Clean & minimal — delicate bud vases, candle styling, refined greenery", points: 5 },
        { label: "Classic & elegant — structured centerpieces, timeless romantic blooms", points: 10 },
        { label: "Lush & organic — textured garden-style with movement and depth", points: 18 },
        { label: "Dramatic & immersive — architectural installations, floral walls, suspended ceiling trusses", points: 28 },
      ],
    },
    {
      id: "ceremony",
      question: "What is your dream ceremony look?",
      options: [
        { label: "Keep it simple — let the natural venue architecture shine", points: 3 },
        { label: "A bespoke floral arch or romantic backdrop", points: 8 },
        { label: "Full ceremony design — floral pillars, aisle meadows, candle clusters", points: 15 },
        { label: "A showstopper — entrance statements, continuous aisle meadows, suspended canopy", points: 25 },
      ],
    },
    {
      id: "reception",
      question: "How do you envision your reception tables?",
      options: [
        { label: "Simple and sweet — low arrangements, abundant candlelight, clean lines", points: 5 },
        { label: "Mixed heights — dynamic low and elevated centerpieces with candle clusters", points: 12 },
        { label: "Full tablescapes — elevated florals, custom chargers, specialty linens, fine glassware", points: 20 },
        { label: "Immersive — lush floral runners, hanging chandelier florals, every detail custom curated", points: 30 },
      ],
    },
    {
      id: "styling",
      question: "Beyond florals, how styled do you want your event environment to feel?",
      options: [
        { label: "Minimal — we will primarily use venue furnishings", points: 3 },
        { label: "Select focal moments — custom lounge area, sweetheart styling, bespoke signage", points: 8 },
        { label: "Curated throughout — luxury rental furniture, designer bars, full tabletop curation", points: 15 },
        { label: "Full production — every visual element architected and fabricated by our team", points: 22 },
      ],
    },
    {
      id: "lighting",
      question: "How important are lighting and atmospheric mechanics?",
      options: [
        { label: "We will work with the venue existing ambient lighting", points: 0 },
        { label: "Warm uplighting and pin spots to highlight floral centerpieces", points: 5 },
        { label: "Meaningful lighting design — drapery, architectural washes, custom candlescapes", points: 12 },
        { label: "Full production — comprehensive truss lighting, drapery, custom dance floor wraps, stage builds", points: 22 },
      ],
    },
  ];

  const handleSelection = (points: number) => {
    setScoreHistory((prev) => [...prev, score]);
    const newScore = score + points;
    setScore(newScore);

    if (typeof step === "number" && step < questions.length - 1) {
      setStep((prev) => (typeof prev === "number" ? prev + 1 : 0));
    } else {
      setIsCalculating(true);
      setStep("results");
      setTimeout(() => {
        setIsCalculating(false);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (typeof step === "number" && step > 0) {
      setStep((prev) => (typeof prev === "number" ? prev - 1 : 0));
      const prevScore = scoreHistory[scoreHistory.length - 1] ?? 0;
      setScore(prevScore);
      setScoreHistory((prev) => prev.slice(0, -1));
    }
  };

  const calculateResult = () => {
    if (score <= 45) {
      return {
        range: "$8,000 – $15,000",
        tier: "Tier Three · The Essentials",
        message: "Your vision is beautifully focused. With cohesive florals and thoughtful details, Irene and our design team will bring your celebration to life with elegance and intention.",
      };
    }
    if (score <= 90) {
      return {
        range: "$20,000 – $30,000",
        tier: "Tier Two · Design + Custom Florals",
        message: "Your celebration calls for custom floral artistry. Expect lush arrangements, curated specialty rentals, and an elevated atmosphere tailored to your aesthetic.",
      };
    }
    return {
      range: "Starting at $55,000",
      tier: "Tier One · Signature Full Production",
      message: "An uncompromising, fully immersive transformation. Irene and our lead production team will orchestrate bespoke installations, custom lighting, staging, and comprehensive day-of execution.",
    };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 3500);
  };

  const currentResult = calculateResult();

  return (
    <div className="min-h-screen w-full bg-ivory text-ink flex flex-col relative pt-32 pb-24">
      {/* Top Header / Progress Indicator */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-8 flex items-center justify-between">
        <Link
          href="/services"
          className="flex items-center gap-2 text-ink/60 hover:text-gold transition-colors font-body text-xs tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <div className="font-display italic text-lg text-ink">Lady Victoria Designs</div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col justify-center min-h-[480px]">
          
          {/* QUESTION SCREENS */}
          {typeof step === "number" && (
            <div className="w-full bg-white/70 border border-ink/10 p-8 md:p-14 shadow-sm rounded-sm backdrop-blur-sm">
              {/* Progress Bar */}
              <div className="w-full mb-10">
                <div className="flex justify-between font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold mb-3">
                  <span>Question {step + 1} of {questions.length}</span>
                  <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-ink/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Headline */}
              <h1 className="font-display text-2xl md:text-4xl text-ink leading-tight mb-8">
                {questions[step].question}
              </h1>

              {/* Options */}
              <div className="flex flex-col gap-3.5">
                {questions[step].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelection(opt.points)}
                    className="w-full text-left p-5 md:p-6 rounded-sm border border-ink/10 bg-ivory/50 hover:bg-ink hover:text-ivory hover:border-ink transition-all duration-300 font-body group flex justify-between items-center cursor-pointer shadow-xs"
                  >
                    <span className="text-sm md:text-base pr-4 leading-snug">{opt.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gold shrink-0" />
                  </button>
                ))}
              </div>

              {/* Back button */}
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="text-ink/50 hover:text-gold transition-colors font-body text-xs tracking-[0.2em] uppercase flex items-center gap-2 mt-8 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Question
                </button>
              )}
            </div>
          )}

          {/* CALCULATING STATE */}
          {step === "results" && isCalculating && (
            <div className="flex flex-col items-center justify-center text-center gap-6 py-20 bg-white/70 border border-ink/10 p-12 rounded-sm shadow-sm">
              <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
              <h2 className="font-display text-2xl md:text-3xl text-ink">
                Calculating your customized investment estimate...
              </h2>
              <p className="font-body text-xs uppercase tracking-widest text-gold">Synthesizing scope and production requirements</p>
            </div>
          )}

          {/* RESULTS SCREEN */}
          {step === "results" && !isCalculating && (
            <div className="w-full bg-white/90 rounded-sm p-8 md:p-16 shadow-lg border border-ink/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>

              <div className="text-gold font-body text-xs uppercase tracking-[0.25em] mb-4">
                YOUR ESTIMATED INVESTMENT
              </div>

              <div className="font-display text-4xl sm:text-5xl md:text-7xl text-ink mb-4">
                {currentResult.range}
              </div>

              <div className="inline-block bg-ink text-gold font-body text-xs uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8">
                {currentResult.tier}
              </div>

              <p className="font-body text-base md:text-xl text-ink/80 max-w-xl mx-auto mb-10 leading-relaxed">
                "{currentResult.message}"
              </p>

              <div className="w-full h-px bg-ink/10 mb-8 max-w-md mx-auto"></div>

              <p className="font-body text-xs text-ink/50 max-w-md mx-auto mb-10 leading-relaxed">
                This estimate reflects your selected guest count and production scale. Final proposals are fully tailored during your private design consultation with Irene.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-ink text-ivory px-8 py-4 font-body text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-ink transition-colors duration-300 cursor-pointer shadow-md"
                >
                  Book Your Consultation
                </button>
                <Link
                  href="/services"
                  className="w-full sm:w-auto bg-transparent border border-ink/30 text-ink px-8 py-4 font-body text-xs uppercase tracking-[0.2em] hover:bg-ink hover:text-ivory transition-colors duration-300"
                >
                  Explore All Services
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LEAD CAPTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => !isSubmitted && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-ivory rounded-sm p-8 md:p-12 shadow-2xl border border-ink/20 z-10">
            {!isSubmitted && (
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-ink/50 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="font-display text-3xl text-ink mb-3">Consultation Requested</h3>
                <p className="font-body text-sm text-ink/75 leading-relaxed">
                  Thank you! Irene and our team will review your estimated tier ({currentResult.tier}) and reach out within 24–48 hours to schedule your design consultation.
                </p>
              </div>
            ) : (
              <>
                <div className="text-gold font-body text-[10px] md:text-xs uppercase tracking-[0.25em] mb-2 text-center">
                  NEXT STEPS
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-ink text-center mb-2">
                  Let's Discuss Your Vision
                </h3>
                <p className="font-body text-ink/70 text-center mb-8 text-xs md:text-sm">
                  Share your details below and Irene will reach out to schedule your consultation.
                </p>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="font-body text-[10px] uppercase tracking-widest text-ink/70">Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="w-full bg-white border border-ink/20 text-ink px-4 py-3 text-sm focus:outline-none focus:border-gold font-body"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="font-body text-[10px] uppercase tracking-widest text-ink/70">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full bg-white border border-ink/20 text-ink px-4 py-3 text-sm focus:outline-none focus:border-gold font-body"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="font-body text-[10px] uppercase tracking-widest text-ink/70">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full bg-white border border-ink/20 text-ink px-4 py-3 text-sm focus:outline-none focus:border-gold font-body"
                      placeholder="(202) 555-0199"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="date" className="font-body text-[10px] uppercase tracking-widest text-ink/70">Event Date (Optional)</label>
                    <input
                      type="text"
                      id="date"
                      className="w-full bg-white border border-ink/20 text-ink px-4 py-3 text-sm focus:outline-none focus:border-gold font-body"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-ink text-ivory py-4 font-body text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-ink transition-colors duration-300 cursor-pointer"
                  >
                    Request Consultation
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
