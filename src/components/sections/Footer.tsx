"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-ink text-ivory pt-24 pb-8 px-6 md:px-12 flex flex-col justify-between overflow-hidden">
      
      {/* Top Grid */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-24 md:mb-32">
        
        {/* Brand / Tagline */}
        <div className="flex flex-col gap-6 lg:pr-12">
          <div className="font-display text-4xl text-gold italic">LV</div>
          <p className="font-body text-xs md:text-sm text-ivory/70 leading-relaxed">
            Curating breathtaking floral masterpieces and unforgettable luxury events across the East Coast. Your vision, meticulously crafted.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">Explore</h4>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Home</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">About Irene</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Signature Work</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Services</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Inquire</a>
        </div>

        {/* Socials */}
        <div className="flex flex-col gap-4">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">Connect</h4>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Instagram</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Pinterest</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">Facebook</a>
          <a href="#" className="font-body text-sm hover:text-gold transition-colors w-fit">The Knot</a>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">The Inner Circle</h4>
          <p className="font-body text-xs text-ivory/70 mb-2 leading-relaxed">
            Subscribe to receive occasional floral inspiration and updates from our atelier.
          </p>
          <form className="flex border-b border-ivory/20 pb-2 hover:border-gold transition-colors group" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Email address..." 
              className="bg-transparent font-body text-sm text-ivory placeholder:text-ivory/30 outline-none w-full"
            />
            <button type="submit" className="text-gold font-body text-xs uppercase tracking-wider group-hover:text-ivory transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Massive Typography */}
      <div className="w-full flex items-center justify-center border-t border-ivory/10 pt-12 md:pt-20 mb-12 md:mb-16">
        <h1 className="font-display text-[12vw] leading-[0.8] text-ivory tracking-tighter text-center uppercase">
          Lady Victoria
        </h1>
      </div>

      {/* Bottom Bar */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-body text-ivory/40 uppercase tracking-[0.2em] text-center md:text-left">
        <p>© 2026 Lady Victoria Designs</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-ivory transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-ivory transition-colors">Terms of Service</a>
        </div>
        <p>Designed by Antigravity</p>
      </div>

    </footer>
  );
}
