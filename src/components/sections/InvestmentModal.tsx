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

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const ArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in">
      {/* Dark backdrop with blur */}
      <div
        className="absolute inset-0 bg-ink/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tier-modal-title"
        className="relative w-full max-w-4xl bg-ivory rounded-sm shadow-2xl border border-ink/15 overflow-hidden flex flex-col max-h-[90vh] z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 shrink-0" />

        {/* Modal Header Bar with Tier Switcher Tabs */}
        <div className="bg-white/80 border-b border-ink/10 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          {/* Tier Switcher Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            {INVESTMENT_TIERS.map((tier) => {
              const isSelected = tier.id === currentTier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => onSelectTier(tier.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full font-body text-[10px] sm:text-xs uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-ink text-ivory font-semibold shadow-xs"
                      : "bg-ivory text-ink/70 hover:text-ink hover:bg-ecru border border-ink/10"
                  }`}
                >
                  {tier.name}
                </button>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-ink/5 text-ink/60 hover:text-ink transition-colors cursor-pointer shrink-0 ml-2"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-6 sm:px-10 py-8 space-y-8 flex-1">
          
          {/* Main Tier Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ink/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold font-bold">
                  {currentTier.tierLabel}
                </span>
                {currentTier.isSignature && (
                  <span className="bg-gold/15 text-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-semibold border border-gold/30">
                    Signature Experience
                  </span>
                )}
              </div>
              <h2
                id="tier-modal-title"
                className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight"
              >
                {currentTier.name}
              </h2>
            </div>

            <div className="flex flex-col md:items-end">
              <span className="font-body text-[10px] uppercase tracking-widest text-ink/50 mb-1">
                Investment Starting Point
              </span>
              <span className="font-display text-2xl sm:text-3xl text-gold font-medium">
                {currentTier.price}
              </span>
            </div>
          </div>

          {/* Tagline & Overview Description */}
          <div className="space-y-4">
            <p className="font-display italic text-xl sm:text-2xl text-ink/90 leading-snug">
              &ldquo;{currentTier.tagline}&rdquo;
            </p>
            <p className="font-body text-sm sm:text-base text-ink/80 leading-relaxed">
              {currentTier.desc}
            </p>
          </div>

          {/* Ideal For Callout Box */}
          <div className="p-4 sm:p-5 rounded-sm bg-ecru/70 border border-ink/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-gold font-bold shrink-0">
              IDEAL FOR:
            </span>
            <p className="font-body text-xs sm:text-sm text-ink/85 leading-relaxed">
              {currentTier.idealFor}
            </p>
          </div>

          {/* Detailed Scope Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="font-body text-xs uppercase tracking-[0.25em] text-ink/60 font-semibold">
                WHAT&apos;S INCLUDED IN THIS TIER
              </span>
              <div className="h-px bg-ink/10 flex-1 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {currentTier.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-sm bg-white/70 border border-ink/10 flex flex-col justify-start hover:border-gold/40 transition-colors shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-gold shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4" />
                    </span>
                    <h3 className="font-display text-base sm:text-lg text-ink font-normal leading-snug">
                      {item.bold}
                    </h3>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-ink/75 leading-relaxed pl-6.5">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Fine Print Note */}
          <p className="font-body text-xs text-ink/50 italic pt-2">
            {currentTier.subtext}
          </p>
        </div>

        {/* Modal Footer Action Bar */}
        <div className="bg-white/90 border-t border-ink/10 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-center sm:text-left">
            <span className="font-body text-xs text-ink/70">
              Ready to explore availability for your celebration date?
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href="/quiz"
              onClick={onClose}
              className="w-1/2 sm:w-auto text-center px-5 py-3 border border-ink/20 text-ink font-body text-xs uppercase tracking-[0.15em] hover:bg-ink hover:text-ivory transition-colors duration-200"
            >
              Scope Quiz
            </Link>
            <Link
              href="/inquire"
              onClick={onClose}
              className="w-1/2 sm:w-auto text-center px-6 py-3 bg-ink text-ivory font-body text-xs uppercase tracking-[0.15em] hover:bg-gold hover:text-ink transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Inquire Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
