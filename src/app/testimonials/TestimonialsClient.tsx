"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/sections/Contact";
import { testimonialsData, Testimonial } from "@/data/testimonials";
import Magnetic from "@/components/Magnetic";

const GoogleLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
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
);

const StarIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const SearchIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function TestimonialsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalStory, setModalStory] = useState<Testimonial | null>(null);

  const categories = [
    "All",
    "Full Production",
    "Weddings",
    "Florals & Tablescapes",
    "Milestones",
  ];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalStory) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setModalStory(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [modalStory]);

  const filteredReviews = useMemo(() => {
    return testimonialsData.filter((t) => {
      const matchesCategory =
        selectedCategory === "All" || t.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.service && t.service.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredStories = useMemo(() => {
    return testimonialsData.filter((t) => t.featured).slice(0, 4);
  }, []);

  return (
    <>
      <main className="w-full min-h-screen bg-ivory text-ink selection:bg-gold/20 selection:text-ink pt-32 pb-24">
        
        {/* ============================================================ */}
        {/* 1. EDITORIAL HEADER & TITLE                                  */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 w-full max-w-6xl mx-auto flex flex-col items-center text-center mb-16 md:mb-20">
          
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/50" />
            <span className="font-body text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gold font-medium">
              Letters &amp; Gratitude
            </span>
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <h1 className="font-display text-[clamp(2.5rem,5.5vw,5rem)] text-ink mb-6 leading-[1.08] tracking-tight">
            Crafted to Be <span className="italic font-normal text-gold">Remembered</span>
          </h1>

          <p className="font-body text-sm sm:text-base text-ink/75 max-w-2xl text-center mb-10 font-light leading-relaxed">
            Spanning grand ballroom transformations at The Willard to private estate celebrations across the DMV, explore unfiltered reflections from our brides, grooms, and creative collaborators.
          </p>

          {/* GOOGLE VERIFIED CITATION BANNER */}
          <div className="w-full max-w-3xl bg-white border border-ink/10 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-ink/10 flex items-center justify-center shrink-0 shadow-xs">
                <GoogleLogo className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-ink font-bold leading-none">5.0</span>
                  <div className="flex items-center gap-1 text-gold text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} className="w-4 h-4 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-ink/60 mt-1 font-medium">
                  50+ Perfect 5-Star Reviews on Google
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/search?q=Lady+Victoria+Designs+Reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ink hover:text-gold font-body text-[10px] uppercase tracking-[0.2em] font-medium border-b border-ink/30 pb-0.5 transition-colors cursor-pointer"
            >
              <span>View Verified Google Profile</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>

        </section>

        {/* ============================================================ */}
        {/* 2. 2x2 FEATURED ROOM REVEAL GRID                             */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 w-full max-w-7xl mx-auto mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink/10 pb-4 mb-10 gap-2">
            <div>
              <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block">
                The Room Reveal Archive
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-ink mt-1">
                Featured Client Stories
              </h2>
            </div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/40">
              Click any story to read the full letter
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {featuredStories.map((story) => (
              <article
                key={story.id}
                onClick={() => setModalStory(story)}
                className="bg-white border border-ink/10 flex flex-col justify-between shadow-xs hover:border-gold/50 hover:shadow-xl transition-all duration-500 cursor-pointer group relative overflow-hidden"
              >
                {/* Photo Header */}
                {story.image && (
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-ink/5 border-b border-ink/10">
                    <Image
                      src={story.image}
                      alt={story.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="font-body text-[9px] uppercase tracking-[0.25em] text-ivory bg-ink/75 backdrop-blur-md px-3 py-1.5 border border-white/20">
                        {story.service || "Full Production"}
                      </span>
                      <span className="font-body text-[9px] uppercase tracking-wider text-ivory/90 bg-ink/60 backdrop-blur-md px-2.5 py-1">
                        {story.date}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-ivory">
                      <span className="font-display text-base tracking-wide font-medium drop-shadow-md">
                        {story.name}
                      </span>
                      <span className="font-body text-[10px] uppercase tracking-widest text-gold drop-shadow-md">
                        ★★★★★
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display italic text-xl sm:text-2xl text-ink leading-snug mb-4 group-hover:text-gold transition-colors">
                      &ldquo;{story.highlight}&rdquo;
                    </h3>

                    <p className="font-body text-xs sm:text-[13px] text-ink/75 leading-relaxed font-light line-clamp-3 mb-6">
                      {story.quote}
                    </p>
                  </div>

                  {/* Card Footer Prompt */}
                  <div className="pt-6 border-t border-ink/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white border border-ink/10 flex items-center justify-center">
                        <GoogleLogo className="w-3 h-3" />
                      </div>
                      <span className="font-body text-[10px] uppercase tracking-widest text-ink/50">
                        {story.role || "Verified Google Review"}
                      </span>
                    </div>

                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                      <span>Read Story</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. FILTER & SEARCH CONTROLS                                  */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 w-full max-w-7xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border-b border-ink/10 pb-6">
            
            {/* Category hairline tabs */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? testimonialsData.length
                    : testimonialsData.filter((t) => t.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`font-body text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer pb-2 relative ${
                      isActive
                        ? "text-ink font-semibold border-b-2 border-gold"
                        : "text-ink/50 hover:text-ink"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[9px] ml-1.5 opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search reviews by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-ink/15 text-ink pl-9 pr-4 py-2.5 text-xs font-body focus:outline-none focus:border-gold placeholder:text-ink/40"
              />
              <SearchIcon className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. THE EDITORIAL ANTHOLOGY (2-Column Broadsheet Archive)     */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 w-full max-w-7xl mx-auto mb-24">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-20 bg-white border border-ink/10 p-8">
              <p className="font-display text-xl text-ink mb-2">No letters match your search.</p>
              <p className="font-body text-xs text-ink/60">Try searching for a different name, venue, or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredReviews.map((review) => {
                const isLong = review.quote.length > 280;

                return (
                  <article
                    key={review.id}
                    onClick={() => setModalStory(review)}
                    className="bg-white border border-ink/10 p-8 sm:p-10 flex flex-col justify-between shadow-xs hover:border-gold/50 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-ink/10">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold font-medium">
                            {review.category}
                          </span>
                          <span className="text-ink/20">·</span>
                          <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/40">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gold text-xs">
                          ★★★★★
                        </div>
                      </div>

                      {/* Pull Highlight Headline */}
                      <h3 className="font-display italic text-lg sm:text-xl text-ink leading-snug mb-4 group-hover:text-gold transition-colors">
                        &ldquo;{review.highlight}&rdquo;
                      </h3>

                      {/* Full Quote Text */}
                      <div className="font-body text-xs sm:text-[13px] text-ink/75 leading-relaxed font-light">
                        <p className={isLong ? "line-clamp-4" : ""}>
                          {review.quote}
                        </p>

                        {isLong && (
                          <span className="inline-block mt-3 font-body text-[10px] uppercase tracking-[0.2em] text-gold font-medium group-hover:underline">
                            Read Full Letter →
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Author Signature */}
                    <div className="pt-6 mt-8 border-t border-ink/10 flex items-center justify-between">
                      <div>
                        <span className="font-display text-base text-ink block font-semibold">
                          {review.name}
                        </span>
                        <span className="font-body text-[10px] text-ink/50 block">
                          {review.role || "Verified Google Review"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-body text-[9px] uppercase tracking-widest text-ink/50 bg-ink/5 px-2.5 py-1">
                        <GoogleLogo className="w-3 h-3" />
                        <span>Google Review</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 5. CONSULTATION INVITATION                                   */}
        {/* ============================================================ */}
        <section className="w-full max-w-4xl mx-auto px-6 mb-20 text-center">
          <div className="bg-white border border-ink/10 p-10 sm:p-14 shadow-xs">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-3 block">
              BEGIN YOUR STORY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-ink mb-4 leading-tight">
              Ready to Design an Unforgettable Celebration?
            </h2>
            <p className="font-body text-sm text-ink/75 max-w-xl mx-auto mb-8 font-light leading-relaxed">
              Whether you hold a confirmed date at a historic estate or are beginning the creative search, Irene and our production team are ready to bring your vision to life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic>
                <Link
                  href="/inquire"
                  className="w-full sm:w-auto px-8 py-4 bg-ink text-ivory border border-ink font-body text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-gold hover:text-ink hover:border-gold transition-colors duration-300 shadow-xs"
                >
                  Request Private Consultation
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/quiz"
                  className="w-full sm:w-auto px-8 py-4 bg-transparent border border-ink/20 text-ink font-body text-[11px] uppercase tracking-[0.25em] hover:bg-ink hover:text-ivory transition-colors duration-300"
                >
                  Estimate Investment Scope
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* Universal Contact Footer */}
        <Contact />

      </main>

      {/* ============================================================ */}
      {/* 6. POP-UP MODULE (Full Exhibition & Room Reveal Letter)      */}
      {/* ============================================================ */}
      {modalStory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-ink/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setModalStory(null)}
          data-lenis-prevent
        >
          <div 
            className="relative w-full max-w-4xl bg-ivory text-ink border border-ink/20 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 max-h-[90vh] md:h-[82vh] my-auto"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            {/* Close Button */}
            <button
              onClick={() => setModalStory(null)}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-ivory/90 hover:bg-gold text-ink border border-ink/15 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Close dialog"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Left Visual Column (If image exists) */}
            {modalStory.image && (
              <div className="relative w-full md:w-5/12 h-56 sm:h-72 md:h-full shrink-0 border-b md:border-b-0 md:border-r border-ink/10 bg-ink/10">
                <Image
                  src={modalStory.image}
                  alt={modalStory.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-ivory pointer-events-none">
                  <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold block mb-1">
                    {modalStory.service || "Production Gallery"}
                  </span>
                  <span className="font-display text-sm tracking-wide block">
                    Lady Victoria Designs Archive
                  </span>
                </div>
              </div>
            )}

            {/* Right Letter Column (Fully Scrollable with data-lenis-prevent) */}
            <div 
              className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto overscroll-contain flex flex-col justify-between scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-ink/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              data-lenis-prevent
            >
              <div>
                {/* Header Meta */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-ink/10 pr-8">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white border border-ink/10 flex items-center justify-center">
                      <GoogleLogo className="w-3 h-3" />
                    </div>
                    <span className="font-body text-[10px] uppercase tracking-[0.25em] text-ink/60 font-medium">
                      Verified Google Review
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gold text-sm">
                    ★★★★★
                  </div>
                </div>

                {/* Highlight Pull-Quote */}
                <h3 className="font-display italic text-xl sm:text-2xl md:text-3xl text-ink leading-snug mb-6 text-balance">
                  &ldquo;{modalStory.highlight}&rdquo;
                </h3>

                {/* Author Credentials */}
                <div className="mb-6 pb-6 border-b border-ink/10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-display text-lg text-ink font-semibold block">
                      {modalStory.name}
                    </span>
                    <span className="font-body text-xs text-ink/60 block">
                      {modalStory.role || "Client"} · {modalStory.date}
                    </span>
                  </div>
                  <span className="font-body text-[10px] uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 border border-gold/20">
                    {modalStory.category}
                  </span>
                </div>

                {/* Full Unedited Letter */}
                <div className="font-body text-sm sm:text-base text-ink/85 leading-relaxed font-light space-y-4 whitespace-pre-line mb-8">
                  {modalStory.quote}
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-6 mt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <a
                  href="https://www.google.com/search?q=Lady+Victoria+Designs+Reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink/70 hover:text-ink font-body text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                >
                  <span>View On Google Reviews</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>

                <Link
                  href="/inquire"
                  onClick={() => setModalStory(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-ink text-ivory hover:bg-gold hover:text-ink text-center font-body text-[10px] uppercase tracking-[0.25em] font-medium transition-colors cursor-pointer"
                >
                  Inquire For Your Celebration →
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
