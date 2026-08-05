import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve Your Date | Lady Victoria Designs | Luxury DC Floral Architecture",
  description: "Now booking 2026 and 2027 weddings. Experience bespoke floral architecture and full-scale luxury event production across Washington D.C., Maryland, and Virginia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReserveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
