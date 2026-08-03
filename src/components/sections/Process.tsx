"use client";
import { useState } from "react";
import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "Consultation",
    desc: "We begin by listening. Understanding your vision, your venue, and the emotional resonance you want to achieve.",
    image: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&q=80&w=1200"
  },
  {
    num: "02",
    title: "Design Concept",
    desc: "Translating your desires into a rigorous visual vocabulary. Color palettes, floral textures, and spatial layouts.",
    image: "https://images.unsplash.com/photo-1522748906645-95d8adfa52c1?auto=format&fit=crop&q=80&w=1200"
  },
  {
    num: "03",
    title: "Production",
    desc: "Our team sources the rarest blooms and orchestrates the fabrication of custom structural elements.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200"
  },
  {
    num: "04",
    title: "The Reveal",
    desc: "The doors open. The room is transformed. This is the moment your vision becomes an immersive reality.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200"
  }
];

export default function Process() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="w-full bg-ivory py-32 md:py-48 px-6 md:px-12 border-t border-gold/20 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-16 md:gap-24 relative z-10">
        
        {/* Left: Tabs */}
        <div className="w-full md:w-5/12 flex flex-col">
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-16">
            The <span className="italic text-gold">Process</span>
          </h2>
          
          <div className="flex flex-col border-t border-ink/20">
            {steps.map((step, idx) => {
              const isActive = activeTab === idx;
              return (
                <div 
                  key={step.num}
                  onClick={() => setActiveTab(idx)}
                  className="py-8 border-b border-ink/20 cursor-pointer group transition-all duration-500"
                >
                  <div className="flex items-baseline gap-6 md:gap-8">
                    <span className={`font-body text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                      isActive ? "text-gold" : "text-ink/40 group-hover:text-ink/70"
                    }`}>
                      Chapter {step.num}
                    </span>
                    <h3 className={`font-display text-3xl md:text-4xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isActive ? "text-ink italic translate-x-2 md:translate-x-4" : "text-ink/60 group-hover:text-ink"
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  
                  {/* Expanding Description */}
                  <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isActive ? "max-h-48 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
                  }`}>
                    <p className="font-body text-ink/70 leading-[1.8] max-w-[40ch] pl-[4.5rem] md:pl-[6rem]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Image Frame */}
        <div className="w-full md:w-7/12 h-[60vh] md:h-[80vh] bg-ecru relative overflow-hidden mt-8 md:mt-0">
          {steps.map((step, idx) => (
            <Image
              key={step.num}
              src={step.image} 
              alt={step.title}
              fill
              sizes="(max-width: 767px) 100vw, 58vw"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                activeTab === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
