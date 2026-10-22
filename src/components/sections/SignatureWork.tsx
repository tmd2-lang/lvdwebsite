"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { media } from "@/lib/media-slots";

const projects = [
  {
    id: 1,
    src: media["home.work.1"],
    title: "Aniedi & Ekemini Wedding",
    detail: "Wedding · Reception Design",
    position: "center center",
  },
  {
    id: 2,
    src: media["home.work.2"],
    title: "Bespoke Floral Installation",
    detail: "Floral Artistry · Installation",
    position: "center center",
  },
  {
    id: 3,
    src: media["home.work.3"],
    title: "Jenny & Jordan Celebration",
    detail: "Wedding · Reception Design",
    position: "center center",
  },
  {
    id: 4,
    src: media["home.work.4"],
    title: "Sculptural Celebration Artistry",
    detail: "Ceremony · Floral Artistry",
    position: "center center",
  },
  {
    id: 5,
    src: media["home.work.5"],
    title: "Royal Purple Grandeur",
    detail: "Reception · Tablescape",
    position: "center center",
  },
  {
    id: 6,
    src: media["home.work.6"],
    title: "Eiserike Wedding Celebration",
    detail: "Wedding · Floral Design",
    position: "center center",
  },
];

export default function SignatureWork() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const mediaLayers = gsap.utils.toArray<HTMLElement>(
        "[data-signature-work-media]",
      );

      mediaLayers.forEach((mediaLayer) => {
        gsap.fromTo(
          mediaLayer,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: mediaLayer.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="signature-work-title"
      className="relative z-10 w-full overflow-hidden bg-ecru text-ink"
    >
      <header className="mx-auto flex min-h-[48svh] max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center md:min-h-[60svh] md:px-12 md:py-28">
        <p className="mb-7 font-body text-[10px] uppercase tracking-[0.24em] text-gold md:text-xs">
          Selected Celebrations
        </p>
        <h2
          id="signature-work-title"
          className="max-w-6xl font-display text-[clamp(2.7rem,6vw,6.75rem)] uppercase leading-[0.94] tracking-[-0.04em]"
        >
          Occasions with a point of view
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-x-2 gap-y-24 px-2 pb-24 sm:px-4 md:grid-cols-2 md:gap-x-3 md:gap-y-32 md:px-3 md:pb-36 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href="/gallery"
            aria-label={`View ${project.title} in the gallery`}
            className="group gallery-img-container block min-w-0"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ink/10">
              <div
                data-signature-work-media
                className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
              >
                <Image
                  src={project.src}
                  alt={`${project.title} by Lady Victoria Designs`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 34vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  style={{ objectPosition: project.position }}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="py-4 md:py-5">
              <p className="font-body text-[10px] uppercase tracking-[0.16em] text-ink/55 md:text-xs">
                {project.detail}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center border-t border-ink/10 px-6 py-16 md:py-20">
        <Link
          href="/gallery"
          className="border border-ink/25 px-8 py-4 font-body text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-ink hover:text-ivory"
        >
          View Full Gallery
        </Link>
      </div>
    </section>
  );
}
