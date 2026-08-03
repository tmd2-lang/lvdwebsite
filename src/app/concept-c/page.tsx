"use client";

import { useState } from "react";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";
import ConceptSwitcher from "@/components/ConceptSwitcher";
import Credibility from "@/components/sections/Credibility";
import Narrative from "@/components/sections/Narrative";
import ParallaxDivider from "@/components/sections/ParallaxDivider";
import SignatureWork from "@/components/sections/SignatureWork";
import Services from "@/components/sections/Services";
import MeetIrene from "@/components/sections/MeetIrene";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Image from "next/image";

export default function ConceptCPage() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const columns = [
    {
      id: 0,
      title: "The Ceremony",
      tag: "CEREMONY & STRUCTURES",
      image: "/gallery/Amber & Kendall Wedding/Amber&KendallTableShot.jpeg",
      venue: "Meridian House, D.C."
    },
    {
      id: 1,
      title: "The Production",
      tag: "FULL RECEPTION DESIGN",
      image: "/hero/6203022671217922801_edited.jpg",
      venue: "The Anderson House"
    },
    {
      id: 2,
      title: "The Details",
      tag: "FLORAL ARCHITECTURE",
      image: "/gallery/Jenny & Jordan Wedding/Jenny&JordanCoupleShot1.jpeg",
      venue: "Private Country Estate"
    }
  ];

  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-ivory text-ink">
      <ConceptSwitcher />

      {/* CONCEPT C HERO: THE HIGH-FASHION MAGAZINE COVER & TRIPTYCH */}
      <section className="relative w-full min-h-screen pt-28 md:pt-32 pb-16 px-6 md:px-12 flex flex-col justify-between border-b border-ink/10">
        
        {/* Masthead Header */}
        <div className="w-full text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-3">
            <span>Washington, D.C.</span>
            <span>•</span>
            <span>Est. 2018</span>
            <span>•</span>
            <span>Worldwide Destinations</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7.5vw,7.8rem)] leading-[0.95] tracking-tight uppercase text-ink">
            LADY <span className="italic font-normal text-gold lowercase">Victoria</span> DESIGNS
          </h1>
        </div>

        {/* 3-Column Interactive Triptych */}
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[55vh] md:h-[60vh] min-h-[420px] mb-8">
          {columns.map((col, idx) => {
            const isHovered = hoveredCol === idx;
            const isAnyHovered = hoveredCol !== null;

            return (
              <div
                key={col.id}
                onMouseEnter={() => setHoveredCol(idx)}
                onMouseLeave={() => setHoveredCol(null)}
                className={`relative h-full overflow-hidden border border-ink/15 rounded-sm group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isHovered
                    ? "md:scale-[1.02] shadow-2xl z-20"
                    : isAnyHovered
                    ? "opacity-60 md:scale-[0.98]"
                    : "opacity-100"
                }`}
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-ivory">
                  <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold block mb-1">
                    {col.tag}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl text-ivory mb-1">
                    {col.title}
                  </h3>
                  <p className="font-body text-[10px] text-ivory/70 tracking-wider">
                    {col.venue}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Editorial Bar */}
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-ink/10 font-body text-xs text-ink/75">
          <p className="max-w-md text-center sm:text-left leading-relaxed">
            Full-service wedding & event design for couples who seek extraordinary botanical artistry and seamless execution.
          </p>

          <div className="flex items-center gap-4">
            <Magnetic>
              <Link
                href="/quiz"
                className="bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 hover:bg-gold hover:text-ink transition-colors duration-300 shadow-sm"
              >
                Investment Quiz →
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/inquire"
                className="border border-ink/20 text-ink font-body text-[11px] uppercase tracking-[0.2em] px-6 py-3.5 hover:bg-ink hover:text-ivory transition-colors duration-300"
              >
                Inquire
              </Link>
            </Magnetic>
          </div>
        </div>

      </section>

      {/* DIRECT FLOW INTO REST OF SITE */}
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
