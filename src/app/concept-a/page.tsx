"use client";

import Link from "next/link";
import Magnetic from "@/components/Magnetic";
import ConceptSwitcher from "@/components/ConceptSwitcher";
import SweepingCurtsy from "@/components/parked/SweepingCurtsy";
import ParallaxDivider from "@/components/sections/ParallaxDivider";
import SignatureWork from "@/components/sections/SignatureWork";
import Services from "@/components/sections/Services";
import MeetIrene from "@/components/sections/MeetIrene";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default function ConceptAPage() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-ivory text-ink">
      <ConceptSwitcher />

      {/* CONCEPT A HERO: THE ARCHITECTURAL EDITORIAL FRAME */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-28 md:pt-36 pb-20 px-6 md:px-12 lg:px-20 border-b border-ink/10">
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Masthead */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold"></span>
              <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                EST. 2018 · Washington, D.C. & Beyond
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[0.95] tracking-tight uppercase text-ink mb-6">
              LADY <br />
              <span className="italic font-normal text-gold lowercase">Victoria</span> <br />
              DESIGNS
            </h1>

            <p className="font-body text-base md:text-lg text-ink/75 max-w-xl leading-relaxed mb-10">
              Transforming historic estates, museums, and private properties through bespoke floral architecture and white-glove event production.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
              <Magnetic>
                <Link
                  href="/quiz"
                  className="bg-ink text-ivory font-body text-xs uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold hover:text-ink transition-colors duration-300 text-center shadow-sm"
                >
                  Investment Quiz →
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/gallery"
                  className="border border-ink/20 text-ink font-body text-xs uppercase tracking-[0.2em] px-8 py-4 hover:bg-ink hover:text-ivory transition-colors duration-300 text-center"
                >
                  View Signature Work
                </Link>
              </Magnetic>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-ink/10 font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink/60">
              <div>Full Production</div>
              <div>•</div>
              <div>Floral Design</div>
              <div>•</div>
              <div>Destination Events</div>
            </div>
          </div>

          {/* Right Column: Floating Architectural Frame */}
          <div className="lg:col-span-6 relative w-full h-[520px] sm:h-[620px] lg:h-[680px] flex items-center justify-center">
            {/* Background Decorative Accent Box */}
            <div className="absolute inset-0 bg-ecru border border-ink/10 rounded-t-[140px] rounded-b-md transform translate-x-3 translate-y-3 -z-10" />

            {/* Video / Photo Frame */}
            <div className="relative w-full h-full rounded-t-[140px] rounded-b-md overflow-hidden border border-ink/20 shadow-2xl bg-ink group">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/gallery/white-green-botanicals/white-green-botanicals-04.jpeg"
                aria-hidden="true"
                className="w-full h-full object-cover scale-[1.05] group-hover:scale-100 transition-transform duration-1000 ease-out"
              >
                <source src="/lvd-hero-web.m4v" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Caption inside frame */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-ivory">
                <div>
                  <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold block mb-1">FEATURED VENUE</span>
                  <span className="font-display text-lg md:text-xl">Meridian House, D.C.</span>
                </div>
                <span className="font-body text-[9px] uppercase tracking-widest text-ivory/60">LIVE REEL</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DIRECT FLOW INTO REST OF SITE */}
      <SweepingCurtsy />
      <ParallaxDivider />
      <SignatureWork />
      <Services />
      <MeetIrene />
      <Testimonials />
      <Contact />
    </main>
  );
}
