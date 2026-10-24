import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
    const heroRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.from('.hero-anim', {
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.1
            });

            gsap.to('.hero-arrow', {
                y: 10,
                yoyo: true,
                repeat: -1,
                duration: 2,
                ease: 'power1.inOut'
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative w-full h-[100dvh] flex items-end pb-24 px-8 md:px-20 overflow-hidden"
        >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 select-none">
                <img
                    src="/v3/cover.jpg"
                    alt="A couple celebrating beneath a floral arch in a sunlit garden"
                    className="w-full h-full object-cover scale-105 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512] via-[#1A1512]/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-3xl flex flex-col items-start gap-4">
                <div className="hero-anim text-accent font-sans text-sm md:text-md tracking-[0.2em] uppercase">
                    Lady Victoria Designs
                </div>

                <h1 className="hero-anim flex flex-col leading-[0.9] text-textDark">
                    <span className="font-serif font-bold text-6xl md:text-8xl">Planning</span>
                    <span className="font-serif italic text-[3.2rem] sm:text-7xl md:text-[7.5rem] leading-[1.05] mt-2 md:mt-0 ml-0 md:ml-12">Investment Guide</span>
                </h1>

                <div className="hero-anim mt-4 md:mt-8 flex flex-col gap-2">
                    <p className="text-textDark font-sans text-lg md:text-2xl font-light">
                        Venue discovery | Coordination | Wedding planning
                    </p>
                    <p className="text-white/70 font-sans tracking-widest text-xs md:text-sm uppercase">
                        Your story. Thoughtfully planned.
                    </p>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 opacity-70">
                <ArrowDown className="hero-arrow text-textDark w-6 h-6 stroke-1" />
            </div>
        </section>
    );
}
