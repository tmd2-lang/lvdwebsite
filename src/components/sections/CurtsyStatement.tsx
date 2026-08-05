"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CurtsyStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const firstLineRef = useRef<HTMLSpanElement>(null);
  const secondLineRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 88%",
          end: "top 32%",
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(
          firstLineRef.current,
          { x: () => -Math.min(window.innerWidth * 0.13, 180) },
          { x: 0, ease: "none" },
          0,
        )
        .fromTo(
          secondLineRef.current,
          { x: () => Math.min(window.innerWidth * 0.13, 180) },
          { x: 0, ease: "none" },
          0,
        )
        .fromTo(
          paragraphRef.current,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, ease: "none" },
          0.35,
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="curtsy-statement-title"
      className="relative z-10 min-h-[88svh] w-full overflow-hidden border-y border-gold/30 bg-ink px-6 py-20 text-ivory md:min-h-screen md:px-12 md:py-24"
    >
      <div className="mx-auto flex min-h-[calc(88svh-10rem)] w-full max-w-[1500px] flex-col items-center justify-center text-center md:min-h-[calc(100svh-12rem)]">
        <h2
          id="curtsy-statement-title"
          className="flex w-full flex-col items-center font-display leading-[0.96] tracking-[-0.04em]"
        >
          <span
            ref={firstLineRef}
            className="block whitespace-nowrap text-[clamp(2.1rem,7vw,7.25rem)] uppercase will-change-transform"
          >
            A Sweeping Curtsy
          </span>
          <span
            ref={secondLineRef}
            className="mt-3 block whitespace-nowrap text-[clamp(1.35rem,4.8vw,5rem)] font-normal italic text-gold will-change-transform md:mt-5"
          >
            from Lady Victoria Designs
          </span>
        </h2>

        <p
          ref={paragraphRef}
          className="mt-12 max-w-3xl font-body text-sm leading-[1.8] text-ivory/80 md:mt-16 md:text-lg md:leading-[1.85]"
        >
          Lady Victoria Designs creates celebrations with atmosphere,
          intention, and an unmistakable point of view. Led by Irene, every
          occasion is thoughtfully composed—from the first creative gesture to
          the final, unforgettable detail.
        </p>
      </div>
    </section>
  );
}
