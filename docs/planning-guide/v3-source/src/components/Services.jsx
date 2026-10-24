import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
    {
        "title": "Venue + Budget Clarity",
        "desc": "Venue research, thoughtful comparisons, and realistic budget guidance, based on the planning package you choose.",
        "num": "01"
    },
    {
        "title": "Vendor + Venue Logistics",
        "desc": "An organized vendor team, clear arrival and setup schedules, and communication that keeps the final details aligned.",
        "num": "02"
    },
    {
        "title": "Design Direction",
        "desc": "Cohesive styling guidance with Partial Planning and creative direction across the wedding with Full Planning.",
        "num": "03"
    },
    {
        "title": "Timelines + Guest Flow",
        "desc": "A master wedding-day timeline, floor-plan coordination, ceremony cues, and smooth transitions throughout the celebration.",
        "num": "04"
    },
    {
        "title": "Wedding-Day Management",
        "desc": "On-site coordination within your contracted service period, from setup oversight through the final formalities and breakdown responsibilities.",
        "num": "05"
    }
];

export default function Services() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            // Header animation
            gsap.from('.service-header', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out'
            });

            // Cards staggered reveal
            gsap.from('.service-card', {
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out'
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="services"
            ref={sectionRef}
            className="w-full bg-background py-16 md:py-24 px-6 md:px-20"
        >
            <div className="max-w-7xl mx-auto flex flex-col gap-16">

                {/* Header Area */}
                <div className="flex flex-col gap-4 border-l-2 border-accent pl-6 md:pl-8 ml-2">
                    <div className="service-header text-accent font-sans text-xs tracking-[0.2em] uppercase">
                        Our Services
                    </div>
                    <h2 className="service-header font-serif text-4xl md:text-5xl text-textLight">
                        What We Handle
                    </h2>
                    <p className="service-header font-sans text-lg text-mutedText max-w-xl italic mt-2">
                        Your plans, your priorities, and the right support to bring them together.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className="service-card group relative bg-white border border-subtleBorder rounded-[2rem] p-8 md:p-10 hover:border-accent/40 transition-colors duration-500 overflow-hidden"
                        >
                            <div className="absolute -top-4 -right-4 text-[8rem] font-serif font-bold text-background/80 pointer-events-none group-hover:text-background transition-colors duration-500 z-0">
                                {service.num}
                            </div>

                            <div className="relative z-10 flex flex-col gap-4 h-full">
                                <h3 className="font-serif text-2xl text-textLight">
                                    {service.title}
                                </h3>
                                <p className="font-sans text-mutedText text-sm leading-relaxed flex-grow">
                                    {service.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
