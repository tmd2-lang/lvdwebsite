import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before You Book the Venue | Free Venue Checklist",
  description:
    "A complimentary venue checklist from Lady Victoria Designs: the questions to ask before you pay a venue deposit.",
  alternates: { canonical: "/venue-checklist" },
};

export default function VenueChecklistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
