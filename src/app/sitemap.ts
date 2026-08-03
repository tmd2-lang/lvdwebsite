import type { MetadataRoute } from "next";

const siteUrl = "https://www.ladyvictoriadesigns.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/gallery`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/testimonials`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/quiz`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/inquire`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
