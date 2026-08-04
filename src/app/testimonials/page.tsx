import type { Metadata } from "next";
import TestimonialsClient from "./TestimonialsClient";

export const metadata: Metadata = {
  title: "Client Testimonials & Kind Words | Lady Victoria Designs",
  description: "Read 5-star verified reviews from couples and clients who partnered with Lady Victoria Designs for bespoke floral artistry and luxury event production.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
