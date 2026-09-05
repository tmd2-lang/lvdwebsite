import type { Metadata } from "next";
import Image from "next/image";
import BookButton from "@/components/planning/BookButton";
import PackageInclusions from "@/components/planning/PackageInclusions";
import { PLANNING_PACKAGES } from "@/data/packages";
import { media } from "@/lib/media-slots";

export const metadata: Metadata = {
  title: "Planning",
  description:
    "Four ways to work with Lady Victoria Designs, from venue discovery and budget strategy to full planning of your celebration.",
};

export default function PackagesPage() {
  return (
    <main className="w-full bg-ivory text-ink flex flex-col relative">
      {/* HERO */}
      <section className="w-full min-h-[55vh] md:min-h-[70vh] flex flex-col justify-center items-center text-center px-6 md:px-12 py-20 md:py-48 border-b border-ink/20">
        <div className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-body">PLANNING PACKAGES</div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,6.5rem)] text-ink max-w-5xl mx-auto leading-tight mb-8">
          Four ways to <span className="italic text-gold">begin.</span>
        </h1>
        <p className="font-body text-ink/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          Some couples need a venue found. Others need the whole celebration carried from the first
          conversation to the last dance. Choose where you would like us to step in.
        </p>
      </section>

      {/* HERO IMAGE */}
      <section className="w-full px-6 md:px-12 py-12 md:py-20 border-b border-ink/20 flex justify-center bg-ivory">
        <div className="max-w-[1440px] w-full h-[45vh] md:h-[62vh] overflow-hidden relative">
          <Image
            src={media["planning.hero"]}
            alt="A newly married couple beneath a floral ceremony arch designed by Lady Victoria Designs"
            fill
            sizes="100vw"
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </section>

      {/* PACKAGES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {PLANNING_PACKAGES.map((pkg, index) => (
          <article
            key={pkg.id}
            className="w-full border-t border-ink/20 px-6 md:px-12 py-14 md:py-24"
          >
            <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-10 lg:gap-20">
              {/* LEFT: identity */}
              <div className="lg:w-[42%] flex flex-col">
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="font-body text-xs tracking-[0.2em] text-gold">{pkg.number}</span>
                  <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-ink/45">
                    {index === 0 ? "Where most couples start" : `Package ${pkg.number}`}
                  </span>
                </div>
                <h2 className="font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.05] mb-4">
                  {pkg.name}
                </h2>
                <p className="font-display italic text-gold text-lg md:text-xl mb-6">{pkg.tagline}</p>
                <p className="font-body text-sm md:text-base text-ink/70 leading-relaxed mb-8">
                  {pkg.description}
                </p>

                <div className="border-t border-ink/15 pt-6 mb-8">
                  <div className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-ink/45 mb-2">
                    Investment
                  </div>
                  <div className="font-display text-2xl md:text-3xl text-ink">{pkg.price}</div>
                </div>

                <BookButton packageName={pkg.name} />
              </div>

              {/* RIGHT: fit + expandable inclusions */}
              <div className="lg:w-[58%] lg:border-l lg:border-ink/15 lg:pl-16">
                <div className="mb-8 border-b border-ink/10 pb-8 md:mb-10 md:pb-10">
                  <div className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.18em] text-ink/45">
                    Ideal for
                  </div>
                  <p className="max-w-xl font-body text-sm leading-relaxed text-ink/70">{pkg.idealFor}</p>
                </div>
                <PackageInclusions packageDetails={pkg} />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CUSTOM */}
      <section className="w-full px-6 md:px-12 py-20 md:py-32 flex flex-col items-center text-center bg-ivory border-b border-ink/20">
        <div className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-body">SOMETHING ELSE</div>
        <h2 className="font-display text-[clamp(2rem,4vw,4rem)] text-ink max-w-4xl mx-auto leading-tight mb-8">
          Not quite any of these? <span className="italic text-gold">Tell us what you need.</span>
        </h2>
        <p className="font-body text-sm md:text-base text-ink/70 max-w-xl mx-auto leading-relaxed mb-10">
          Every celebration is different. If your plans fall between two packages, or somewhere else
          entirely, we will build the scope around what you actually need.
        </p>
        <BookButton packageName="Custom" variant="outline" label="Request a custom quote" />
      </section>

    </main>
  );
}
