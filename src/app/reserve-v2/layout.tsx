import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve V2 | Lady Victoria Designs",
  description:
    "A private working copy of the Lady Victoria Designs reserve experience.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReserveV2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
