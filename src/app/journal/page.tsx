import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/sections/Contact";
import { formatJournalDate, getJournalPosts, type JournalPost } from "@/lib/journal-data";

export const metadata: Metadata = {
  title: "The Journal | Wedding Planning Notes & Floral Inspiration",
  description:
    "Planning wisdom, floral guidance, and venue notes from the Lady Victoria Designs studio — written for couples designing a celebration in Washington, DC and beyond.",
  alternates: { canonical: "/journal" },
};

function PostCard({ post, priority = false }: { post: JournalPost; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/journal/${post.slug}`} className="block">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-ecru">
          <Image
            src={post.heroImage}
            alt={post.heroAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </div>

        <div className="pt-6">
          <div className="flex items-center gap-3 font-body text-[10px] uppercase tracking-[0.24em] text-gold">
            <span>{post.category}</span>
            <span className="h-px w-4 bg-gold/40" />
            <span className="text-ink/45">{post.readingMinutes} min read</span>
          </div>

          <h2 className="mt-3 font-display text-2xl md:text-[1.75rem] leading-[1.2] tracking-tight text-ink transition-colors duration-300 group-hover:text-gold">
            {post.title}
          </h2>

          <p className="mt-3 font-body text-sm font-light leading-relaxed text-ink/70">
            {post.excerpt}
          </p>

          <p className="mt-4 font-body text-[10px] uppercase tracking-[0.2em] text-ink/40">
            <time dateTime={post.date}>{formatJournalDate(post.date)}</time>
          </p>
        </div>
      </Link>
    </article>
  );
}

export default function JournalPage() {
  const posts = getJournalPosts();

  return (
    <>
      <main className="w-full min-h-screen bg-ivory pt-32 pb-24 text-ink selection:bg-gold/20 selection:text-ink">
        <section className="mx-auto mb-16 flex w-full max-w-6xl flex-col items-center px-6 text-center md:mb-20 md:px-12">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/50" />
            <span className="font-body text-[10px] font-medium uppercase tracking-[0.3em] text-gold sm:text-[11px]">
              Notes From The Studio
            </span>
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <h1 className="mb-6 font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.08] tracking-tight text-ink">
            The <span className="font-normal italic text-gold">Journal</span>
          </h1>

          <p className="mb-2 max-w-2xl text-center font-body text-sm font-light leading-relaxed text-ink/75 sm:text-base">
            Planning wisdom, floral guidance, and the thinking behind our favorite
            celebrations — gathered here for couples designing something worth
            remembering.
          </p>
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
          <section className="mx-auto w-full max-w-6xl px-6 md:px-12">
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <PostCard key={post.slug} post={post} priority={index < 3} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Contact />
    </>
  );
}
