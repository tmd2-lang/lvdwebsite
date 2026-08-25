import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Components available inside every Journal post.
 *
 * These are registered globally in `src/mdx-components.tsx`, so an .mdx file
 * can use them without importing anything.
 */

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <figure className="my-12 border-l border-gold/40 pl-6 md:my-16 md:pl-10">
      <blockquote className="journal-slot font-display text-2xl italic leading-[1.35] tracking-tight text-ink md:text-[2rem]">
        {children}
      </blockquote>
    </figure>
  );
}

export function GoldRule() {
  return (
    <div className="my-12 flex items-center justify-center gap-3 md:my-16" aria-hidden="true">
      <span className="h-px w-12 bg-gold/40" />
      <span className="size-1 rotate-45 bg-gold/60" />
      <span className="h-px w-12 bg-gold/40" />
    </div>
  );
}

export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-12 md:my-16">
      <div className="relative aspect-3/2 w-full overflow-hidden bg-ecru">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover object-center" />
      </div>
      {caption && (
        <figcaption className="mt-3 font-body text-[11px] uppercase tracking-[0.16em] text-ink/45">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function ImagePair({
  left,
  right,
  leftAlt,
  rightAlt,
  caption,
}: {
  left: string;
  right: string;
  leftAlt: string;
  rightAlt: string;
  caption?: string;
}) {
  return (
    <figure className="my-12 md:my-16">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {[
          { src: left, alt: leftAlt },
          { src: right, alt: rightAlt },
        ].map((image) => (
          <div key={image.src} className="relative aspect-4/5 w-full overflow-hidden bg-ecru">
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover object-center" />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 font-body text-[11px] uppercase tracking-[0.16em] text-ink/45">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Timeline({ children }: { children: ReactNode }) {
  return (
    <div className="my-12 border-y border-ink/10 py-2 md:my-16">
      <dl className="divide-y divide-ink/10">{children}</dl>
    </div>
  );
}

export function TimelineItem({
  window: label,
  title,
  children,
}: {
  window: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <dt className="font-body text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
        {label}
      </dt>
      <dd>
        <p className="font-display text-lg tracking-tight text-ink">{title}</p>
        <div className="journal-slot mt-1 font-body text-sm font-light leading-relaxed text-ink/70">
          {children}
        </div>
      </dd>
    </div>
  );
}

export function Verdict({ children, label = "The Verdict" }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-8 border-l-2 border-gold/50 bg-ecru/50 px-6 py-5 md:my-10">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
        {label}
      </p>
      <div className="journal-slot mt-2 font-body text-[0.95rem] font-light leading-[1.75] text-ink/80">
        {children}
      </div>
    </div>
  );
}

export function Scenarios({ children }: { children: ReactNode }) {
  return (
    <div className="my-12 border-y border-ink/10 py-2 md:my-16">
      <dl className="divide-y divide-ink/10">{children}</dl>
    </div>
  );
}

export function Scenario({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
      <dt className="font-body text-[11px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-gold">
        {label}
      </dt>
      <dd className="journal-slot font-body text-[0.95rem] font-light leading-[1.8] text-ink/75">
        {children}
      </dd>
    </div>
  );
}

export function ConsultationCTA({ children }: { children?: ReactNode }) {
  return (
    <aside className="my-14 border border-ink/10 bg-white px-8 py-10 text-center shadow-xs md:my-20 md:px-12">
      <div className="journal-slot font-script text-3xl text-gold">{children ?? "Let's begin"}</div>
      <p className="mx-auto mt-3 max-w-md font-body text-sm font-light leading-relaxed text-ink/70">
        We take a limited number of celebrations each season. Tell us about your
        date and we will share whether it is still open.
      </p>
      <Link
        href="/inquire"
        className="mt-7 inline-block border-b border-ink pb-1 font-body text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-gold"
      >
        Begin Your Inquiry
      </Link>
    </aside>
  );
}
