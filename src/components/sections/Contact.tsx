"use client";
import React from "react";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";

export default function Contact() {
  return (
    <section className="relative w-full bg-ivory text-ink py-32 md:py-48 px-6 flex flex-col items-center justify-center text-center border-t border-ink/10" id="contact">
      <div className="max-w-[1440px] w-full flex flex-col items-center justify-center">
        <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-center mb-12 max-w-4xl mx-auto leading-tight">
          Ready to bring your <span className="italic text-gold">vision</span> to life?
        </h2>
        <Magnetic>
          <Link 
            href="/inquire" 
            className="group relative px-8 py-4 border border-ink overflow-hidden inline-block"
          >
            <div className="absolute inset-0 bg-ink translate-y-[101%] transition-transform duration-500 ease-out group-hover:translate-y-0" />
            <span className="relative z-10 font-body text-xs md:text-sm uppercase tracking-widest text-ink transition-colors duration-500 group-hover:text-ivory">
              BOOK A CONSULTATION
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
