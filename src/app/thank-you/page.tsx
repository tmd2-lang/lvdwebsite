import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for your inquiry. Schedule your private design consultation with Irene.",
  robots: "noindex, nofollow", // Prevent search engines from indexing the thank you page
};

export default function ThankYouPage() {
  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center pt-32 pb-24 px-6 md:px-12 relative overflow-hidden font-body">
      {/* Background Subtle Wash */}
      <div className="absolute inset-0 bg-ink/[0.02] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 animate-fade-in">
        
        {/* Success Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
            Inquiry Received
          </span>
        </div>

        {/* Hero Copy */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-4 leading-tight">
          Thank you for connecting.
        </h1>
        
        <p className="font-body text-sm sm:text-base md:text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed mb-12">
          Your details have been securely sent to Irene and our studio. While we review your celebration details, you are invited to fast-track your inquiry by reserving a design session.
        </p>

        {/* Direct Booking Card with Calendly Embed */}
        <div className="w-full bg-ecru/50 border border-ink/10 rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl mb-12 text-center">
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
            FAST-TRACK YOUR CONSULTATION
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
            Select Your Private Design Session Time
          </h2>
          <p className="font-body text-xs sm:text-sm text-ink/70 max-w-xl mx-auto mb-6 leading-relaxed">
            Reserve a 20-minute design consultation directly on Irene’s private calendar below:
          </p>

          {/* Embedded Calendly Scheduler */}
          <div 
            className="w-full rounded-xl overflow-hidden shadow-inner border border-ink/10 bg-ivory min-h-[620px] relative"
            data-lenis-prevent
          >
            <iframe
              src="https://calendly.com/ladyvictoriadesigns"
              title="Schedule Consultation with Irene"
              className="w-full h-[650px] border-0"
              data-lenis-prevent
            />
          </div>

          {/* Direct Link Fallback */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="font-body text-xs text-ink/60">Prefer opening in a new tab?</span>
            <a
              href="https://calendly.com/ladyvictoriadesigns"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs uppercase tracking-widest text-gold font-semibold underline hover:text-ink transition-colors"
            >
              Open Calendar Full Screen ↗
            </a>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full border-t border-ink/10 pt-10">
          <Link
            href="/gallery"
            className="w-full sm:w-auto bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-gold hover:text-ink transition-colors rounded-full"
          >
            Explore Portfolio
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto bg-transparent border border-ink/30 text-ink font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:border-ink transition-colors rounded-full"
          >
            Return Home
          </Link>
        </div>

      </div>
    </main>
  );
}
