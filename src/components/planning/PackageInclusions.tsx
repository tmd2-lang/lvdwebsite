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
    <details className="group border-y border-ink/15">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-body text-[0.65rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        <span>View everything included</span>
        <span
          aria-hidden="true"
          className="text-xl font-light leading-none text-gold transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="pb-7 pt-2 md:pb-9">
        <div className="flex flex-col gap-8">
          {sections.map((section, sectionIndex) => (
            <section key={section.title || `inclusions-${sectionIndex}`}>
              {section.title ? (
                <h3 className="mb-3 font-body text-[0.62rem] uppercase tracking-[0.16em] text-ink/55">
                  {section.title}
                </h3>
              ) : null}
              <ul className="flex flex-col">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 border-b border-ink/10 py-3.5 font-body text-sm leading-relaxed text-ink/75 last:border-b-0"
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
          <p className="mt-8 border-t border-ink/15 pt-5 font-body text-xs leading-relaxed text-ink/55">
            <span className="text-ink/75">Please note:</span> {packageDetails.note}
          </p>
        ) : null}
      </div>
    </details>
  );
}
