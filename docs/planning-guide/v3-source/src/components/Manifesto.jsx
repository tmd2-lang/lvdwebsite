import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            // Parallax text
            gsap.from('.manifesto-text', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                },
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power3.out'
            });

            // Parallax bg image
            gsap.to('.manifesto-bg', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                y: 100,
                ease: 'none'
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full bg-primaryDark text-textDark py-24 md:py-40 px-6 overflow-hidden"
        >
            {/* Texture Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    src="/v3/partial.jpg"
                    alt="An intimate garden reception"
                    className="manifesto-bg w-full h-[120%] object-cover absolute -top-[10%]"
                />
                <div className="absolute inset-0 bg-primaryDark/60 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">

                {/* Left Panel (30%) */}
                <div className="w-full md:w-1/3 flex flex-col gap-4 md:sticky md:top-32 h-fit">
                    <div className="manifesto-text text-accent font-sans text-xs tracking-[0.2em] uppercase">
                        Our Philosophy
                    </div>
                    <h2 className="manifesto-text font-serif text-4xl md:text-5xl">
                        Planning with Intention
                    </h2>
                </div>

                {/* Right Panel (70%) */}
                <div className="w-full md:w-2/3 flex flex-col gap-10 font-sans text-lg md:text-2xl leading-relaxed text-textDark/90 font-light">
                    <p className="manifesto-text">
                        Your wedding is personal. Your planning support should be, too. We meet you where you are, organize the moving parts, and help turn a collection of decisions into a celebration that feels like you.
                    </p>
                    <p className="manifesto-text">
                        This guide walks you through four ways to work with us: venue discovery, wedding management, partial planning, and full wedding planning. Each has a clear starting point and scope.
                    </p>
                    <p className="manifesto-text">
                        Whether you need clarity before booking your venue or a team to guide the entire process, we’ll help you find the right level of support.
                    </p>

                    <p className="manifesto-text text-accent font-serif italic text-3xl md:text-5xl mt-6">
                        Let's begin.
                    </p>
                </div>
            </div>
        </section>
    );
}
