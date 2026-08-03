import React from "react";
import Link from "next/link";

export default function LetsBeginCard() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
      <div className="font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold mb-4">INQUIRE</div>
      <h3 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-ink mb-8 leading-tight">Let’s begin</h3>
      <p className="font-body text-[11px] md:text-xs text-ink/70 leading-relaxed mb-10 max-w-[40ch] mx-auto">
        We take a limited number of commissions each year. Tell us about your day and we’ll be in touch within two business days.
      </p>

      <Link href="/inquire" className="bg-ink text-ivory font-body text-[10px] md:text-xs uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold transition-colors w-full sm:w-auto inline-block">
        START YOUR INQUIRY &rarr;
      </Link>
    </div>
  );
}
