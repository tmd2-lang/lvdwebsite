import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Design, Florals & Event Production",
  description: "Explore full-service event production, floral design, staging, lighting, décor, and rentals from Lady Victoria Designs.",
  alternates: { canonical: "/services" },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
