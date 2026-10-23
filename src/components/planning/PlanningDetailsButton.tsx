"use client";

import { useId, useRef } from "react";
import type { PlanningPackage } from "@/data/packages";
import PackageInclusions from "./PackageInclusions";

export default function PlanningDetailsButton({ packageDetails }: { packageDetails: PlanningPackage }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex max-w-full items-center justify-between gap-6 self-start border border-ink bg-ink px-6 py-4 text-left font-body text-xs uppercase tracking-[0.18em] text-ivory transition-colors duration-300 hover:bg-transparent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        <span>Planning details</span><span aria-hidden="true">→</span>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => triggerRef.current?.focus()}
        data-lenis-prevent
        className="m-auto h-[calc(100dvh-2rem)] max-h-[90dvh] w-[min(1120px,calc(100vw-2rem))] max-w-none overflow-hidden border border-ink/15 bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/70"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-start justify-between gap-6 border-b border-ink/15 bg-ivory px-6 py-6 md:px-10">
            <div>
              <p className="mb-2 font-body text-[10px] uppercase tracking-[0.2em] text-gold">Package {packageDetails.number} · Planning details</p>
              <h2 id={titleId} className="font-display text-2xl leading-tight md:text-4xl">{packageDetails.name}</h2>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close planning details" className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/20 text-xl text-ink hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold">×</button>
          </div>
          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <PackageInclusions packageDetails={packageDetails} variant="content" />
          </div>
        </div>
      </dialog>
    </>
  );
}
