import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  ConsultationCTA,
  Figure,
  GoldRule,
  ImagePair,
  PullQuote,
  Scenario,
  Scenarios,
  Timeline,
  TimelineItem,
  Verdict,
} from "@/components/journal/JournalKit";

/**
 * Global MDX styling and component registry.
 *
 * Required by @next/mdx with the App Router. Everything mapped here applies to
 * every .mdx file, so posts stay pure prose with no imports or class names.
 */
const components: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-14 mb-4 font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.2] tracking-tight text-ink">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-3 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-5 font-body text-[0.975rem] font-light leading-[1.85] text-ink/80 md:text-base">
      {children}
    </p>
  ),
  strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-6 list-none space-y-3 pl-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 list-decimal space-y-3 pl-5 marker:font-body marker:text-xs marker:text-gold">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="relative pl-5 font-body text-[0.975rem] font-light leading-[1.8] text-ink/80 before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rotate-45 before:bg-gold/60 md:text-base">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l border-gold/40 pl-6 font-display text-xl italic leading-[1.4] tracking-tight text-ink md:text-2xl">
      {children}
    </blockquote>
  ),
  hr: () => <GoldRule />,
  a: ({ href, children }) => {
    const target = typeof href === "string" ? href : "";
    const isInternal = target.startsWith("/");

    if (isInternal) {
      return (
        <Link
          href={target}
          className="border-b border-gold/40 pb-px text-ink transition-colors hover:border-gold hover:text-gold"
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-gold/40 pb-px text-ink transition-colors hover:border-gold hover:text-gold"
      >
        {children}
      </a>
    );
  },
  // The post component kit, usable in any .mdx file without an import.
  PullQuote,
  GoldRule,
  Figure,
  ImagePair,
  Timeline,
  TimelineItem,
  Scenarios,
  Scenario,
  Verdict,
  ConsultationCTA,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
