"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Magnetic from "@/components/Magnetic";

type FormData = {
  celebrationType: string;
  date: string;
  venue: string;
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
    // Here we would typically send to an API
    setStep(6);
  };

  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col lg:flex-row relative">
      {/* LEFT SIDE: Sticky Editorial Image */}
      <div className="w-full lg:w-1/2 h-[40vh] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden z-10">
        <img 
          src="/gallery/Amber & Kendall Wedding/Amber&KendallTableShot3.jpeg" 
          alt="Lady Victoria Design Process"
          className="w-full h-full object-cover scale-[1.05]"
        />
        <div className="absolute inset-0 bg-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 lg:bottom-16 lg:left-12 text-ivory">
          <h2 className="font-display text-4xl lg:text-6xl mb-2">
            "Every detail from the flowers<br/>to the lighting was perfect."
          </h2>
          <p className="font-body text-xs uppercase tracking-widest text-ivory/70 mt-4">NICOLE • WEDDINGWIRE</p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center py-16 px-6 lg:px-20 z-20 min-h-[60vh]">
        <div ref={containerRef} className="w-full max-w-[600px] relative">
          
          {/* STEP 1: Celebration Type */}
          {step === 1 && (
            <div className="step-content">
              <div className="mb-12">
                <span className="text-gold font-display text-lg mb-4 block">01</span>
                <h1 className="font-display text-5xl text-ink mb-4 leading-tight">What are we celebrating?</h1>
                <p className="font-body text-sm text-ink/70">Choose the closest fit.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {[
                  { id: "wedding", title: "Wedding", desc: "Ceremony and reception" },
                  { id: "private", title: "Private celebration", desc: "Milestone or social event" },
                  { id: "corporate", title: "Corporate or nonprofit", desc: "Gala, dinner, or brand event" },
                  { id: "other", title: "Something else", desc: "Tell us what you have in mind" }
                ].map(type => (
                  <div 
                    key={type.id}
                    onClick={() => setFormData({...formData, celebrationType: type.title})}
                    className={`border p-6 cursor-pointer transition-all duration-300 flex flex-col justify-center ${
                      formData.celebrationType === type.title 
                        ? 'border-ink bg-ink/5' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-display text-xl">{type.title}</h3>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.celebrationType === type.title ? 'border-ink' : 'border-ink/30'}`}>
                        {formData.celebrationType === type.title && <div className="w-2 h-2 bg-ink rounded-full" />}
                      </div>
                    </div>
                    <p className="font-body text-[10px] text-ink/60">{type.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.celebrationType}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors disabled:opacity-50 disabled:hover:bg-ink flex items-center gap-3"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Venue */}
          {step === 2 && (
            <div className="step-content">
              <div className="mb-12">
                <span className="text-gold font-display text-lg mb-4 block">02</span>
                <h1 className="font-display text-5xl text-ink mb-4 leading-tight">Where and when will it take place?</h1>
                <p className="font-body text-sm text-ink/70">An estimate is perfectly fine if plans are still taking shape.</p>
              </div>

              <div className="flex flex-col gap-10 mb-12">
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">Event Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors text-ink/80 focus:text-ink"
                  />
                </div>
                
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">Venue or City</label>
                  <input 
                    type="text" 
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-2xl text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                    placeholder="e.g. The Willard, Washington, D.C."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                  <span>←</span> Back
                </button>
                <Magnetic>
                  <button 
                    onClick={nextStep}
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors flex items-center gap-3"
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
              <div className="mb-12">
                <span className="text-gold font-display text-lg mb-4 block">03</span>
                <h1 className="font-display text-5xl text-ink mb-4 leading-tight">How can we help?</h1>
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
                    className={`border p-5 cursor-pointer transition-all duration-300 flex justify-between items-center ${
                      formData.services.includes(service)
                        ? 'border-ink bg-ink/5' 
                        : 'border-ink/20 hover:border-ink/50'
                    }`}
                  >
                    <span className="font-display text-xl">{service}</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center ${formData.services.includes(service) ? 'border-ink bg-ink' : 'border-ink/30'}`}>
                      {formData.services.includes(service) && <svg className="w-3 h-3 text-ivory" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors flex items-center gap-3"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 4: Vision & Investment */}
          {step === 4 && (
            <div className="step-content">
              <div className="mb-12">
                <span className="text-gold font-display text-lg mb-4 block">04</span>
                <h1 className="font-display text-5xl text-ink mb-4 leading-tight">What do you want the room to remember?</h1>
                <p className="font-body text-sm text-ink/70">A few words are enough. We will develop the details together.</p>
              </div>

              <div className="flex flex-col gap-12 mb-12">
                
                <div className="flex flex-col gap-2 relative group">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">The feeling, colors, or details (Optional)</label>
                  <textarea 
                    rows={4}
                    value={formData.vision}
                    onChange={(e) => setFormData({...formData, vision: e.target.value})}
                    className="w-full bg-ink/5 border border-ink/10 p-4 font-body text-lg text-ink outline-none focus:border-gold focus:bg-transparent transition-colors placeholder:text-ink/30 resize-none rounded-sm"
                    placeholder="Candlelit, sculptural, romantic, filled with movement..."
                  ></textarea>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50">Anticipated Floral & Design Investment (Optional)</label>
                  <div className="flex flex-wrap gap-3">
                    {["Still exploring", "Under $25K", "$25K–$50K", "$50K–$100K", "$100K+"].map(tier => (
                      <button
                        key={tier}
                        onClick={() => setFormData({...formData, investment: tier})}
                        className={`px-5 py-2.5 rounded-full border font-body text-xs transition-all duration-300 ${
                          formData.investment === tier 
                            ? 'border-ink bg-ink text-ivory' 
                            : 'border-ink/20 text-ink hover:border-ink/60'
                        }`}
                      >
                        {tier}
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
                    className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors flex items-center gap-3"
                  >
                    Continue <span className="text-sm">→</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}

          {/* STEP 5: Contact Details */}
          {step === 5 && (
            <div className="step-content">
              <div className="mb-12">
                <span className="text-gold font-display text-lg mb-4 block">05</span>
                <h1 className="font-display text-5xl text-ink mb-4 leading-tight">Where should we send the next steps?</h1>
                <p className="font-body text-sm text-ink/70">We will only use these details to respond to your inquiry.</p>
              </div>

              <form onSubmit={submitForm} className="flex flex-col gap-10 mb-12">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-display text-xl text-ink outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">Email Address</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">Phone Number <span className="normal-case tracking-normal opacity-50">(Optional)</span></label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-lg text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/20"
                      placeholder="(301) 555-0123"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative group">
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 group-focus-within:text-gold transition-colors">How did you hear about us?</label>
                    <select 
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full bg-transparent border-b border-ink/20 pb-3 font-body text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Select one...</option>
                      <option value="instagram">Instagram</option>
                      <option value="google">Google Search</option>
                      <option value="vendor">Vendor Referral</option>
                      <option value="friend">Friend / Former Client</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button type="button" onClick={prevStep} className="font-body text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors flex items-center gap-2">
                    <span>←</span> Back
                  </button>
                  <Magnetic>
                    <button 
                      type="submit"
                      className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors flex items-center gap-3"
                    >
                      Request Consultation <span className="text-sm">↗</span>
                    </button>
                  </Magnetic>
                </div>
                <p className="font-body text-[9px] text-ink/50 text-right mt-[-20px]">Your information stays private and is never shared.</p>

              </form>
            </div>
          )}

          {/* STEP 6: Success State */}
          {step === 6 && (
            <div className="step-content flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-5xl text-ink mb-6 leading-tight">
                Thank you, {formData.name.split(' ')[0] || "friend"}.
              </h1>
              <p className="font-body text-sm text-ink/70 max-w-md mx-auto leading-relaxed mb-12">
                Your vision has been received. We review every commission closely to ensure we are the perfect fit for your celebration. You can expect to hear from our design team within two business days.
              </p>
              
              <Magnetic>
                <a href="/" className="bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold transition-colors inline-block">
                  Return to Home
                </a>
              </Magnetic>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
