import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        quote: "Our wedding decorations are still a topic of conversation in our family. If you have an event coming up, contact her as soon as you can. You will not be disappointed.",
        author: "Priscilla"
    },
    {
        quote: "You took this wedding to a whole other level and for that we are forever grateful.",
        author: "Mother of the Bride"
    },
    {
        quote: "I want to get married every weekend just to see the room reveal over and over again. She brought my vision of my dream wedding to reality.",
        author: "Dana"
    }
];

export default function Testimonials() {
    const sectionRef = useRef(null);
    const textRefs = useRef([]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.fromTo(textRefs.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const addToRefs = (el) => {
        if (el && !textRefs.current.includes(el)) {
            textRefs.current.push(el);
        }
    };

    return (
        <section ref={sectionRef} className="w-full bg-primaryDark py-24 md:py-32 px-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-24">

                <div ref={addToRefs} className="text-center">
                    <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-4">
                        From Our Wedding Design Clients
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {testimonials.map((item, idx) => (
                        <div key={idx} ref={addToRefs} className="flex flex-col flex-grow gap-6 bg-white/5 border border-white/10 p-8 rounded-2xl items-center text-center">
                            <p className="font-serif italic text-xl md:text-2xl text-white/90 leading-relaxed">
                                "{item.quote}"
                            </p>
                            <div className="mt-auto pt-6 border-t border-accent/30 w-full">
                                <span className="font-sans text-sm tracking-widest uppercase text-accent">
                                    — {item.author}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
