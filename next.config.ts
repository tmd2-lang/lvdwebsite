import type { NextConfig } from "next";

const supabaseInquiryImages = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL("/storage/v1/object/public/inquiry_attachments/**", process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.12.183", "10.225.16.51"],
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

export default nextConfig;
