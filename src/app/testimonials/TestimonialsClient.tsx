"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/sections/Contact";
import { testimonialsData, Testimonial } from "@/data/testimonials";

export default function TestimonialsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Weddings", "Full Production", "Design & Florals"];

  const filteredReviews = useMemo(() => {
    if (selectedCategory === "All") return testimonialsData;
    return testimonialsData.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <main className="w-full min-h-screen bg-ink text-ivory flex flex-col items-center justify-center pt-32 pb-20 selection:bg-gold selection:text-ink">
        
        {/* Header Section */}
        <div className="px-6 md:px-12 w-full max-w-5xl flex flex-col items-center text-center">
          
          {/* Top Label */}
          <div className="font-body text-xs uppercase tracking-[0.25em] text-gold mb-4 flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50"></span>
            CLIENT PRAISE & KIND WORDS
            <span className="w-8 h-px bg-gold/50"></span>
          </div>

          <h1 className="font-display text-[clamp(2.75rem,6vw,5.5rem)] text-ivory mb-6 leading-[1.08] tracking-tight">
            Crafted to Be <span className="italic font-normal text-gold">Remembered</span>
          </h1>

          <p className="font-body text-sm md:text-base text-ivory/70 max-w-2xl text-center mb-10 font-light leading-relaxed">
            With years of dedicated craftsmanship, our couples and clients trust Lady Victoria Designs to mark life’s most profound milestones with unmatched beauty and grace.
          </p>

          {/* Google Verified Trust Bar */}
          <div className="w-full max-w-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md rounded-2xl p-6 mb-12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                {/* Google G Logo SVG */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-ivory font-bold leading-none">5.0</span>
                  <div className="flex text-gold text-sm tracking-wider">
                    ★★★★★
                  </div>
                </div>
                <p className="font-body text-xs text-ivory/60 uppercase tracking-widest mt-1">
                  100% 5-Star Rating on Google
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.google.com/search?q=Lady+Victoria+Designs+Reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs uppercase tracking-wider text-ivory bg-white/10 hover:bg-gold hover:text-ink px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <span>Read on Google</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-14">
            {categories.map((cat) => {
              const count = cat === "All" ? testimonialsData.length : testimonialsData.filter(t => t.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={isActive}
                  className={`px-5 py-2.5 rounded-full font-body text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gold text-ink font-semibold shadow-lg scale-105"
                      : "bg-ivory/10 text-ivory/70 hover:text-ivory hover:bg-ivory/20"
                  }`}
                >
                  {cat} <span className="text-[10px] opacity-60 ml-1">({count})</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Testimonials Masonry / Grid */}
        <div className="w-full max-w-7xl px-6 md:px-12 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredReviews.map((review: Testimonial) => (
              <div
                key={review.id}
                className="group relative flex flex-col justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-gold/30 rounded-2xl p-7 md:p-8 backdrop-blur-xl transition-all duration-500 shadow-xl hover:-translate-y-1"
              >
                {/* Optional Image thumbnail for featured weddings */}
                {review.image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-6 border border-white/10">
                    <Image
                      src={review.image}
                      alt={review.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="font-body text-[10px] uppercase tracking-widest text-gold bg-ink/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold/20">
                        {review.service}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  {/* Top card metadata: Star rating + Source */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-gold text-sm tracking-wider">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="font-body text-[10px] uppercase tracking-widest text-ivory/50 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {review.source}
                    </span>
                  </div>

                  {/* Quote Body */}
                  <p className="font-display italic text-lg md:text-xl text-ivory/95 leading-relaxed mb-6">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-5 border-t border-white/10 flex flex-col">
                  <span className="font-display text-base text-gold font-semibold tracking-wide">
                    {review.name}
                  </span>
                  <span className="font-body text-xs text-ivory/60 mt-0.5">
                    {review.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Transparency & Direct Google Link Section */}
        <div className="w-full max-w-4xl px-6 mb-20 text-center">
          <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-3 block">
              AUTHENTIC CLIENT EXPERIENCES
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ivory mb-4">
              Real Love Stories, Real Words
            </h2>
            <p className="font-body text-sm text-ivory/70 max-w-xl mx-auto mb-8 font-light leading-relaxed">
              Every review displayed here is written by genuine couples and clients who partnered with Lady Victoria Designs for their milestone celebrations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.google.com/search?q=Lady+Victoria+Designs+Reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto font-body text-xs uppercase tracking-[0.2em] text-ink bg-gold hover:bg-gold-light px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View All Reviews on Google</span>
                <span className="text-sm">↗</span>
              </a>
              <Link
                href="/inquire"
                className="w-full sm:w-auto font-body text-xs uppercase tracking-[0.2em] text-ivory hover:text-gold border border-ivory/30 hover:border-gold px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center"
              >
                Inquire For Your Date
              </Link>
            </div>
          </div>
        </div>

        {/* Universal Floral CTA */}
        <Contact />

      </main>
    </>
  );
}
