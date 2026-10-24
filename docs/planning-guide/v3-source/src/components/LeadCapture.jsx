import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { tiers } from '../data/tiers';

const tierOptions = tiers.map(tier => ({value:tier.id,label:tier.label,name:tier.name,price:tier.price,highlight:tier.shortTitle,isSignature:tier.isSignature}));

export default function LeadCapture() {
    const isSubmitting = false;
    const [isSubmitted, setIsSubmitted] = useState(false);
    const error = ''; 
    const [selectedTier, setSelectedTier] = useState('');

    const [notes, setNotes] = useState(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        setNotes(Object.fromEntries(new FormData(e.currentTarget)));
        setIsSubmitted(true);
    };

    return (
        <section id="contact" className="w-full bg-background pt-32 lg:pt-40 pb-32 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-6">Start Here</div>
                    <h2 className="font-serif text-4xl md:text-5xl text-textLight mb-4">Ready to Take the Next Step?</h2>
                    <p className="font-sans text-mutedText text-lg italic">
                        Bring your plans together here, then continue to the website to start your conversation with Irene.
                    </p>
                </div>

                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-[2rem] border border-subtleBorder shadow-sm min-h-[500px] flex flex-col justify-center relative overflow-hidden transition-all duration-700">

                    {isSubmitted ? (
                        <div className="flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-4 relative">
                                <div className="absolute inset-0 border border-accent/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                <Check className="w-10 h-10 text-accent" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-serif text-4xl text-textLight">Your Planning Notes</h3>
                            <p className="font-sans text-sm text-mutedText">{notes?.name}{notes?.date ? ` · ${notes.date}` : ''}{notes?.venue ? ` · ${notes.venue}` : ''}</p>
                            <p className="font-sans text-lg text-mutedText max-w-md mx-auto leading-relaxed">
                                Your notes are prepared in this local preview. Nothing has been sent. Continue to the live website when you’re ready to inquire.
                            </p>
                            <p className="font-serif italic text-2xl text-accent mt-8 border-t border-subtleBorder pt-10 w-full max-w-sm mx-auto">
                                {tierOptions.find(tier => tier.value === selectedTier)?.name || 'Let’s find your planning starting point.'}
                            </p>
                            <a href="https://www.ladyvictoriadesigns.com/planning" target="_blank" rel="noopener noreferrer" className="bg-accent text-white rounded-full px-8 py-4 text-xs uppercase tracking-widest">Continue to Planning Inquiry</a>
                            <button type="button" onClick={() => setIsSubmitted(false)} className="text-mutedText text-sm underline">Edit my notes</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-0 animate-in fade-in duration-500">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-sans text-sm text-center mb-8">
                                    {error}
                                </div>
                            )}

                            {/* ── Section 1: Your Details ── */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                        <span className="font-sans text-[10px] font-bold text-accent">1</span>
                                    </div>
                                    <span className="font-sans text-xs uppercase tracking-[0.15em] text-textLight font-medium">Your Details</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="name" className="font-sans text-xs uppercase tracking-widest text-mutedText">Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            defaultValue={notes?.name || ''}
                                            name="name"
                                            required
                                            placeholder="Your full name"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight placeholder:text-mutedText/40"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="email" className="font-sans text-xs uppercase tracking-widest text-mutedText">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            defaultValue={notes?.email || ''}
                                            name="email"
                                            required
                                            placeholder="you@email.com"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight placeholder:text-mutedText/40"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-1">
                                        <label htmlFor="phone" className="font-sans text-xs uppercase tracking-widest text-mutedText">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            defaultValue={notes?.phone || ''}
                                            name="phone"
                                            required
                                            placeholder="(555) 123-4567"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight placeholder:text-mutedText/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 2: Choose Your Package (EMPHASIZED) ── */}
                            <div className="mb-12 -mx-8 md:-mx-12 lg:-mx-16 px-8 md:px-12 lg:px-16 py-10 bg-[#FAF9F6] border-y border-subtleBorder/60 relative">
                                {/* Subtle accent bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/40 rounded-r"></div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                        <span className="font-sans text-[10px] font-bold text-white">2</span>
                                    </div>
                                    <span className="font-sans text-xs uppercase tracking-[0.15em] text-textLight font-medium">Choose Your Package</span>
                                </div>
                                <p className="font-sans text-sm text-mutedText mb-8 ml-9">Which planning package feels like your starting point?</p>

                                {/* Hidden input to send tier value via form */}
                                <input type="hidden" name="tier" value={selectedTier} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tierOptions.map((tier) => {
                                        const isSelected = selectedTier === tier.value;
                                        return (
                                            <button
                                                type="button"
                                                key={tier.value}
                                                onClick={() => setSelectedTier(prev => prev === tier.value ? '' : tier.value)}
                                                className={`relative flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group
                                                    ${tier.isSignature
                                                        ? isSelected
                                                            ? 'bg-primaryDark border-accent shadow-lg scale-[1.02]'
                                                            : 'bg-primaryDark/90 border-primaryDark hover:border-accent/50 hover:shadow-md'
                                                        : isSelected
                                                            ? 'bg-white border-accent shadow-lg scale-[1.02]'
                                                            : 'bg-white border-subtleBorder hover:border-accent/40 hover:shadow-md'
                                                    }`}
                                            >
                                                {/* Selection indicator */}
                                                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                                    ${isSelected
                                                        ? 'bg-accent border-accent'
                                                        : tier.isSignature
                                                            ? 'border-white/30'
                                                            : 'border-subtleBorder'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>

                                                {tier.isSignature && (
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Sparkles className="w-3 h-3 text-accent" />
                                                        <span className="font-sans text-[9px] uppercase tracking-widest text-accent">Signature</span>
                                                    </div>
                                                )}

                                                <div className={`font-sans text-[10px] uppercase tracking-[0.15em] mb-1 ${tier.isSignature ? 'text-white/60' : 'text-mutedText'}`}>
                                                    {tier.label}
                                                </div>
                                                <div className={`font-serif italic text-base mb-2 leading-tight ${tier.isSignature ? 'text-white' : 'text-textLight'}`}>
                                                    {tier.name}
                                                </div>
                                                <div className={`font-sans text-lg font-medium mb-2 ${tier.isSignature ? 'text-accent' : 'text-textLight'}`}>
                                                    {tier.price}
                                                </div>
                                                <div className={`font-sans text-[11px] leading-relaxed ${tier.isSignature ? 'text-white/50' : 'text-mutedText'}`}>
                                                    {tier.highlight}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="font-sans text-[10px] text-mutedText mt-4 ml-1 italic">
                                    * Don't worry — this isn't a commitment. Just helps us tailor our conversation.
                                </p>
                            </div>

                            {/* ── Section 3: Wedding Details ── */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                        <span className="font-sans text-[10px] font-bold text-accent">3</span>
                                    </div>
                                    <span className="font-sans text-xs uppercase tracking-[0.15em] text-textLight font-medium">Wedding Details</span>
                                    <span className="font-sans text-[10px] text-mutedText italic ml-1">(optional)</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="date" className="font-sans text-xs uppercase tracking-widest text-mutedText">Wedding Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            defaultValue={notes?.date || ''}
                                            name="date"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="venue" className="font-sans text-xs uppercase tracking-widest text-mutedText">Venue Name</label>
                                        <input
                                            type="text"
                                            id="venue"
                                            defaultValue={notes?.venue || ''}
                                            name="venue"
                                            placeholder="Where's the celebration?"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight placeholder:text-mutedText/40"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="guests" className="font-sans text-xs uppercase tracking-widest text-mutedText">Guest Count</label>
                                        <input
                                            type="number"
                                            id="guests"
                                            defaultValue={notes?.guests || ''}
                                            name="guests"
                                            placeholder="Estimated guests"
                                            className="border-b border-subtleBorder py-3 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight placeholder:text-mutedText/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 4: Your Vision ── */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                        <span className="font-sans text-[10px] font-bold text-accent">4</span>
                                    </div>
                                    <span className="font-sans text-xs uppercase tracking-[0.15em] text-textLight font-medium">Your Vision</span>
                                    <span className="font-sans text-[10px] text-mutedText italic ml-1">(optional)</span>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="vision" className="font-sans text-xs uppercase tracking-widest text-mutedText">Tell us about your dream day</label>
                                        <textarea
                                            id="vision"
                                            defaultValue={notes?.vision || ''}
                                            name="vision"
                                            rows="4"
                                            placeholder="Pinterest links, color palettes, vibe words..."
                                            className="border border-subtleBorder rounded-xl p-4 bg-transparent focus:outline-none focus:border-accent transition-colors font-sans text-textLight resize-none placeholder:text-mutedText/40"
                                        ></textarea>
                                    </div>


                                </div>
                            </div>

                            {/* ── Submit ── */}
                            <div className="mt-4 flex flex-col items-center gap-4 pt-8 border-t border-subtleBorder/60">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`relative overflow-hidden group w-full md:w-auto bg-accent text-textDark px-12 py-4 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                >
                                    <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Review My Planning Notes'}</span>
                                    {!isSubmitting && <div className="absolute inset-0 bg-accentHover translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-0" />}
                                </button>
                                <p className="font-sans text-xs text-mutedText italic">
                                    No pressure. No obligation. Just a conversation about what's possible.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
