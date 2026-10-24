import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PhotoBreak({ image, alt }) {
    const imgRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.to(imgRef.current, {
                scrollTrigger: {
                    trigger: imgRef.current.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                yPercent: 30,
                ease: 'none'
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-primaryDark">
            <img
                ref={imgRef}
                src={image}
                alt={alt}
                className="absolute -top-[30%] left-0 w-full h-[160%] object-cover opacity-80"
            />
        </section>
    );
}
