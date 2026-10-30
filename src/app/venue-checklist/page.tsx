import Image from "next/image";
import ChecklistForm from "./ChecklistForm";
import styles from "./venue-checklist.module.css";

const INSIDE = [
  ["Every question that matters", "Hours, capacity, catering, décor access, parking, and the true total cost, plus the red flags to listen for."],
  ["Start here", "Five steps to take before you contact a single venue."],
  ["One box, three marks", "Asked, told yes, or confirmed in writing, so you know what is still only a promise."],
  ["A multicultural edition", "A dedicated chapter for multiple ceremonies, sacred fire, processions, and family needs."],
];

// The pages start scattered and settle into the fan once, on load; the cover lands last.
function GuidePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] aspect-[3/3.1]">
      <div className="absolute left-[2%] top-[9%] w-[60%] rotate-[-7deg]">
        <div className={`${styles.settle} ${styles.fromLeft} shadow-[0_18px_40px_rgba(20,18,15,0.18)]`}>
          <Image src="/venue-checklist/v3-questions.jpg" alt="" width={1100} height={1424} sizes="240px" className="w-full h-auto" />
        </div>
      </div>
      <div className="absolute right-[2%] top-[9%] w-[60%] rotate-[7deg]">
        <div className={`${styles.settle} ${styles.fromRight} shadow-[0_18px_40px_rgba(20,18,15,0.18)]`}>
          <Image src="/venue-checklist/v3-start-here.jpg" alt="" width={1100} height={1424} sizes="240px" className="w-full h-auto" />
        </div>
      </div>
      <div className="absolute left-1/2 top-0 w-[66%] -translate-x-1/2">
        <div className={`${styles.settle} ${styles.fromAbove} shadow-[0_24px_50px_rgba(20,18,15,0.25)]`}>
          <Image src="/venue-checklist/cover-standard.jpg" alt="The cover of Before You Book the Venue" width={1100} height={1424}
            sizes="(max-width: 640px) 230px, 270px" priority className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
}

export default function VenueChecklistPage() {
  return (
    <main className="w-full bg-ivory text-ink overflow-x-clip">
      {/* Logo only: an ad landing page has one job, so there is no menu to leave by. */}
      <div className="px-6 md:px-12 pt-7 pb-2 font-display italic text-lg md:text-xl">Lady Victoria Designs</div>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-8 pb-20 lg:pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="lg:pt-6">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-5">Complimentary venue checklist</p>
            <h1 className="font-display text-[clamp(2.6rem,8vw,4.5rem)] leading-[1.02] tracking-tight mb-5">
              Touring venues? <span className="italic text-gold">Start here.</span>
            </h1>
            <p className="font-display text-[clamp(1.3rem,3vw,1.75rem)] leading-snug max-w-xl mb-10">
              Before you book the venue, ask the questions that protect your celebration.
            </p>
            {/* On phones the form sits below the preview, so give a way straight to it. */}
            <a href="#get-the-checklist"
              className="lg:hidden inline-flex mb-12 bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors">
              Get the checklist
            </a>
            <GuidePreview />
          </div>

          <div id="get-the-checklist" className="bg-white/60 border border-ink/10 rounded-2xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(20,18,15,0.08)] lg:sticky lg:top-8">
            <h2 className="font-display text-2xl sm:text-3xl mb-2">Get the checklist</h2>
            <p className="font-body text-sm text-ink/60 mb-8">Tell us a little about your wedding and we will send the right edition.</p>
            <ChecklistForm />
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="bg-ecru/60 px-6 md:px-12 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-4">Inside the guide</p>
          <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] leading-tight mb-12 max-w-2xl">The questions our planners ask on every venue tour.</h2>
          <div className="grid sm:grid-cols-2 gap-x-14 gap-y-10">
            {INSIDE.map(([title, body]) => (
              <div key={title} className="border-t border-ink/15 pt-6">
                <h3 className="font-display text-2xl mb-2">{title}</h3>
                <p className="font-body text-sm md:text-base text-ink/65 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The one rule */}
      <section className="relative min-h-[70vh] flex items-end">
        <Image src="/venue-checklist/rule-lounge.jpg" alt="An evening reception lounge with a tall gold vase of white roses" fill sizes="100vw" className="object-cover object-[60%_50%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="relative px-6 md:px-12 pb-16 lg:pb-24 max-w-6xl mx-auto w-full text-ivory">
          <p className="font-body text-[11px] uppercase tracking-[0.28em] text-[#D9BC82] font-semibold mb-4">The one rule</p>
          <h2 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02] mb-5 max-w-3xl">“We’re flexible” <span className="italic">is not a yes.</span></h2>
          <p className="font-body text-base md:text-lg text-ivory/80 leading-relaxed max-w-xl">
            If a promise affects your ceremony, décor, food, music, parking, guest count, budget, installation, or timeline, get it confirmed in the contract before you pay the deposit.
          </p>
        </div>
      </section>

      {/* From Irene */}
      <section className="px-6 md:px-12 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-8">
            <Image src="/venue-checklist/irene.jpg" alt="Irene Ntiako" width={192} height={192} className="w-full h-full object-cover object-top" />
          </div>
          <p className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-snug mb-6">
            “The venue is the first big decision you make, and nearly every decision after it depends on it.”
          </p>
          <p className="font-display italic text-xl mb-1">With care, Irene</p>
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50">Founder &amp; Creative Director, Lady Victoria Designs</p>
          <a href="#get-the-checklist"
            className="inline-flex mt-12 bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-10 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors">
            Get the free checklist
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 border-t border-ink/10 flex flex-wrap justify-between gap-3 font-body text-[11px] text-ink/45">
        <p>© {new Date().getFullYear()} Lady Victoria Designs</p>
        <a href="/privacy" className="hover:text-gold transition-colors">Privacy</a>
      </footer>
    </main>
  );
}
