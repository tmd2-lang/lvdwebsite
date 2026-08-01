import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Lady Victoria Designs",
  description: "Lady Victoria Designs is a premier event architecture and floral design studio.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
