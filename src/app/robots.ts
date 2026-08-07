import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/", "/concept-a/", "/concept-b/", "/concept-c/", "/style/"],
    },
    sitemap: "https://www.ladyvictoriadesigns.com/sitemap.xml",
    host: "https://www.ladyvictoriadesigns.com",
  };
}
