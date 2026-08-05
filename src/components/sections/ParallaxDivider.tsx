"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { media } from "@/lib/media-slots";

export default function ParallaxDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Lady Victoria Designs celebration detail"
      className="relative h-[70vh] w-full overflow-hidden bg-ink md:h-[90vh]"
    >
      <div
        ref={imageRef}
        className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
      >
        <Image
          src={media["home.parallax"]}
          alt="Luxury wedding reception designed by Lady Victoria Designs"
          fill
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/15" />
      </div>
    </div>
  );
}
