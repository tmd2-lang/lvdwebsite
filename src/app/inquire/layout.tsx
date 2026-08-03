import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquire",
  description:
    "Tell Lady Victoria Designs about your wedding, private celebration, corporate event, or floral design vision.",
  alternates: { canonical: "/inquire" },
};

export default function InquireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
