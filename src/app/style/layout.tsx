import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style Guide",
  robots: { index: false, follow: false },
};

export default function StyleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
