import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Pinyon_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1263840655319183');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1263840655319183&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
