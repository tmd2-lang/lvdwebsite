import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { tiers } from '../data/tiers';

export default function InvestmentTiers({ onOpenQuiz }) {
    const overviewRef = useRef(null);
    const detailRefs = useRef([]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            // Overview Cards Animation
            gsap.from('.tier-card-overview', {
                scrollTrigger: {
                    trigger: overviewRef.current,
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out'
            });

            // Detailed Section Animations
            detailRefs.current.forEach((el, index) => {
                if (!el) return;

                gsap.fromTo(el,
                    { opacity: 0, y: 50 },
                    {
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 75%',
                            toggleActions: 'play none none reverse'
                        },
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: 'power3.out'
                    }
                );
            });
        });
        return () => ctx.revert();
    }, []);

    const addToDetailRefs = (el) => {
        if (el && !detailRefs.current.includes(el)) {
            detailRefs.current.push(el);
        }
    };

    return (
        <>
            {/* Overview Section */}
            <section ref={overviewRef} className="w-full bg-background py-20 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto flex flex-col gap-12">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase">
                            Investment Options
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl text-textLight">
                            Four Ways to Work With Us
                        </h2>
                        <button onClick={onOpenQuiz} className="mt-4 text-accent border-b border-accent/40 pb-2 font-sans text-xs uppercase tracking-widest hover:text-accentHover transition-colors">Not sure where to begin? Find your fit ↗</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch mt-8">
                        {tiers.map((tier) => {
                            const isSig = tier.isSignature;
                            return (
                                <div
                                    key={`overview-${tier.id}`}
                                    className={`tier-card-overview relative flex flex-col rounded-[2rem] overflow-hidden ${isSig
                                        ? 'bg-primaryDark border-2 border-accent text-textDark shadow-xl lg:scale-105 z-10 lg:-translate-y-2'
                                        : 'bg-white border border-subtleBorder text-textLight hover:border-accent/30'
                                        }`}
                                >
                                    <div className="p-8 pt-12 pb-10 flex flex-col flex-grow">
                                        {isSig && (
                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-accent text-textDark text-[10px] tracking-widest uppercase px-4 py-1 rounded-full whitespace-nowrap z-20">
                                                Signature
                                            </div>
                                        )}

                                        <h3 className={`font-serif text-2xl mb-1 ${isSig ? 'text-white' : ''}`}>
                                            {tier.label}
                                        </h3>
                                        <p className="font-serif italic text-xl text-accent mb-6 min-h-[3.5rem]">
                                            {tier.name}
                                        </p>
                                        <div className={`font-sans text-2xl mb-2 ${isSig ? 'text-accent/90' : 'text-textLight'}`}>
                                            {tier.price}
                                        </div>
                                        <p className={`font-sans text-sm italic mb-6 border-b pb-6 ${isSig ? 'text-mutedText border-mutedText/30' : 'text-mutedText border-subtleBorder'}`}>
                                            "{tier.shortTitle}"
                                        </p>

                                        <ul className={`flex flex-col gap-4 font-sans text-sm mt-auto ${isSig ? 'text-white/90' : 'text-textLight/80'}`}>
                                            {tier.shortList.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <a href={`#${tier.id}`} className={`mx-8 mb-8 py-3 text-center rounded-full border font-sans text-xs uppercase tracking-widest transition-colors ${isSig ? 'border-accent text-white hover:bg-accent' : 'border-subtleBorder hover:border-accent'}`}>Explore this package ↓</a>
                                    {isSig && <div className="h-2 w-full bg-accent absolute bottom-0 left-0"></div>}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center font-sans text-xs text-mutedText mt-4 italic">
                        * Final pricing is tailored to your guest count, planning needs, venue logistics, and celebration complexity.
                    </p>
                </div>
            </section>

            {/* Dedicated package sections, adapted from the original tier breakdowns. */}
            {tiers.map((tier, index) => (
                <section id={tier.id} key={tier.id} ref={addToDetailRefs} className={`package-detail w-full flex flex-col lg:flex-row min-h-[80vh] overflow-hidden border-t border-subtleBorder ${tier.isSignature ? 'bg-primaryDark text-textDark' : 'bg-background text-textLight'}`}>
                    <div className={`w-full lg:w-[45%] h-[50vh] lg:h-auto relative ${index % 2 ? 'lg:order-2' : ''}`}>
                        <img src={tier.image} alt={tier.alt} className="w-full h-full object-cover lg:absolute lg:inset-0" />
                    </div>
                    <div className={`w-full lg:w-[55%] p-8 md:p-12 lg:p-20 flex flex-col justify-center ${tier.isSignature ? '' : 'bg-[#FAFAF8]'}`}>
                        <div className="max-w-xl mx-auto lg:mx-0 w-full">
                            <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-4">{tier.label}{tier.isSignature ? ' · FULL SERVICE' : ''}</div>
                            <h2 className="font-serif text-4xl md:text-5xl mb-6">{tier.name}</h2>
                            <div className={`font-sans text-2xl mb-2 inline-block border-b-2 border-accent/30 pb-1 ${tier.isSignature ? 'text-accent' : ''}`}>{tier.price}</div>
                            <p className="font-serif italic text-2xl text-accent my-8">“{tier.tagline}”</p>
                            <p className={`font-sans text-base leading-relaxed mb-8 ${tier.isSignature ? 'text-white/75' : 'text-mutedText'}`}>{tier.desc}</p>
                            <div className="space-y-4">
                                {tier.includes.map((item, i) => <div key={i} className={`font-sans text-sm leading-relaxed flex gap-3 ${tier.isSignature ? 'text-white/80' : 'text-textLight/85'}`}><span className="text-accent shrink-0">✧</span><span>{item}</span></div>)}
                            </div>
                            {tier.sections.length > 0 && <details className={`mt-8 border-y py-5 ${tier.isSignature ? 'border-white/20' : 'border-subtleBorder'}`}><summary className="cursor-pointer font-sans text-xs uppercase tracking-widest text-accent">Explore the complete service breakdown</summary><div className="mt-8 space-y-8">{tier.sections.map(section=><div key={section.title}><h3 className="font-serif text-2xl mb-3">{section.title}</h3><ul className={`list-disc pl-4 space-y-2 text-sm leading-relaxed ${tier.isSignature ? 'text-white/75' : 'text-mutedText'}`}>{section.items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div></details>}
                            <p className={`font-sans text-xs mt-10 italic border-t pt-6 leading-relaxed ${tier.isSignature ? 'text-white/60 border-white/15' : 'text-mutedText border-subtleBorder'}`}>{tier.note}</p>
                            <a href="#contact" className="inline-block mt-8 bg-accent text-white px-7 py-3 rounded-full text-xs font-sans uppercase tracking-widest hover:bg-accentHover transition-colors">Let’s talk about your plans</a>
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
}
