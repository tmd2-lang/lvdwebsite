"use client";

import ConceptSwitcher from "@/components/ConceptSwitcher";
import Hero from "@/components/sections/Hero";
import Credibility from "@/components/sections/Credibility";
import Narrative from "@/components/sections/Narrative";
import ParallaxDivider from "@/components/sections/ParallaxDivider";
import SignatureWork from "@/components/sections/SignatureWork";
import Services from "@/components/sections/Services";
import MeetIrene from "@/components/sections/MeetIrene";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function ConceptBPage() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-ivory text-ink">
      <ConceptSwitcher />

      {/* CONCEPT B HERO: ONE SINGLE UNIFIED CINEMATIC SHUTTER OPENER */}
      <Hero />

      {/* DIRECT FLOW INTO CREDIBILITY & NARRATIVE */}
      <Credibility />
      <Narrative />
      <ParallaxDivider />
      <SignatureWork />
      <Services />
      <MeetIrene />
      <Testimonials />
      <Contact />
    </main>
  );
}
