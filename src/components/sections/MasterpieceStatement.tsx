"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function MasterpieceStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 1, y: 0 });
      if (line1Ref.current) gsap.set(line1Ref.current.querySelectorAll(".flash-word"), { opacity: 1, y: 0, filter: "none" });
      if (line2Ref.current) gsap.set(line2Ref.current.querySelectorAll(".flash-word"), { opacity: 1, y: 0, filter: "none" });
      if (paragraphRef.current) gsap.set(paragraphRef.current.querySelectorAll(".para-word"), { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      const line1Words = line1Ref.current?.querySelectorAll(".flash-word");
      const line2Words = line2Ref.current?.querySelectorAll(".flash-word");
      const paraWords = paragraphRef.current?.querySelectorAll(".para-word");

      // Initial un-triggered hidden state
      gsap.set(eyebrowRef.current, { opacity: 0, y: 15 });
      if (line1Words) gsap.set(line1Words, { opacity: 0, y: 24, filter: "brightness(2) blur(6px)" });
      if (line2Words) gsap.set(line2Words, { opacity: 0, y: 24, filter: "brightness(2.2) blur(8px)" });
      if (paraWords) gsap.set(paraWords, { opacity: 0, y: 16, filter: "brightness(1.5)" });

      // Master scroll-triggered timeline — plays ONCE and never reanimates on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true, // Only triggers once on first visit; does not re-trigger on scroll
          toggleActions: "play none none none",
        },
      });

      // 1. Eyebrow reveals
      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })
      // 2. Line 1 "Your wedding isn’t an event." words flash in
      .to(
        line1Words || [],
        {
          opacity: 1,
          y: 0,
          filter: "brightness(1) blur(0px)",
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.2"
      )
      // 3. Line 2 "It’s a masterpiece." flashes in with gold glow
      .to(
        line2Words || [],
        {
          opacity: 1,
          y: 0,
          filter: "brightness(1) blur(0px)",
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.1"
      )
      // 4. Bottom paragraph flashes in
      .to(
        paraWords || [],
        {
          opacity: 1,
          y: 0,
          filter: "brightness(1)",
          duration: 0.5,
          stagger: 0.025,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const line1Text = "Your wedding isn’t an event.";
  const line2Text = "It’s a masterpiece.";
  const paraText =
    "Immersive floral design and thoughtful production, created with a deep respect for every detail.";

  return (
    <section
      ref={sectionRef}
      aria-labelledby="masterpiece-statement-title"
      className="relative z-10 flex min-h-[88svh] w-full flex-col justify-between overflow-hidden border-y border-gold/30 bg-ink px-6 py-12 text-ivory md:min-h-screen md:px-12 md:py-16"
    >
      <p
        ref={eyebrowRef}
        className="text-center font-body text-[10px] uppercase tracking-[0.24em] text-gold md:text-xs will-change-transform"
      >
        The Art of the Occasion
      </p>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center py-16 md:py-24">
        <h2
          id="masterpiece-statement-title"
          className="flex w-full flex-col text-center font-display text-[clamp(2.4rem,5.4vw,6.5rem)] uppercase leading-[0.98] tracking-[-0.035em]"
        >
          <span ref={line1Ref} className="block">
            {line1Text.split(" ").map((word, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0 pb-1"
              >
                <span className="flash-word inline-block will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </span>

          <span
            ref={line2Ref}
            className="mt-3 font-normal italic tracking-[-0.02em] text-gold md:mt-5 block"
          >
            {line2Text.split(" ").map((word, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0 pb-1"
              >
                <span className="flash-word inline-block will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h2>
      </div>

      <p
        ref={paragraphRef}
        className="mx-auto max-w-4xl text-center font-display text-base uppercase leading-relaxed tracking-[-0.01em] text-ivory/80 md:text-2xl md:leading-relaxed"
      >
        {paraText.split(" ").map((word, idx) => (
          <span
            key={idx}
            className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0"
          >
            <span className="para-word inline-block will-change-transform">
              {word}
            </span>
          </span>
        ))}
      </p>
    </section>
  );
}
