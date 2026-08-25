import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const supabaseInquiryImages = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL("/storage/v1/object/public/inquiry_attachments/**", process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.12.183", "10.225.16.51"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
      ...(supabaseInquiryImages ? [supabaseInquiryImages] : []),
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
