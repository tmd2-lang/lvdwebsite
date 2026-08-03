import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve Your Date | Lady Victoria Designs | Luxury DC Floral Architecture",
  description: "Now accepting 2026 & 2027 wedding commissions. Experience bespoke floral architecture and full-scale luxury event production across Washington D.C., Maryland, and Virginia.",
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
