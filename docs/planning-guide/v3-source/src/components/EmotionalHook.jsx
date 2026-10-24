import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function EmotionalHook() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            // Split text roughly by words since we don't have SplitText premium plugin
            // We will stagger the words manually by finding elements with class 'hook-word'
            const words = gsap.utils.toArray('.hook-word');

            gsap.from(words, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.03,
                ease: 'power3.out'
            });

            gsap.from('.hook-label', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 20,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const text1 = "You've imagined this moment — the walk down the aisle, the happy tears, the people you love all in one room. But between choosing a venue, building a budget, and keeping track of every decision, it's easy to feel overwhelmed.";
    const text2 = "At Lady Victoria Designs, we make space for you to enjoy the story while we help bring the details together.";

    const renderWords = (text) => {
        return text.split(' ').map((word, i) => (
            <span key={i} className="hook-word inline-block mr-[0.3em] font-serif italic text-xl md:text-4xl leading-relaxed text-[#8C7E73]">
                {word}
            </span>
        ));
    };

    return (
        <section
            ref={sectionRef}
            className="w-full bg-background py-40 md:py-56 px-6 flex flex-col items-center justify-center text-center"
        >
            <div className="max-w-[800px] flex flex-col items-center gap-12">
                <div className="hook-label text-accent font-sans text-xs tracking-[0.2em] uppercase">
                    A Note From Irene
                </div>

                <div className="flex flex-col gap-10">
                    <p className="w-full">{renderWords(text1)}</p>
                    <p className="w-full">{renderWords(text2)}</p>
                </div>
            </div>
        </section>
    );
}
