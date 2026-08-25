/**
 * The single read layer for the Journal.
 *
 * Every route, the homepage strip, and the sitemap read posts through the
 * functions below and never touch the underlying source. Today that source is
 * a local array fed by MDX modules in `src/content/journal`; swapping it for
 * Supabase later means rewriting only this file.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

/** Average adult reading speed for prose of this kind. */
const WORDS_PER_MINUTE = 225;

export type JournalCategory =
  | "Planning"
  | "Floral Design"
  | "Venues"
  | "Behind the Design"
  | "Real Weddings";

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  "Planning",
  "Floral Design",
  "Venues",
  "Behind the Design",
  "Real Weddings",
];

export type JournalPost = {
  /** URL segment, e.g. "how-far-ahead-to-book-a-floral-designer" */
  slug: string;
  title: string;
  /** One or two sentences used on cards, meta description, and OG tags. */
  excerpt: string;
  /** ISO date the post first went live, yyyy-mm-dd. */
  date: string;
  /** ISO date of the last substantive edit. Drives dateModified for search. */
  updated?: string;
  readingMinutes: number;
  category: JournalCategory;
  /** Path under /public, or a remote pattern allowed in next.config.ts. */
  heroImage: string;
  heroAlt: string;
  featured: boolean;
};

type StoredPost = Omit<JournalPost, "readingMinutes">;

const POSTS: StoredPost[] = [
  {
    slug: "what-full-service-wedding-design-includes",
    title: "What Full-Service Wedding Design Actually Includes",
    excerpt:
      "\"Full-service\" is one of the loosest phrases in the wedding industry. Here is what it means at Lady Victoria Designs — from the first concept sketch through load-in, installation, and the 90-minute room flip.",
    date: "2025-12-12",
    updated: "2026-08-25",
    category: "Behind the Design",
    heroImage: "/work/aniedi-ekemini-471.jpg",
    heroAlt:
      "A ballroom with architectural florals, drapery, chandeliers, and full table styling by Lady Victoria Designs",
    featured: true,
  },
  {
    slug: "wedding-budget-mistakes-that-cost-more",
    title: "The \"Budget-Friendly\" Decisions That End Up Costing You More",
    excerpt:
      "Hiring a friend, buying instead of renting, bringing your own bar — the five most common wedding budget hacks, and what each one actually costs once the logistics come due.",
    date: "2025-12-12",
    updated: "2026-08-25",
    category: "Planning",
    heroImage: "/work/536A6290_websize.jpg",
    heroAlt:
      "An all-white ballroom head table with suspended chandeliers and full floral production",
    featured: true,
  },
  {
    slug: "when-to-book-your-florist",
    title: "When to Book Your Florist: The Timeline Guide for Design-Led Weddings",
    excerpt:
      "Most checklists say florals can wait until six months out. For a cohesive, design-led wedding, the real timeline looks different — and booking early protects both your budget and your first-choice date.",
    date: "2025-12-12",
    updated: "2026-08-25",
    category: "Planning",
    heroImage: "/gallery/aniedi-ekemini-546.jpg",
    heroAlt:
      "A ballroom framed by a suspended floral archway and chandeliers, designed by Lady Victoria Designs",
    featured: true,
  },
];

/**
 * Counts the prose words in a post body, ignoring JSX and markdown syntax.
 * Server-only (reads from disk at build time) — do not import this module from
 * a client component.
 */
function readingMinutesFor(slug: string) {
  try {
    const file = path.join(process.cwd(), "src", "content", "journal", `${slug}.mdx`);
    const prose = readFileSync(file, "utf8")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_[\]()>-]/g, " ");
    const words = prose.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  } catch {
    return 1;
  }
}

function withReadingTime(post: StoredPost): JournalPost {
  return { ...post, readingMinutes: readingMinutesFor(post.slug) };
}

function byNewestFirst(a: JournalPost, b: JournalPost) {
  return b.date.localeCompare(a.date);
}

export function getJournalPosts(): JournalPost[] {
  return POSTS.map(withReadingTime).sort(byNewestFirst);
}

export function getJournalPost(slug: string): JournalPost | null {
  const post = POSTS.find((entry) => entry.slug === slug);
  return post ? withReadingTime(post) : null;
}

export function getFeaturedJournalPosts(limit = 3): JournalPost[] {
  const posts = getJournalPosts();
  const featured = posts.filter((post) => post.featured);
  return (featured.length >= limit ? featured : posts).slice(0, limit);
}

export function getJournalPostsByCategory(category: JournalCategory): JournalPost[] {
  return getJournalPosts().filter((post) => post.category === category);
}

export function formatJournalDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
