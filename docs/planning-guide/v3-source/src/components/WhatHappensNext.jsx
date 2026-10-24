import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        num: "01",
        title: "Schedule a Call",
        desc: "Begin a conversation about your date, your plans, and where you could use support."
    },
    {
        num: "02",
        title: "Share Your Vision",
        desc: "Tell us about your day — your venue, your style, what you've been dreaming about."
    },
    {
        num: "03",
        title: "Find the Right Fit",
        desc: "We’ll talk through the planning packages and the scope that matches your needs and budget."
    },
    {
        num: "04",
        title: "Receive Your Proposal",
        desc: "Review a proposal with the services and investment tailored to your celebration."
    }
];

export default function WhatHappensNext() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.from('.next-card', {
                scrollTrigger: {
                    trigger: '.next-grid',
                    start: 'top 80%',
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="w-full bg-background pt-10 pb-0">
            <div className="max-w-7xl mx-auto px-6 lg:px-20 pb-16">

                <div className="flex flex-col gap-4 text-center items-center mb-16">
                    <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase">What Happens Next</div>
                    <h2 className="font-serif text-4xl md:text-5xl text-textLight">Let's Talk About Your Vision</h2>
                </div>

                <div className="next-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="next-card flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-full border border-accent/30 text-accent font-serif text-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-textDark transition-colors duration-500">
                                {step.num}
                            </div>
                            <h3 className="font-serif text-xl text-textLight mb-4">{step.title}</h3>
                            <p className="font-sans text-sm font-light text-mutedText leading-relaxed">
                                "{step.desc}"
                            </p>
                        </div>
                    ))}
                </div>

            </div>

            {/* CTA Bar */}
            <div className="w-full bg-primaryDark py-16 px-6 text-center text-white flex flex-col items-center gap-6">
                <h2 className="font-serif text-3xl md:text-4xl">Your planning conversation with Irene</h2>
                <p className="font-serif italic text-white/70 max-w-lg mb-4">
                    "No pressure. No obligation. Just a conversation about what's possible."
                </p>
                <a
                    href="https://www.ladyvictoriadesigns.com/planning" target="_blank" rel="noopener noreferrer"
                    className="relative overflow-hidden group bg-accent text-textDark px-10 py-4 rounded-full font-sans text-sm tracking-widest uppercase hover:scale-[1.03] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] inline-block"
                >
                    <span className="relative z-10">Book a Call</span>
                    <div className="absolute inset-0 bg-accentHover translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-0" />
                </a>
            </div>
        </section>
    );
}
