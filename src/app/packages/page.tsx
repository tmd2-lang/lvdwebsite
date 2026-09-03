import type { Metadata } from "next";
import Link from "next/link";
import Contact from "@/components/sections/Contact";
import { PLANNING_PACKAGES } from "@/data/packages";

export const metadata: Metadata = {
  title: "Planning Packages",
  description:
    "Four ways to plan with Lady Victoria Designs — Venue Finder, Coordinating, Partial Planning, and Full Planning — plus custom celebrations built to fit.",
  alternates: { canonical: "/packages" },
};

export default function PackagesPage() {
  return (
    <main className="w-full bg-ivory text-ink flex flex-col relative">

      {/* HERO */}
      <section className="w-full min-h-[45vh] md:min-h-[60vh] flex flex-col justify-center items-center text-center px-6 md:px-12 py-20 md:py-40 border-b border-ink/20">
        <div className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-body">PLANNING PACKAGES</div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,6.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-8">
          Choose how much you <span className="italic text-gold">carry</span>
        </h1>
        <p className="font-body text-ink/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          Some couples want a venue found and nothing more. Others want one accountable team from the first
          conversation to the last dance. Start wherever you are — we will meet you there.
        </p>
      </section>

      {/* PACKAGES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {PLANNING_PACKAGES.map((pkg, index) => (
          <article
            key={pkg.id}
            className={`w-full flex flex-col lg:flex-row ${index > 0 ? "border-t border-ink/20" : ""}`}
          >
            {/* LEFT: identity */}
            <div className="w-full lg:w-2/5 flex flex-col justify-between p-8 md:p-12 lg:p-16 lg:border-r border-ink/20">
              <div>
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 block mb-4">
                  {pkg.number}
                </span>
                <h2 className="font-display text-4xl md:text-5xl text-ink uppercase tracking-wide leading-tight mb-6">
                  {pkg.name}
                </h2>
                <p className="font-display italic text-xl md:text-2xl text-gold leading-snug max-w-[28ch]">
                  {pkg.tagline}
                </p>
              </div>

              <div className="flex flex-col gap-8 mt-12 lg:mt-24">
                <div className="flex flex-col gap-2">
                  <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/50">INVESTMENT</span>
                  <span className="font-body text-sm md:text-base text-ink/90">{pkg.price}</span>
                </div>
                <Link
                  href={`/inquire?package=${pkg.id}`}
                  className="font-body text-[10px] uppercase tracking-[0.2em] border border-ink/30 px-8 py-4 text-center hover:bg-ink hover:text-ivory transition-colors self-start"
                >
                  Inquire about {pkg.name}
                </Link>
              </div>
            </div>

            {/* RIGHT: detail */}
            <div className="w-full lg:w-3/5 flex flex-col gap-10 p-8 md:p-12 lg:p-16 border-t lg:border-t-0 border-ink/20">
              <p className="font-body text-sm md:text-base text-ink/80 leading-relaxed max-w-2xl">
                {pkg.description}
              </p>

              <div className="flex flex-col gap-3">
                <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/50">IDEAL FOR</span>
                <p className="font-body text-sm text-ink/80 leading-relaxed max-w-2xl">{pkg.idealFor}</p>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ink/50">WHAT&rsquo;S INCLUDED</span>
                <ul className="flex flex-col gap-3">
                  {pkg.includes.map((item) => (
                    <li key={item} className="font-body text-sm text-ink/80 leading-relaxed flex gap-4">
                      <span aria-hidden="true" className="text-gold shrink-0">&mdash;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CUSTOM */}
      <section className="w-full bg-ivory py-20 md:py-32 px-6 md:px-12 border-b border-ink/20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-8">SOMETHING ELSE ENTIRELY</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ink leading-tight mb-8">
            Not every celebration fits <span className="italic text-gold">a package.</span>
          </h2>
          <p className="font-body text-sm md:text-base text-ink/70 leading-relaxed mb-10 max-w-xl">
            Multi-day weddings, corporate galas, milestone celebrations, and events that borrow from more than one
            package. Tell us what you are planning and we will build the scope around it.
          </p>
          <Link
            href="/inquire?package=custom"
            className="font-body text-[10px] uppercase tracking-[0.2em] border border-ink/30 px-10 py-4 hover:bg-ink hover:text-ivory transition-colors"
          >
            Request a custom quote
          </Link>
        </div>
      </section>

      <Contact />
    </main>
  );
}
