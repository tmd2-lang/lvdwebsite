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
      <section className="flex w-full flex-col items-center justify-center border-b border-ink/20 px-6 pb-16 pt-36 text-center md:px-12 md:pb-20 md:pt-44">
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
      <section className="flex w-full justify-center border-b border-ink/20 bg-ivory px-6 py-8 md:px-12 md:py-12">
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

      <section aria-labelledby="choose-package" className="w-full px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.18em] text-gold">Find your starting point</p>
          <h2 id="choose-package" className="max-w-4xl text-balance font-display text-3xl leading-tight md:text-5xl">
            Where would you like us to step in?
          </h2>
          <div className="mt-10 grid gap-x-8 md:grid-cols-2 xl:grid-cols-4">
            {PLANNING_PACKAGES.map((pkg) => (
              <a
                key={pkg.id}
                href={`#${pkg.id}`}
                className="group flex flex-col border-t border-ink/20 py-7 transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span className="font-body text-xs tracking-[0.18em] text-gold">{pkg.number}</span>
                <h3 className="mt-4 font-display text-2xl text-ink">{pkg.shortName}</h3>
                <p className="mb-6 mt-3 max-w-xs font-body text-sm leading-relaxed text-ink/70">{pkg.startingPoint}</p>
                <div className="mt-auto flex items-center justify-between gap-4">
                  <span className="font-display text-2xl text-ink">{pkg.price}</span>
                  <span className="font-body text-xs text-ink/70 transition-colors group-hover:text-gold">
                    View package <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-ink/60">
            Prices marked + are starting investments. Your final proposal reflects the scope and needs of your celebration.
          </p>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {PLANNING_PACKAGES.map((pkg, index) => (
          <article
            key={pkg.id}
            id={pkg.id}
            aria-labelledby={`${pkg.id}-title`}
            className="w-full scroll-mt-28 border-t border-ink/20 px-6 py-16 md:px-12 md:py-24 lg:py-28"
          >
            <div className="mx-auto w-full max-w-[1440px]">
              <div className="mb-8 flex items-baseline gap-4 md:mb-10">
                <span className="font-body text-xs tracking-[0.2em] text-gold">{pkg.number}</span>
                <span className="font-body text-xs uppercase tracking-[0.18em] text-ink/45">
                  {index === 0 ? "Where most couples start" : `Package ${pkg.number}`}
                </span>
              </div>

              <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(270px,.55fr)] lg:gap-20">
                <div>
                  <h2 id={`${pkg.id}-title`} className="max-w-5xl font-display text-[clamp(2.65rem,5vw,5.4rem)] leading-[0.98] tracking-[-0.025em]">
                  {pkg.name}
                  </h2>
                  <p className="mt-5 font-display text-xl italic text-gold md:text-2xl">{pkg.tagline}</p>
                  <p className="mt-7 max-w-3xl font-body text-base leading-[1.75] text-ink/70">
                    {pkg.description}
                  </p>
                </div>

                <div className="border-t border-ink/15 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
                  <div className="mb-2 font-body text-xs uppercase tracking-[0.18em] text-ink/45">
                    Investment
                  </div>
                  <div className="mb-7 font-display text-4xl text-ink md:text-5xl">{pkg.price}</div>
                  <BookButton packageName={pkg.name} />
                  {pkg.price.endsWith("+") && (
                    <p className="mt-4 font-body text-sm leading-relaxed text-ink/60">
                      Starting investment. Final pricing is tailored to your celebration.
                    </p>
                  )}
                  {pkg.id === "full-planning" && (
                    <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">
                      Planning and creative direction are included. Floral design, décor production,
                      rentals, installations, and third-party goods and services are quoted separately.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-10 md:mt-12">
                <h3 className="mb-4 font-body text-xs uppercase tracking-[0.18em] text-ink/50">At a glance</h3>
                <ul className="grid gap-x-12 md:grid-cols-2">
                  {pkg.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-4 border-t border-ink/10 py-4 font-body text-sm leading-relaxed text-ink/75 md:text-base">
                      <span aria-hidden="true" className="text-gold">—</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 md:mt-10">
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
