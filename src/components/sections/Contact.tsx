"use client";
import React from "react";

export default function Contact() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-ink" id="contact">
      {/* Full Bleed Background Image */}
      <img
        src="/gallery/LVD Floral Images/LVDFloralBride2.jpeg"
        alt="Wedding Details"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-ink/30" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-32 flex flex-col xl:flex-row justify-between gap-16 xl:gap-24">
        
        {/* Left Column: Typography & Info */}
        <div className="flex flex-col flex-1 justify-end pb-4 md:pb-8">
          <h2 className="font-display text-[clamp(4rem,7vw,7rem)] text-ivory leading-none mb-8 md:mb-16">
            Contact us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-ivory">
            <div className="flex flex-col gap-1">
              <h4 className="font-body text-[9px] uppercase tracking-widest text-gold font-bold mb-2">Contact</h4>
              <a href="mailto:inquire@ladyvictoriadesigns.com" className="font-body text-xs md:text-sm hover:text-gold transition-colors">inquire@ladyvictoriadesigns.com</a>
              <a href="tel:+12025550123" className="font-body text-xs md:text-sm hover:text-gold transition-colors">+1 202-555-0123</a>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-body text-[9px] uppercase tracking-widest text-gold font-bold mb-2">Our Location</h4>
              <p className="font-body text-xs md:text-sm">Brandywine, Maryland</p>
              <p className="font-body text-xs md:text-sm text-ivory/70">Serving Washington D.C.</p>
            </div>
          </div>
        </div>

        {/* Right Column: The Form Card */}
        <div className="w-full xl:w-[500px] 2xl:w-[550px] shrink-0 bg-ivory p-6 md:p-8 shadow-2xl mt-12 xl:mt-0">
          <h3 className="font-display text-2xl text-ink mb-3">Begin your journey</h3>
          <p className="font-body text-[11px] md:text-xs text-ink/70 leading-relaxed mb-6">
            We accept a limited number of commissions each year to ensure uncompromising quality. Please share a few details about your celebration, and our team will be in touch shortly.
          </p>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            {/* 2 Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[10px] md:text-xs text-ink/80">Couple's Names*</label>
                <input 
                  type="text" 
                  placeholder="Jane & John" 
                  className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[10px] md:text-xs text-ink/80">Email Address*</label>
                <input 
                  type="email" 
                  placeholder="hello@example.com" 
                  className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[10px] md:text-xs text-ink/80">Event Date*</label>
                <input 
                  type="date" 
                  className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[10px] md:text-xs text-ink/80">Guest Count</label>
                <input 
                  type="number" 
                  placeholder="150" 
                  className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors" 
                />
              </div>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[10px] md:text-xs text-ink/80">Event Details & Vision</label>
              <textarea 
                rows={3} 
                placeholder="Tell us about the celebration you are dreaming of..." 
                className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors resize-none"
              ></textarea>
            </div>

            {/* Radio & Phone Input Group (Matching the screenshot) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="font-body text-[10px] md:text-xs text-ink/80">Preferred contact method*</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-body text-xs text-ink cursor-pointer">
                    <input type="radio" name="contact_method" value="phone" className="accent-gold cursor-pointer" defaultChecked />
                    Phone
                  </label>
                  <label className="flex items-center gap-2 font-body text-xs text-ink cursor-pointer">
                    <input type="radio" name="contact_method" value="email" className="accent-gold cursor-pointer" />
                    Email
                  </label>
                </div>
              </div>
              <input 
                type="tel" 
                placeholder="+1 202 555 0123" 
                className="border border-ink/20 p-2.5 font-body text-xs md:text-sm bg-transparent outline-none focus:border-gold transition-colors flex-1 w-full sm:w-auto"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 accent-gold cursor-pointer" required />
                <span className="font-body text-[9px] text-ink/70 leading-snug group-hover:text-ink transition-colors">
                  I agree to the Privacy Policy and consent to Lady Victoria Designs processing my inquiry details.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 accent-gold cursor-pointer" />
                <span className="font-body text-[9px] text-ink/70 leading-snug group-hover:text-ink transition-colors">
                  I would love to receive occasional event inspiration and updates from Irene.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                className="bg-ink text-ivory font-body text-[10px] md:text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-gold transition-colors"
              >
                Inquire →
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
