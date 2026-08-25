import type { MetadataRoute } from "next";
import { getJournalPosts } from "@/lib/journal-data";

const siteUrl = "https://www.ladyvictoriadesigns.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const journalEntries: MetadataRoute.Sitemap = getJournalPosts().map((post) => ({
    url: `${siteUrl}/journal/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/gallery`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/testimonials`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/journal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/quiz`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/inquire`, changeFrequency: "yearly", priority: 0.8 },
    ...journalEntries,
  ];
}
