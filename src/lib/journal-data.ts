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
  /** Sequential issue number, oldest post is 1. Derived, never stored. */
  issueNumber: number;
  /** Byline shown on the article. Defaults to the studio's creative director. */
  author: string;
  category: JournalCategory;
  /** Path under /public, or a remote pattern allowed in next.config.ts. */
  heroImage: string;
  heroAlt: string;
  featured: boolean;
};

type StoredPost = Omit<JournalPost, "readingMinutes" | "issueNumber" | "author"> & {
  author?: string;
};

const DEFAULT_AUTHOR = "Irene";

const POSTS: StoredPost[] = [
  {
    slug: "what-is-a-design-led-wedding",
    title: "What Is a Design-Led Wedding? (And How It Changes Everything You Book)",
    excerpt:
      "Two weddings in the same ballroom: one looks like a wedding, the other looks like a dream built on purpose. The difference is not budget — it is that the vision came first and everything else was built to serve it.",
    date: "2026-08-25",
    category: "Behind the Design",
    heroImage: "/gallery/amber-kendall/amber-kendall-29.jpeg",
    heroAlt:
      "A sweetheart table with a low white calla lily and rose arrangement by Lady Victoria Designs",
    featured: true,
  },
  {
    slug: "wedding-tablescape-design",
    title: "Wedding Tablescape Design: How to Build a Table Guests Don't Want to Leave",
    excerpt:
      "Guests decide how they feel about the whole evening the second they see their table. Here is how the layers come together — linen, place setting, metals, florals, and candlelight.",
    date: "2026-08-25",
    category: "Floral Design",
    heroImage: "/gallery/table-artistry/table-artistry-01.jpeg",
    heroAlt:
      "A layered wedding tablescape with fine linen, gold chargers, and low florals by Lady Victoria Designs",
    featured: true,
  },
  {
    slug: "wedding-planner-vs-wedding-designer",
    title: "Wedding Planner vs. Wedding Designer: Who Does What (and Who You Need)",
    excerpt:
      "The industry uses these titles loosely, but the jobs are genuinely different. What each one actually does, where they overlap, and the one question that sorts it out in a single phone call.",
    date: "2026-08-25",
    category: "Planning",
    heroImage: "/work/nac-9098.jpg",
    heroAlt:
      "A fully produced ballroom with suspended pampas installations, gold staging, and lounge seating by Lady Victoria Designs",
    featured: true,
  },
  {
    slug: "what-full-service-wedding-design-includes",
    title: "What Full-Service Wedding Design Actually Includes",
    excerpt:
      "\"Full-service\" is one of the loosest phrases in the wedding industry. Here is what it means at Lady Victoria Designs — from the first concept sketch through load-in, installation, and the 90-minute room flip.",
    date: "2026-06-10",
    updated: "2026-08-25",
    category: "Behind the Design",
    heroImage: "/work/eiserike-wedding-0477.jpg",
    heroAlt:
      "An outdoor courtyard reception with lavender tablescapes and towering floral centerpieces by Lady Victoria Designs",
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

/**
 * New posts are prepended to POSTS, so `length - index` holds steady for every
 * existing entry as the list grows.
 */
function withDerived(post: StoredPost, index: number, all: StoredPost[]): JournalPost {
  return {
    ...post,
    author: post.author || DEFAULT_AUTHOR,
    readingMinutes: readingMinutesFor(post.slug),
    issueNumber: all.length - index,
  };
}

function byNewestFirst(a: JournalPost, b: JournalPost) {
  return b.date.localeCompare(a.date);
}

export function getJournalPosts(): JournalPost[] {
  return POSTS.map(withDerived).sort(byNewestFirst);
}

export function getJournalPost(slug: string): JournalPost | null {
  const index = POSTS.findIndex((entry) => entry.slug === slug);
  return index === -1 ? null : withDerived(POSTS[index], index, POSTS);
}

export function getFeaturedJournalPosts(limit = 3): JournalPost[] {
  const posts = getJournalPosts();
  const featured = posts.filter((post) => post.featured);
  return (featured.length >= limit ? featured : posts).slice(0, limit);
}

export function getJournalPostsByCategory(category: JournalCategory): JournalPost[] {
  return getJournalPosts().filter((post) => post.category === category);
}

/** Editorial issue stamp, e.g. "12 · DEC · 25". */
export function formatIssueDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = parsed.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const year = String(parsed.getUTCFullYear()).slice(-2);
  return `${day} · ${month} · ${year}`;
}

/** Zero-padded issue label, e.g. "N.003". */
export function issueLabel(issueNumber: number): string {
  return `N.${String(issueNumber).padStart(3, "0")}`;
}

export function formatJournalDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
