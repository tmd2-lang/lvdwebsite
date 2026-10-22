import type { Metadata } from "next";
import Image from "next/image";
import BookButton from "@/components/planning/BookButton";
import PlanningDetailsButton from "@/components/planning/PlanningDetailsButton";
import { PLANNING_PACKAGES } from "@/data/packages";
import { media } from "@/lib/media-slots";

const packageImages = [
  media["home.work.1"],
  media["home.work.2"],
  media["home.work.3"],
  media["home.work.4"],
];

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

      {/* PACKAGES */}
      <section className="w-full flex flex-col border-b border-ink/20">
        {PLANNING_PACKAGES.map((pkg, index) => (
          <article key={pkg.id} id={pkg.id} aria-labelledby={`${pkg.id}-title`} className="w-full scroll-mt-28 border-t border-ink/20">
            <div className={`flex w-full flex-col-reverse lg:flex-row ${index % 2 ? "lg:flex-row-reverse" : ""}`}>
              <div className={`flex w-full flex-col justify-between px-8 py-12 md:px-12 md:py-16 lg:w-2/5 lg:p-16 ${index % 2 ? "lg:border-l" : "lg:border-r"} border-ink/20`}>
                <div>
                  <span className="mb-4 block font-body text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    {pkg.number} · {index === 0 ? "Where most couples start" : `Package ${pkg.number}`}
                  </span>
                  <h2 id={`${pkg.id}-title`} className="font-display text-[clamp(2.3rem,4vw,4.5rem)] leading-[1.02] text-ink">
                    {pkg.name}
                  </h2>
                  <p className="mt-5 font-display text-xl italic text-gold md:text-2xl">{pkg.tagline}</p>
                </div>
                <div className="mt-12 flex flex-col gap-7 lg:mt-24">
                  <p className="max-w-xl font-body text-sm leading-relaxed text-ink/80 md:text-base">{pkg.description}</p>
                  <div className="border-t border-ink/20 pt-6">
                    <p className="mb-2 font-body text-[10px] uppercase tracking-[0.2em] text-ink/50">Investment</p>
                    <p className="mb-6 font-display text-4xl text-ink">{pkg.price}</p>
                    <PlanningDetailsButton packageDetails={pkg} />
                    {pkg.price.endsWith("+") && <p className="mt-4 font-body text-sm leading-relaxed text-ink/60">Starting investment. Final pricing is tailored to your celebration.</p>}
                    {pkg.id === "full-planning" && <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">Planning and creative direction are included. Floral design, décor production, rentals, installations, and third-party goods and services are quoted separately.</p>}
                  </div>
                </div>
              </div>
              <div className="w-full p-0 md:p-8 lg:w-3/5 lg:p-16">
                <div className="relative h-[45vh] min-h-[340px] w-full overflow-hidden md:h-[60vh] lg:h-full lg:min-h-[70vh]">
                  <Image src={packageImages[index]} alt={`${pkg.shortName} wedding celebration by Lady Victoria Designs`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 md:px-12 md:pb-20">
              <BookButton packageName={pkg.name} variant="row" />
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
