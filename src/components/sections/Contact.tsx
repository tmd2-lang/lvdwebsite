"use client";
import React from "react";
import LetsBeginCard from "@/components/ui/LetsBeginCard";

export default function Contact() {
  return (
    <section className="relative w-full bg-ivory py-32 px-6 flex flex-col items-center justify-center border-t border-ink/10" id="contact">
      <div className="max-w-[1440px] w-full flex flex-col items-center justify-center">
        
        <LetsBeginCard />

        {/* Contact Info Footer */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-ink text-center max-w-4xl mx-auto border-t border-ink/10 pt-16 w-full">
          <div className="flex flex-col gap-2 items-center">
            <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Email</h4>
            <a href="mailto:inquire@ladyvictoriadesigns.com" className="font-body text-sm hover:text-gold transition-colors">inquire@ladyvictoriadesigns.com</a>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Phone</h4>
            <a href="tel:+12025550123" className="font-body text-sm hover:text-gold transition-colors">+1 202-555-0123</a>
          </div>
          <div className="flex flex-col gap-2 items-center sm:col-span-2 md:col-span-1">
            <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Location</h4>
            <p className="font-body text-sm">Washington, D.C.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
