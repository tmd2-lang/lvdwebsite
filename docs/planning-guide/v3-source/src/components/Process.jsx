import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
    {
        num: "01",
        title: "Discovery",
        desc: "We begin with where you are: your priorities, your budget, what’s already booked, and the support you need.",
        animationType: "circles"
    },
    {
        num: "02",
        title: "Your Roadmap",
        desc: "We map the next steps around your package, from venue discovery to organizing the plans you’ve already made.",
        animationType: "grid"
    },
    {
        num: "03",
        title: "Refinement",
        desc: "We align the details, coordinate the right conversations, and refine the timeline so everyone knows what happens next.",
        animationType: "wave"
    },
    {
        num: "04",
        title: "Execution",
        desc: "With Coordination, Partial Planning, or Full Planning, we manage the wedding-day logistics within your agreed scope so you can be present.",
        animationType: "geo"
    }
];

export default function Process() {
    const containerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const cards = gsap.utils.toArray('.process-card');

            // Set up a single scroll trigger for the whole section instead of individual pins
            // to make the scroll seamless
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: () => `+=${window.innerHeight * cards.length}`,
                pin: true,
                scrub: 1, // Smooth scrubbing
                animation: gsap.timeline()
                    // Animate each card (except the last) fading and scaling down as the next comes up
                    .to(cards.slice(0, -1), {
                        scale: 0.9,
                        opacity: 0.1,
                        filter: 'blur(10px)',
                        stagger: 0.5,
                        ease: 'none'
                    }, 0)
                    // At the same time, animate the next cards coming up to stack
                    .from(cards.slice(1), {
                        y: () => window.innerHeight,
                        stagger: 0.5,
                        ease: 'none'
                    }, 0)
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const renderAnimation = (step) => {
        switch (step.animationType) {
            case 'circles':
                return (
                    <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 opacity-20 animate-[spin_20s_linear_infinite]">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                );
            case 'grid':
                return (
                    <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 opacity-20">
                        <defs>
                            <pattern id="dotGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100" height="100" fill="url(#dotGrid)" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="animate-[pulse_2s_ease-in-out_infinite]" />
                    </svg>
                );
            case 'wave':
                return (
                    <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 opacity-20">
                        <path d="M0 50 Q 25 20, 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="1" />
                        <path d="M0 50 Q 25 80, 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                );
            case 'geo':
                return (
                    <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 opacity-20">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <polygon points="50,90 90,10 10,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                );
            case 'image':
                return (
                    <img
                        src={step.imgSrc}
                        alt={step.title}
                        className="w-full h-full object-cover rounded-xl"
                    />
                );
            default: return null;
        }
    };

    return (
        <section ref={containerRef} className="process-section relative w-full bg-background h-screen overflow-hidden">
            <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col items-center justify-center">

                {processSteps.map((step, idx) => (
                    <div
                        key={idx}
                        className="process-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center p-6 md:p-12"
                        style={{ zIndex: idx + 10 }}
                    >
                        <div className="w-full h-auto min-h-[50vh] bg-white border border-subtleBorder rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row shadow-xl items-center md:justify-between transform-gpu">
                            <div className="w-full md:w-1/2 flex flex-col gap-6 md:gap-10 h-full justify-center">
                                <div className="font-mono text-xl text-accent">{step.num}</div>
                                <h2 className="font-serif text-5xl md:text-7xl text-textLight">{step.title}</h2>
                                <p className="font-sans text-xl md:text-2xl font-light leading-relaxed max-w-lg text-mutedText border-l-2 border-accent pl-6">
                                    {step.desc}
                                </p>
                            </div>

                            <div className="w-full md:w-1/2 h-48 md:h-64 flex items-center justify-center text-primaryDark mt-8 md:mt-0">
                                {renderAnimation(step)}
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
}
