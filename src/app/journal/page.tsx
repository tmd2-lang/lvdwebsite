import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/sections/Contact";
import {
  formatIssueDate,
  getJournalPosts,
  issueLabel,
  type JournalPost,
} from "@/lib/journal-data";

export const metadata: Metadata = {
  title: "The Journal | Wedding Planning Notes & Floral Inspiration",
  description:
    "Planning wisdom, floral guidance, and venue notes from the Lady Victoria Designs studio — written for couples designing a celebration in Washington, DC and beyond.",
  alternates: { canonical: "/journal" },
};

/** The most recent entry, shown full-bleed with its metadata over the image. */
function FeaturedPost({ post }: { post: JournalPost }) {
  return (
    <Link href={`/journal/${post.slug}`} className="group relative block h-[72vh] min-h-[28rem] w-full overflow-hidden">
      <Image
        src={post.heroImage}
        alt={post.heroAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center transition-transform duration-[1500ms] ease-out group-hover:scale-[1.03]"
      />

      {/* Scrim so the overlaid type stays legible on bright wedding imagery. */}
      {/* Targeted scrims: heavy only where type sits, so the image stays open
          through the middle. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/75 via-ink/35 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-14">
        <div className="flex items-center gap-6 font-body text-[10px] uppercase tracking-[0.24em] text-ivory/95 [text-shadow:0_1px_3px_rgb(20_18_15_/_0.55)] sm:text-[11px]">
          <span>{issueLabel(post.issueNumber)}</span>
          <span>{formatIssueDate(post.date)}</span>
        </div>

        <div className="max-w-3xl">
          <p className="font-body text-[10px] uppercase tracking-[0.28em] text-gold">
            {post.category}
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,3.75rem)] uppercase leading-[1.08] tracking-tight text-ivory [text-shadow:0_2px_12px_rgb(20_18_15_/_0.45)]">
            {post.title}
          </h2>
          <span className="mt-5 inline-block border-b border-ivory/50 pb-1 font-body text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors group-hover:border-gold group-hover:text-gold">
            Read more
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: JournalPost }) {
  return (
    <article className="group">
      <Link href={`/journal/${post.slug}`} className="block">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-ecru">
          <Image
            src={post.heroImage}
            alt={post.heroAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </div>

        <div className="mt-5 border-t border-ink/15 pt-4">
          <div className="flex items-center gap-5 font-body text-[10px] uppercase tracking-[0.22em] text-ink/45">
            <span>{issueLabel(post.issueNumber)}</span>
            <span>{formatIssueDate(post.date)}</span>
          </div>

          <h2 className="mt-3 font-display text-xl uppercase leading-[1.2] tracking-tight text-ink transition-colors duration-300 group-hover:text-gold md:text-[1.4rem]">
            {post.title}
          </h2>

          <p className="mt-3 font-body text-sm font-light leading-relaxed text-ink/65">
            {post.excerpt}
          </p>

          <span className="mt-4 inline-block font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 transition-colors group-hover:text-gold">
            Read more
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function JournalPage() {
  const posts = getJournalPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <main className="w-full bg-ivory pb-24 text-ink selection:bg-gold/20 selection:text-ink">
        <section className="relative flex w-full flex-col items-center overflow-hidden px-6 pt-28 pb-20 text-center md:pb-24">
          <p className="relative z-10 font-body text-[10px] font-medium uppercase tracking-[0.3em] text-gold sm:text-[11px]">
            Notes From The Studio
          </p>

          <h1 className="relative z-10 mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[1.05] tracking-tight text-ink">
            The Journal
          </h1>

          <p className="relative z-10 mt-6 max-w-2xl font-body text-sm font-light leading-relaxed text-ink/70 sm:text-base">
            Planning wisdom, floral guidance, and the thinking behind our favorite
            celebrations — gathered for couples designing something worth
            remembering.
          </p>

          {/* Script wordmark, oversized so it bleeds past both edges and is
              clipped by the section rather than sitting under the body copy. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-8 select-none whitespace-nowrap text-center font-script text-[clamp(5rem,16vw,13rem)] leading-none text-gold/20 md:-bottom-12"
          >
            The Journal
          </span>
        </section>

        {posts.length === 0 ? (
          <section className="mx-auto w-full max-w-2xl px-6 md:px-12">
            <div className="border border-ink/10 bg-white px-8 py-16 text-center shadow-xs">
              <p className="font-script text-3xl text-gold">Coming soon</p>
              <p className="mt-4 font-body text-sm font-light leading-relaxed text-ink/70">
                The first entries are being written. In the meantime, our work
                speaks in the gallery.
              </p>
              <Link
                href="/gallery"
                className="mt-8 inline-block border-b border-ink pb-1 font-body text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-gold"
              >
                View The Gallery
              </Link>
            </div>
          </section>
        ) : (
          <>
            <FeaturedPost post={featured} />

            {rest.length > 0 && (
              <section className="mx-auto w-full max-w-6xl px-6 pt-16 md:px-12 md:pt-24">
                <div className="mb-10 flex items-center gap-4">
                  <h2 className="font-body text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                    More Entries
                  </h2>
                  <span className="h-px flex-1 bg-ink/10" />
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Contact />
    </>
  );
}
