import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Quotes moved to Testimonials component
export default function Differentiators() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.from('.diff-card', {
                scrollTrigger: {
                    trigger: '.diff-grid',
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="w-full bg-[#3D332A] text-textDark py-16 px-6 lg:px-20 relative overflow-hidden">

            {/* Why Choose Us */}
            <div className="max-w-7xl mx-auto flex flex-col gap-16 mb-24">
                <div className="flex flex-col gap-4">
                    <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase">Why Couples Choose</div>
                    <h2 className="font-serif text-5xl md:text-6xl text-white">Lady Victoria</h2>
                </div>

                <div className="diff-grid grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="diff-card relative p-8 bg-primaryDark/50 rounded-[2rem] border border-white/5 hover:bg-primaryDark transition-colors group">
                        <div className="absolute top-4 right-8 font-serif text-[6rem] font-bold text-white/5 pointer-events-none group-hover:text-accent/10 transition-colors">01</div>
                        <h3 className="relative z-10 font-serif text-2xl mb-6 text-accent">A Clear Starting Point</h3>
                        <p className="relative z-10 font-sans text-lg font-light leading-relaxed text-white/70">
                            From choosing your venue to handing over the final logistics, our four packages meet you at a different stage of planning.
                        </p>
                    </div>

                    <div className="diff-card relative p-8 bg-primaryDark/50 rounded-[2rem] border border-white/5 hover:bg-primaryDark transition-colors group lg:mt-12">
                        <div className="absolute top-4 right-8 font-serif text-[6rem] font-bold text-white/5 pointer-events-none group-hover:text-accent/10 transition-colors">02</div>
                        <h3 className="relative z-10 font-serif text-2xl mb-6 text-accent">Plans That Connect</h3>
                        <p className="relative z-10 font-sans text-lg font-light leading-relaxed text-white/70">
                            Your timeline, vendors, venue, and guest flow are considered together, with a clear scope for what our team will manage.
                        </p>
                    </div>

                    <div className="diff-card relative p-8 bg-primaryDark/50 rounded-[2rem] border border-white/5 hover:bg-primaryDark transition-colors group lg:mt-24">
                        <div className="absolute top-4 right-8 font-serif text-[6rem] font-bold text-white/5 pointer-events-none group-hover:text-accent/10 transition-colors">03</div>
                        <h3 className="relative z-10 font-serif text-2xl mb-6 text-accent">Personal Attention</h3>
                        <p className="relative z-10 font-sans text-lg font-light leading-relaxed text-white/70">
                            Your priorities shape the process. We help organize decisions and present the options so you can stay involved where it matters to you.
                        </p>
                    </div>

                </div>
            </div>

        </section>
    );
}
