import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Pinyon_Script } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import MarketingScripts from "@/components/MarketingScripts";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  weight: "400",
  variable: "--font-pinyon",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ladyvictoriadesigns.com"),
  title: {
    default: "Lady Victoria Designs | Luxury Wedding & Event Design",
    template: "%s | Lady Victoria Designs",
  },
  description:
    "Full-service luxury wedding design, floral artistry, décor, and event production in Washington, DC and beyond.",
  applicationName: "Lady Victoria Designs",
  creator: "Lady Victoria Designs",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lady Victoria Designs",
    title: "Lady Victoria Designs | Luxury Wedding & Event Design",
    description:
      "Full-service luxury wedding design, floral artistry, décor, and event production in Washington, DC and beyond.",
    images: [
      {
        url: "/gallery/amber-kendall/amber-kendall-23.jpeg",
        width: 1348,
        height: 898,
        alt: "A luxury wedding reception designed by Lady Victoria Designs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lady Victoria Designs | Luxury Wedding & Event Design",
    description:
      "Full-service luxury wedding design, floral artistry, décor, and event production in Washington, DC and beyond.",
    images: ["/gallery/amber-kendall/amber-kendall-23.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${inter.variable} ${pinyon.variable} antialiased selection:bg-gold/30 selection:text-ink`}>
      <body className="font-body bg-ivory text-ink selection:bg-gold/30 min-h-screen">
        <SiteShell>{children}</SiteShell>
        <MarketingScripts />
      </body>
    </html>
  );
}
