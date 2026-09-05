import type { PlanningPackage } from "@/data/packages";

export default function PackageInclusions({ packageDetails }: { packageDetails: PlanningPackage }) {
  const sections =
    packageDetails.inclusionSections ?? [
      {
        title: "",
        items: packageDetails.includes,
      },
  ];

  return (
    <details className="group border-y border-ink/20">
      <summary className="grid min-h-20 cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-6 py-5 font-body text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:grid-cols-[minmax(170px,.35fr)_minmax(0,1.65fr)_auto] [&::-webkit-details-marker]:hidden">
        <span>What&rsquo;s included</span>
        <span className="hidden normal-case tracking-normal text-ink/45 transition-colors group-hover:text-ink/60 md:block">
          View the complete package scope
        </span>
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full border border-gold/50 text-xl font-light leading-none text-gold transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-ink/15 bg-ecru/45 px-5 py-9 md:px-8 md:py-12 lg:px-12 lg:py-14">
        <div className="mb-10 grid gap-3 border-b border-ink/15 pb-9 md:grid-cols-[minmax(170px,.35fr)_minmax(0,1.65fr)] md:gap-8">
          <h3 className="font-body text-xs uppercase tracking-[0.18em] text-ink/50">Ideal for</h3>
          <p className="max-w-3xl font-display text-xl leading-relaxed text-ink/80 md:text-2xl">
            {packageDetails.idealFor}
          </p>
        </div>

        <div className="flex flex-col gap-10 md:gap-12">
          {sections.map((section, sectionIndex) => (
            <section
              className="grid gap-4 md:grid-cols-[minmax(170px,.35fr)_minmax(0,1.65fr)] md:gap-8"
              key={section.title || `inclusions-${sectionIndex}`}
            >
              {section.title ? (
                <h3 className="font-body text-xs uppercase tracking-[0.16em] text-ink/55">
                  {section.title}
                </h3>
              ) : (
                <h3 className="font-body text-xs uppercase tracking-[0.16em] text-ink/55">Package scope</h3>
              )}
              <ul className="grid gap-x-10 lg:grid-cols-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 border-b border-ink/10 py-4 font-body text-[0.95rem] leading-relaxed text-ink/75 md:text-base"
                  >
                    <span className="shrink-0 text-gold" aria-hidden="true">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {packageDetails.note ? (
          <p className="mt-12 border-t border-ink/15 pt-7 font-body text-sm leading-relaxed text-ink/55">
            <span className="text-ink/75">Please note:</span> {packageDetails.note}
          </p>
        ) : null}
      </div>
    </details>
  );
}
