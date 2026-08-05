"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ReservePage() {
  const [formData, setFormData] = useState({
    names: "",
    email: "",
    phone: "",
    date: "",
    venue: "",
    budget: "$20,000 – $50,000",
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center justify-start overflow-x-clip">
      
      {/* 1. MINIMALIST LUXURY TOP BAR (Zero-distraction navigation) */}
      <header className="w-full border-b border-ink/10 bg-ivory/95 backdrop-blur-md sticky top-0 z-50 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex flex-col group">
          <span className="font-display tracking-[0.15em] text-lg sm:text-xl md:text-2xl text-ink uppercase">
            Lady Victoria <span className="italic text-gold font-normal">Designs</span>
          </span>
          <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold/80 -mt-1 hidden sm:block">
            WASHINGTON D.C. · FLORAL & EVENT DESIGN
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={scrollToForm}
            className="px-5 py-2.5 sm:px-7 sm:py-3 bg-ink text-ivory rounded-full font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:bg-gold hover:text-ink shadow-md"
          >
            Reserve Your Date
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full min-h-[calc(100svh-81px)] overflow-hidden bg-ink text-ivory">
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

        <div className="relative z-10 flex min-h-[calc(100svh-81px)] w-full items-end px-6 pb-14 pt-20 sm:px-10 md:px-12 md:pb-16">
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
      <section className="w-full bg-ivory px-6 py-16 text-ink sm:py-20 md:px-12 md:py-24">
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
      </section>

      {/* 4. VENUE CREDIBILITY STRIP */}
      <section className="w-full bg-ecru/60 border-y border-ink/10 py-10 px-6 md:px-12 text-center">
        <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-6">
          TRUSTED AT PREMIER DC &amp; VIRGINIA DESTINATIONS
        </p>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 font-display text-sm sm:text-base md:text-lg text-ink/70">
          <span>Meridian House</span>
          <span className="text-gold/40">✦</span>
          <span>Larz Anderson House</span>
          <span className="text-gold/40">✦</span>
          <span>The LINE DC</span>
          <span className="text-gold/40">✦</span>
          <span>Salamander Resort &amp; Spa</span>
          <span className="text-gold/40">✦</span>
          <span>Congressional Country Club</span>
          <span className="text-gold/40">✦</span>
          <span>Private Estates</span>
        </div>
      </section>

      {/* 5. INVESTMENT TRANSPARENCY TIERS */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3">
            INVESTMENT TRANSPARENCY
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-4">
            Tailored Levels of <span className="italic text-gold">Production</span>
          </h2>
          <p className="font-body text-sm sm:text-base text-ink/70 max-w-2xl leading-relaxed">
            Every celebration is individually priced based on your guest count, architectural scale, and custom floral requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Card 1 */}
          <div className="bg-ivory border border-ink/10 rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:border-gold/50">
            <div>
              <span className="font-body text-[10px] uppercase tracking-widest text-gold font-semibold block mb-2">COLLECTION I</span>
              <h3 className="font-display text-2xl text-ink mb-3">The Essentials</h3>
              <p className="font-body text-sm text-ink/70 leading-relaxed mb-6">
                Curated floral arrangements, personal bouquets, and tabletop accents for intimate celebrations.
              </p>
            </div>
            <div className="pt-6 border-t border-ink/10">
              <span className="font-body text-xs uppercase tracking-widest text-ink/50 block mb-1">Starting At</span>
              <span className="font-display text-2xl sm:text-3xl text-ink font-semibold">$8,000</span>
            </div>
          </div>

          {/* Card 2 (Featured) */}
          <div className="bg-ink text-ivory rounded-xl p-8 flex flex-col justify-between shadow-2xl relative border border-gold/40 md:-translate-y-3">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-ink font-body text-[9px] uppercase tracking-widest font-bold">
              MOST POPULAR
            </div>
            <div>
              <span className="font-body text-[10px] uppercase tracking-widest text-gold font-semibold block mb-2">COLLECTION II</span>
              <h3 className="font-display text-2xl text-ivory mb-3">Design + Florals</h3>
              <p className="font-body text-sm text-ivory/70 leading-relaxed mb-6">
                Bespoke floral styling, ceremony focal installations, and foundational aesthetic direction.
              </p>
            </div>
            <div className="pt-6 border-t border-ivory/10">
              <span className="font-body text-xs uppercase tracking-widest text-ivory/50 block mb-1">Starting At</span>
              <span className="font-display text-2xl sm:text-3xl text-gold font-semibold">$20,000</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-ivory border border-ink/10 rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:border-gold/50">
            <div>
              <span className="font-body text-[10px] uppercase tracking-widest text-gold font-semibold block mb-2">COLLECTION III</span>
              <h3 className="font-display text-2xl text-ink mb-3">The Full Production</h3>
              <p className="font-body text-sm text-ink/70 leading-relaxed mb-6">
                Comprehensive venue transformation, custom fabrication, overhead ceiling canopies, and full day-of management.
              </p>
            </div>
            <div className="pt-6 border-t border-ink/10">
              <span className="font-body text-xs uppercase tracking-widest text-ink/50 block mb-1">Starting At</span>
              <span className="font-display text-2xl sm:text-3xl text-ink font-semibold">$55,000</span>
            </div>
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

      {/* 7. EMBEDDED DIRECT CONSULTATION FORM */}
      <section id="reserve-form" className="w-full max-w-[1100px] mx-auto px-6 md:px-12 py-20 md:py-28 scroll-mt-20">
        <div className="bg-ecru/40 border border-ink/10 rounded-2xl p-8 sm:p-12 md:p-16 shadow-xl">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3 block">
              PRIVATE CONSULTATION
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-4">
              Check Date <span className="italic text-gold">Availability</span>
            </h2>
            <p className="font-body text-sm sm:text-base text-ink/70 leading-relaxed">
              Share your details below. Irene will review your venue and aesthetic requirements and respond within 24 to 48 hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-ivory border border-gold/40 p-10 sm:p-14 rounded-xl text-center shadow-lg animate-fade-in">
              <span className="w-12 h-12 rounded-full bg-gold/10 text-gold text-2xl flex items-center justify-center mx-auto mb-6">✓</span>
              <h3 className="font-display text-3xl text-ink mb-4">Inquiry Received</h3>
              <p className="font-body text-base text-ink/75 max-w-lg mx-auto leading-relaxed mb-8">
                Thank you! Irene and our design team will review your date and reach out to schedule your private design consultation.
              </p>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink text-ivory rounded-full font-body text-xs uppercase tracking-widest hover:bg-gold hover:text-ink transition-colors"
              >
                <span>Browse Our Gallery</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Row 1: Names & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                    Couple / Client Name(s) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Victoria & Alexander"
                    value={formData.names}
                    onChange={(e) => setFormData({ ...formData, names: e.target.value })}
                    className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., victoria@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Phone, Date, Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(202) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                    Wedding / Event Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., October 2026 / TBD"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                    Venue / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Meridian House, DC"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Estimated Investment Budget */}
              <div className="flex flex-col">
                <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                  Anticipated Floral &amp; Production Investment
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="$8,000 – $15,000">$8,000 – $15,000 (The Essentials)</option>
                  <option value="$15,000 – $35,000">$15,000 – $35,000 (Design + Florals)</option>
                  <option value="$35,000 – $55,000">$35,000 – $55,000 (Elevated Production)</option>
                  <option value="$55,000+">$55,000+ (The Full Production)</option>
                  <option value="Undecided">Undecided / Flexible</option>
                </select>
              </div>

              {/* Row 4: Notes / Vision */}
              <div className="flex flex-col">
                <label className="font-body text-xs uppercase tracking-widest text-ink/70 font-semibold mb-2">
                  Tell Us About Your Vision
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your color palette, floral inspirations, scale of installations, or any questions for Irene..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-ivory border border-ink/15 rounded-md px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <p className="font-body text-xs text-ink/50">
                  🔒 Strictly confidential. Never shared with third parties.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4.5 bg-ink text-ivory rounded-full font-body text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:bg-gold hover:text-ink shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Inquiry..." : "Submit Consultation Request"}
                </button>
              </div>

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
