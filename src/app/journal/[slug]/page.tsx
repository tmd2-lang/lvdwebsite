import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Contact from "@/components/sections/Contact";
import { formatJournalDate, getJournalPost, getJournalPosts } from "@/lib/journal-data";

export function generateStaticParams() {
  return getJournalPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [{ url: post.heroImage, alt: post.heroAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.heroImage],
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post) notFound();

  const { default: Article } = await import(`@/content/journal/${slug}.mdx`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: `https://www.ladyvictoriadesigns.com${post.heroImage}`,
    author: {
      "@type": "Organization",
      name: "Lady Victoria Designs",
      url: "https://www.ladyvictoriadesigns.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Lady Victoria Designs",
      url: "https://www.ladyvictoriadesigns.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.ladyvictoriadesigns.com/journal/${post.slug}`,
    },
  };

  const others = getJournalPosts().filter((entry) => entry.slug !== post.slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="w-full bg-ivory pt-32 pb-24 text-ink selection:bg-gold/20 selection:text-ink">
        <header className="mx-auto mb-12 w-full max-w-3xl px-6 text-center md:mb-16 md:px-0">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/50" />
            <span className="font-body text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
              {post.category}
            </span>
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.14] tracking-tight text-ink">
            {post.title}
          </h1>

          <p className="mt-6 font-body text-[10px] uppercase tracking-[0.2em] text-ink/45">
            <time dateTime={post.date}>{formatJournalDate(post.date)}</time>
            <span className="mx-2 text-gold/50">·</span>
            {post.readingMinutes} min read
          </p>

          {post.updated && (
            <p className="mt-2 font-body text-[10px] uppercase tracking-[0.2em] text-ink/35">
              Updated <time dateTime={post.updated}>{formatJournalDate(post.updated)}</time>
            </p>
          )}
        </header>

        <div className="mx-auto mb-14 w-full max-w-5xl px-6 md:mb-20 md:px-12">
          <div className="relative aspect-16/9 w-full overflow-hidden bg-ecru">
            <Image
              src={post.heroImage}
              alt={post.heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-center"
            />
          </div>
        </div>

        <article className="mx-auto w-full max-w-[43rem] px-6 md:px-0">
          <Article />
        </article>

        {others.length > 0 && (
          <section className="mx-auto mt-20 w-full max-w-6xl px-6 md:mt-28 md:px-12">
            <div className="mb-10 flex items-center gap-4">
              <h2 className="font-body text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                Keep Reading
              </h2>
              <span className="h-px flex-1 bg-ink/10" />
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((entry) => (
                <Link key={entry.slug} href={`/journal/${entry.slug}`} className="group block">
                  <div className="relative aspect-4/5 w-full overflow-hidden bg-ecru">
                    <Image
                      src={entry.heroImage}
                      alt={entry.heroAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-5 font-body text-[10px] uppercase tracking-[0.24em] text-gold">
                    {entry.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl leading-[1.25] tracking-tight text-ink transition-colors group-hover:text-gold">
                    {entry.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mx-auto mt-20 w-full max-w-[43rem] px-6 text-center md:px-0">
          <Link
            href="/journal"
            className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            ← All Journal Entries
          </Link>
        </div>
      </main>

      <Contact />
    </>
  );
}
