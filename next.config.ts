import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const supabaseInquiryImages = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL("/storage/v1/object/public/inquiry_attachments/**", process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const supabaseSiteImages = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL("/storage/v1/object/public/site-images/**", process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.12.183", "10.225.16.51"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  outputFileTracingIncludes: {
    "/api/admin/documents/*": ["./src/assets/client-documents/welcome-packet.pdf"],
    "/api/portal/documents/*": ["./src/assets/client-documents/welcome-packet.pdf"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
      ...(supabaseInquiryImages ? [supabaseInquiryImages] : []),
      ...(supabaseSiteImages ? [supabaseSiteImages] : []),
    ],
  },
  // The planning investment guide is a static page in public/planning-guide,
  // shared by link only, so it stays out of search results.
  async rewrites() {
    return [{ source: "/planning-guide", destination: "/planning-guide/index.html" }];
  },
  async headers() {
    return [
      {
        source: "/planning-guide/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
