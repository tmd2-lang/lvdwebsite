import type { Metadata } from "next";
import ConsultationClient from "./ConsultationClient";

export const metadata: Metadata = {
  title: "Check Date Availability & Request Consultation",
  description:
    "Check wedding and event date availability with Lady Victoria Designs. Request a private 1-on-1 design consultation with Irene for luxury floral and spatial production in Washington DC, MD, VA, and beyond.",
  alternates: {
    canonical: "/consultation",
  },
  openGraph: {
    title: "Check Date Availability & Request Consultation | Lady Victoria Designs",
    description:
      "Check wedding and event date availability with Lady Victoria Designs. Request a private 1-on-1 design consultation with Irene for luxury floral and spatial production.",
    images: ["/gallery/amber-kendall/amber-kendall-23.jpeg"],
  },
};

export default function ConsultationPage() {
  return <ConsultationClient />;
}
