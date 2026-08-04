"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";
import Image from "next/image";

type FormData = {
  celebrationType: string;
  date: string;
  venue: string;
  guestCount: string;
  services: string[];
  vision: string;
  investment: string;
  name: string;
  email: string;
  phone: string;
  source: string;
};

export default function InquirePage() {
  const [step, setStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    celebrationType: "",
    date: "",
    venue: "",
    guestCount: "",
    services: [],
    vision: "",
    investment: "",
    name: "",
    email: "",
    phone: "",
    source: ""
  });

  // Handle GSAP animation between steps
  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-content",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [step]);

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Smooth scroll to top when expanding to full screen confirmation
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(6);
  };

  const isIntimateGuestCount = formData.guestCount === "Under 50 Guests";

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col lg:flex-row relative overflow-x-clip">
      
      {/* LEFT SIDE: Sticky Editorial Image (Hidden on Step 6 confirmation so it expands full screen) */}
      {step !== 6 && (
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden z-10">
          <Image
            src="/gallery/amber-kendall/amber-kendall-23.jpeg"
            alt="Lady Victoria Designs Event Planning"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            fetchPriority="high"
            className="w-full h-full object-cover scale-[1.05]"
          />
          <div className="absolute inset-0 bg-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-6 right-6 sm:left-8 sm:right-8 lg:bottom-16 lg:left-12 lg:right-12 text-ivory min-w-0">
            <h2 className="font-display text-[clamp(1.9rem,8vw,3rem)] lg:text-6xl leading-[1.08] mb-2 max-w-[12ch] lg:max-w-[14ch]">
              &ldquo;Every detail from the flowers<span className="hidden lg:inline"><br /></span>{" "}to the lighting was perfect.&rdquo;
            </h2>
            <p className="font-body text-xs uppercase tracking-widest text-ivory/70 mt-4">NICOLE • WEDDINGWIRE</p>
          </div>
        </div>
      )}

      {/* RIGHT SIDE (OR FULL SCREEN ON CONFIRMATION): The Form */}
      <div className={`w-full ${step === 6 ? 'lg:w-full max-w-[1200px] mx-auto' : 'lg:w-1/2'} flex justify-center items-center pt-28 lg:pt-32 pb-16 px-6 lg:px-20 z-20 min-h-[60vh]`}>
        <div ref={containerRef} className={`w-full ${step === 6 ? 'max-w-[1000px]' : 'max-w-[600px]'} relative`}>
          
          {/* STEP 1: Celebration Type */}
          {step === 1 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">01</span>
                <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">What are we celebrating?</h1>
                <p className="font-body text-sm text-ink/70">Choose the closest fit for your event.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {[
                  { id: "wedding", title: "Wedding", desc: "Ceremony and reception" },
                  { id: "private", title: "Private celebration", desc: "Milestone or social event" },
                  { id: "corporate", title: "Corporate or nonprofit", desc: "Gala, dinner, or brand event" },
                  { id: "other", title: "Something else", desc: "Tell us what you have in mind" }
                ].map(type => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setFormData({...formData, celebrationType: type.title})}
                    aria-pressed={formData.celebrationType === type.title}
                    className={`relative border p-6 text-left cursor-pointer transition-all duration-300 rounded-sm flex flex-col justify-between ${
                      formData.celebrationType === type.title 
                        ? 'border-ink bg-ink/5 shadow-sm' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <div className="pr-8 mb-2">
                      <h3 className="font-display text-xl text-ink mb-1">{type.title}</h3>
                      <p className="font-body text-xs text-ink/60 leading-relaxed">{type.desc}</p>
                    </div>
                    {/* Positioned cleanly in top-right corner */}
                    <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      formData.celebrationType === type.title ? 'border-gold bg-gold/10' : 'border-ink/25'
                    }`}>
                      {formData.celebrationType === type.title && <div className="w-2.5 h-2.5 bg-gold rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.celebrationType}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 disabled:hover:bg-ink disabled:hover:text-ivory flex items-center gap-3 rounded-full"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 2: Date, Venue & Guest Count */}
          {step === 2 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">02</span>
                <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">Where, when, &amp; how many?</h1>
                <p className="font-body text-sm text-ink/70">Estimates are fine if details are still coming together.</p>
              </div>

              <div className="flex flex-col gap-8 mb-12">
                
                {/* Event Date */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Event Date (Optional)
                  </label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors text-ink/80 focus:text-ink"
                  />
                </div>
                
                {/* Venue / Location */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    Venue or City
                  </label>
                  <input 
                    type="text" 
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-2xl text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                    placeholder="e.g. Meridian House, Washington, D.C."
                  />
                </div>

                {/* Guest Count Selector */}
                <div className="flex flex-col gap-3 pt-2">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                    Estimated Guest Count *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Under 50 Guests",
                      "50 – 125 Guests",
                      "125 – 200 Guests",
                      "200+ Guests"
                    ].map(count => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setFormData({...formData, guestCount: count})}
                        className={`p-4 border text-left text-xs font-body transition-all rounded-sm flex items-center justify-between ${
                          formData.guestCount === count
                            ? 'border-ink bg-ink text-ivory shadow-sm'
                            : 'border-ink/20 hover:border-ink/50 text-ink bg-ivory'
                        }`}
                      >
                        <span className="font-medium">{count}</span>
                        {formData.guestCount === count && <span className="text-gold text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.guestCount}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 3: Services */}
          {step === 3 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">03</span>
                <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">How can we help?</h1>
                <p className="font-body text-sm text-ink/70">Select all that apply.</p>
              </div>

              <div className="flex flex-col gap-3 mb-12">
                {[
                  "Full event design & production",
                  "Floral design & installations",
                  "Décor, rentals & styling",
                  "I'm not sure yet"
                ].map(service => (
                  <label 
                    key={service}
                    className={`border p-5 cursor-pointer transition-all duration-300 flex justify-between items-center rounded-sm ${
                      formData.services.includes(service)
                        ? 'border-ink bg-ink/5 shadow-sm' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <span className="font-display text-xl text-ink">{service}</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                      formData.services.includes(service) ? 'border-ink bg-ink' : 'border-ink/30'
                    }`}>
                      {formData.services.includes(service) && (
                        <svg className="w-3 h-3 text-ivory" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={formData.services.length === 0}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 4: Vision & Dynamic Investment */}
          {step === 4 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">04</span>
                <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">What do you want the room to remember?</h1>
                <p className="font-body text-sm text-ink/70">A few words are enough. We will develop the details together.</p>
              </div>

              <div className="flex flex-col gap-10 mb-12">
                
                {/* Vision Textarea */}
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                    The feeling, colors, or details (Optional)
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.vision}
                    onChange={(e) => setFormData({...formData, vision: e.target.value})}
                    className="w-full bg-ink/5 border border-ink/10 p-4 font-body text-base text-ink outline-none focus:border-gold focus:bg-transparent transition-colors placeholder:text-ink/30 resize-none rounded-sm"
                    placeholder="Candlelit, sculptural, romantic, filled with movement..."
                  />
                </div>

                {/* Investment Budget Selector (Dynamic based on Guest Count) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold">
                      Anticipated Floral &amp; Production Investment *
                    </label>
                    {isIntimateGuestCount && (
                      <span className="font-body text-[9px] uppercase tracking-widest text-gold font-semibold bg-gold/10 px-2.5 py-0.5 rounded-full">
                        Intimate Event Pricing Unlocked
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {(isIntimateGuestCount
                      ? [
                          { tier: "$4,000 – $10,000", label: "Intimate Gathering / Micro-Celebration", sub: "Designed specifically for gatherings under 50 guests" },
                          { tier: "$10,000 – $20,000", label: "Elevated Intimate Styling", sub: "Bespoke ceremony arch + full tablescape installations" },
                          { tier: "$20,000+", label: "Full Production Micro-Experience", sub: "High-touch immersive transformation" }
                        ]
                      : [
                          { tier: "$8,000 – $15,000", label: "The Essentials", sub: "Signature floral styling for intimate gatherings" },
                          { tier: "$20,000 – $35,000", label: "Design + Florals", sub: "Bespoke floral architecture & complete aesthetic direction" },
                          { tier: "$35,000 – $55,000", label: "Elevated Production", sub: "Grand floral arches, focal installations & ambient styling" },
                          { tier: "$55,000+", label: "The Full Production", sub: "Comprehensive custom fabrication & white-glove execution" }
                        ]
                    ).map(item => (
                      <button
                        type="button"
                        key={item.tier}
                        onClick={() => setFormData({...formData, investment: item.tier})}
                        aria-pressed={formData.investment === item.tier}
                        className={`p-4 rounded-sm border text-left transition-all flex items-center justify-between ${
                          formData.investment === item.tier 
                            ? 'border-ink bg-ink text-ivory shadow-md' 
                            : 'border-ink/20 text-ink hover:border-ink/60 bg-ivory'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-lg ${formData.investment === item.tier ? 'text-gold' : 'text-ink font-semibold'}`}>
                              {item.tier}
                            </span>
                            <span className="font-body text-xs opacity-75">· {item.label}</span>
                          </div>
                          <p className={`font-body text-[11px] mt-0.5 ${formData.investment === item.tier ? 'text-ivory/70' : 'text-ink/55'}`}>
                            {item.sub}
                          </p>
                        </div>
                        {formData.investment === item.tier && <span className="text-gold font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.investment}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-3 rounded-full"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 5: Contact Details (Mandatory Phone + Pinterest) */}
          {step === 5 && (
            <div className="step-content">
              <div className="mb-10">
                <span className="text-gold font-display text-lg mb-3 block">05</span>
                <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4 leading-tight">Where should we send your proposal?</h1>
                <p className="font-body text-sm text-ink/70">Irene will review your vision and follow up directly.</p>
              </div>

              <form onSubmit={submitForm} className="flex flex-col gap-8 mb-12">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Your Name(s) *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Nicole & Alexander"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-xl text-ink outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                      placeholder="(202) 555-0123"
                    />
                  </div>

                  <div className="flex flex-col gap-2 relative group">
                    <label htmlFor="inquiry-source" className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors font-semibold">
                      How did you hear about us?
                    </label>
                    <select 
                      id="inquiry-source"
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Select one...</option>
                      <option value="instagram">Instagram</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="planner-referral">Planner or Venue Referral</option>
                      <option value="word-of-mouth">Word of Mouth / Friend</option>
                      <option value="google">Google Search</option>
                      <option value="weddingwire-theknot">WeddingWire / The Knot</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button type="button" onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                    <span>←</span> Back
                  </button>
                  <Magnetic>
                    <button 
                      type="submit"
                      className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors flex items-center gap-3 rounded-full shadow-lg"
                    >
                      Submit Consultation Request <span className="text-sm">↗</span>
                    </button>
                  </Magnetic>
                </div>
                <p className="font-body text-[9px] text-ink/50 text-right mt-[-10px]">
                  🔒 Your details remain strictly confidential with Irene and our atelier.
                </p>

              </form>
            </div>
          )}

          {/* STEP 6: Full-Screen Confirmation & Direct Calendly Booking */}
          {step === 6 && (
            <div aria-live="polite" className="step-content flex flex-col items-center justify-center text-center w-full py-8 animate-fade-in">
              
              {/* Top Thank You Header */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-6">
                <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
                  Inquiry Successfully Received
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-4 leading-tight">
                Thank you, {formData.name.split(' ')[0] || "Friend"}.
              </h1>

              <p className="font-body text-base md:text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed mb-10">
                Your celebration details have been delivered directly to Irene’s atelier. We will review your date and venue and reach out within 24 to 48 hours.
              </p>

              {/* Direct Booking Card with Calendly Embed */}
              <div className="w-full bg-ecru/50 border border-ink/10 rounded-2xl p-6 sm:p-10 shadow-xl mb-12 text-center">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
                  FAST-TRACK YOUR CONSULTATION
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3">
                  Schedule Your Private Design Session Now
                </h2>
                <p className="font-body text-xs sm:text-sm text-ink/70 max-w-xl mx-auto mb-8 leading-relaxed">
                  If you are ready to explore your date and aesthetic vision right away, select a 20-minute consultation slot on Irene’s private calendar below:
                </p>

                {/* Embedded Calendly Scheduler */}
                <div className="w-full rounded-xl overflow-hidden shadow-inner border border-ink/10 bg-ivory min-h-[620px] relative">
                  <iframe
                    src="https://calendly.com/ladyvictoriadesigns"
                    title="Schedule Consultation with Irene"
                    className="w-full h-[650px] border-0"
                  />
                </div>

                {/* Direct Link Fallback */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="font-body text-xs text-ink/60">Prefer opening in a new tab?</span>
                  <a
                    href="https://calendly.com/ladyvictoriadesigns"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs uppercase tracking-widest text-gold font-semibold underline hover:text-ink transition-colors"
                  >
                    Open Calendar Full Screen ↗
                  </a>
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link 
                  href="/gallery" 
                  className="w-full sm:w-auto bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold hover:text-ink transition-colors rounded-full"
                >
                  Explore Our Work
                </Link>
                <Link 
                  href="/" 
                  className="w-full sm:w-auto border border-ink/20 text-ink font-body text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:border-ink transition-colors rounded-full"
                >
                  Return to Home
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}

