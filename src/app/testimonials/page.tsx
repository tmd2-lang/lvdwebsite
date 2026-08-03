import type { Metadata } from "next";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Testimonials | Lady Victoria Designs",
};

export default function TestimonialsPage() {
  return (
    <main className="w-full min-h-screen bg-ink text-ivory flex flex-col pt-24">
      <Testimonials />
      <Contact />
    </main>
  );
}
