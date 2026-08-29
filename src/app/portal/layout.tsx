import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planning Portal",
  description: "Your private Lady Victoria Designs planning workspace.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
