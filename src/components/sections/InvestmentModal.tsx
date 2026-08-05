"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { INVESTMENT_TIERS, InvestmentTierData } from "@/data/investments";

interface InvestmentModalProps {
  isOpen: boolean;
  activeTierId: string | null;
  onClose: () => void;
  onSelectTier: (tierId: string) => void;
}

export default function InvestmentModal({
  isOpen,
  activeTierId,
  onClose,
  onSelectTier,
}: InvestmentModalProps) {
  // Lock body scroll when modal is open & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTier: InvestmentTierData =
    INVESTMENT_TIERS.find((t) => t.id === activeTierId) || INVESTMENT_TIERS[0];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-500 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-Height Luxury Atelier Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tier-modal-title"
        className="relative w-full lg:w-[85vw] xl:w-[75vw] max-w-[1280px] h-full bg-ivory text-ink shadow-2xl z-10 flex flex-col lg:flex-row overflow-hidden animate-in slide-in-from-right duration-500 ease-out border-l border-ink/15"
      >
        {/* LEFT COLUMN (Desktop): Visual Editorial Showcase */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-ink flex-col justify-between p-12 overflow-hidden">
          {/* Background Photography for the Selected Tier */}
          <Image
            src={currentTier.image}
            alt={currentTier.name}
            fill
            sizes="45vw"
            className="object-cover opacity-60 scale-105 transition-all duration-1000 ease-out"
            priority
          />
          
          {/* Subtle Vignette & Tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />

          {/* Top Atelier Badge */}
          <div className="relative z-10">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-semibold block mb-2">
              LADY VICTORIA DESIGNS
            </span>
            <div className="font-display italic text-2xl text-ivory/90">
              Scope &amp; Investment Guide
            </div>
          </div>

          {/* Bottom Summary on Visual Panel */}
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-px bg-gold/60" />
            <div className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
              {currentTier.tierLabel}
            </div>
            <h2 className="font-display text-4xl xl:text-5xl text-ivory leading-tight">
              {currentTier.name}
            </h2>
            <div className="font-display text-2xl text-gold font-light">
              {currentTier.price}
            </div>
            <p className="font-body text-xs text-ivory/70 leading-relaxed font-light pt-2">
              {currentTier.idealFor}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Scrollable Atelier Reading Sheet */}
        <div className="w-full lg:w-7/12 h-full flex flex-col bg-ivory overflow-hidden">
          
          {/* Drawer Top Navigation & Close Header */}
          <div className="px-6 md:px-10 py-6 border-b border-ink/10 flex items-center justify-between gap-4 shrink-0 bg-ivory/95 backdrop-blur-md z-20">
            
            {/* Elegant Typographic Tier Switcher */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-1">
              {INVESTMENT_TIERS.map((tier, idx) => {
                const isSelected = tier.id === currentTier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => onSelectTier(tier.id)}
                    className={`font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-1 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "text-ink font-bold border-b-2 border-gold"
                        : "text-ink/40 hover:text-ink border-b-2 border-transparent"
                    }`}
                  >
                    <span className="text-gold mr-1.5 font-normal">0{idx + 1}.</span>
                    {tier.name}
                  </button>
                );
              })}
            </div>

            {/* Minimalist Luxury Close Button */}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close tier details"
              className="group flex items-center gap-2 text-ink/60 hover:text-ink transition-colors cursor-pointer shrink-0 pl-4 py-1"
            >
              <span className="font-body text-[10px] uppercase tracking-[0.2em] hidden sm:inline group-hover:text-gold transition-colors">
                Close
              </span>
              <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-xs group-hover:border-ink group-hover:bg-ink group-hover:text-ivory transition-all">
                ✕
              </span>
            </button>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 sm:py-10 space-y-10">
            
            {/* Tier Identity Header (Mobile/Tablet + Context) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-bold">
                  {currentTier.tierLabel}
                </span>
                {currentTier.isSignature && (
                  <span className="font-body text-[9px] uppercase tracking-widest text-ink/70 bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                    Signature Experience
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
                  {currentTier.name}
                </h1>
                <span className="font-display text-2xl sm:text-3xl text-gold font-normal">
                  {currentTier.price}
                </span>
              </div>

              <p className="font-display italic text-xl sm:text-2xl text-ink/85 leading-snug pt-1">
                &ldquo;{currentTier.tagline}&rdquo;
              </p>

              <p className="font-body text-sm md:text-base text-ink/75 leading-relaxed font-light">
                {currentTier.desc}
              </p>
            </div>

            {/* Ideal Celebration Context */}
            <div className="border-y border-ink/10 py-5 my-6 flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-4">
              <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-bold shrink-0">
                SUITED FOR:
              </span>
              <p className="font-body text-xs sm:text-sm text-ink/80 leading-relaxed font-light">
                {currentTier.idealFor}
              </p>
            </div>

            {/* Comprehensive Scope & Deliverables (Editorial List Layout) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <h3 className="font-body text-xs uppercase tracking-[0.25em] text-ink font-bold">
                  SCOPE &amp; DELIVERABLES
                </h3>
                <span className="font-body text-[10px] uppercase tracking-widest text-ink/50">
                  {currentTier.deliverables.length} Key Elements
                </span>
              </div>

              <div className="divide-y divide-ink/10">
                {currentTier.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-5 first:pt-2 last:pb-2 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 group"
                  >
                    <div className="md:col-span-4 flex items-baseline gap-3">
                      <span className="font-display italic text-gold text-sm font-normal">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <h4 className="font-display text-base md:text-lg text-ink font-medium leading-snug">
                        {item.bold}
                      </h4>
                    </div>
                    <div className="md:col-span-8 pl-6 md:pl-0">
                      <p className="font-body text-xs sm:text-sm text-ink/70 leading-relaxed font-light">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Print / Investment Notes */}
            <div className="bg-ecru/50 border border-ink/10 p-5 rounded-sm space-y-2">
              <span className="font-body text-[9px] uppercase tracking-[0.2em] text-gold font-bold block">
                CUSTOM PROPOSAL NOTE
              </span>
              <p className="font-body text-xs text-ink/65 leading-relaxed italic">
                {currentTier.subtext} Every celebration is individually quoted following a deep-dive design consultation.
              </p>
            </div>

            {/* Bottom Actions inside the natural scroll flow */}
            <div className="pt-6 pb-8 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="font-body text-xs text-ink/70 block">
                  Planning a celebration in Washington D.C., MD, VA, or destination?
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/quiz"
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-6 py-3.5 border border-ink/30 text-ink font-body text-xs uppercase tracking-[0.2em] hover:bg-ink hover:text-ivory transition-all duration-300"
                >
                  Scope Quiz
                </Link>
                <Link
                  href={`/inquire?service=${encodeURIComponent(currentTier.inquireQuery)}`}
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-8 py-3.5 bg-ink text-ivory font-body text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-ink transition-all duration-300 shadow-md font-semibold flex items-center justify-center gap-2"
                >
                  <span>Inquire For This Scope</span>
                  <span className="text-gold">→</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
