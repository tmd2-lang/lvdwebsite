"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { submitLead } from "@/lib/lead-submit";
import { trackMetaChecklistDownload } from "@/lib/meta-pixel";
import styles from "./venue-checklist.module.css";

const BUDGETS = [
  "$60,000–$100,000",
  "$100,000–$150,000",
  "$150,000–$200,000",
  "$200,000+",
];

// Irene (Oct 31): ask the year only. This year and the next three.
const THIS_YEAR = new Date().getFullYear();
const YEARS = [0, 1, 2, 3].map((n) => String(THIS_YEAR + n));

const PDF = {
  standard: "/venue-checklist/before-you-book-the-venue.pdf",
  multicultural: "/venue-checklist/before-you-book-the-venue-multicultural.pdf",
};

const COVER = {
  standard: "/venue-checklist/cover-standard.jpg",
  multicultural: "/venue-checklist/cover-multicultural.jpg",
};

const label = "font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold";
const field =
  "w-full bg-transparent border-b border-ink/20 pb-3 pt-2 font-body text-base text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/25";

// After the download: an optional "text me" for couples who want to hear from Irene.
function TextMe({ leadId }: { leadId: string }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (state === "saving") return;
    if (phone.replace(/\D/g, "").length < 10) return setError("Please enter a full phone number.");
    setError("");
    setState("saving");
    const response = await fetch("/api/venue-checklist/phone", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, phone }),
    }).catch(() => null);
    const result = await response?.json().catch(() => ({})) as { error?: string } | undefined;
    if (response?.ok) return setState("done");
    setError(result?.error || "That didn’t save. Please try again.");
    setState("idle");
  };

  if (state === "done") return (
    <p className="font-display text-xl leading-snug">Perfect. Irene will text you soon.</p>
  );

  return (
    <form onSubmit={save} noValidate>
      <p className="font-display text-xl sm:text-2xl leading-snug mb-1">Want a quick text from Irene?</p>
      <p className="font-body text-xs text-ink/55 leading-relaxed mb-5">Optional. A personal note as you start touring, never a sales list.</p>
      <div className="flex gap-3 items-end">
        <input className={field} type="tel" inputMode="tel" autoComplete="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)} placeholder="Your mobile number" aria-label="Your mobile number" />
        <button type="submit" disabled={state === "saving"}
          className="shrink-0 border border-ink text-ink font-body text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:bg-ink hover:text-ivory transition-colors disabled:opacity-50">
          {state === "saving" ? "Saving…" : "Text me"}
        </button>
      </div>
      {error && <p className="font-body text-sm text-[#9a3b2e] mt-3" role="alert">{error}</p>}
    </form>
  );
}

// Takes over the whole screen after signup so the download can't be missed.
// Rendered on <body> because the form card's sticky position would trap it behind later sections.
function ReadyScreen({ firstName, edition, leadId }: { firstName: string; edition: "standard" | "multicultural"; leadId: string }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    heading.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previous; };
  }, []);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="checklist-ready"
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-ivory text-ink">
      <div className="min-h-full flex flex-col">
        <div className="px-6 md:px-12 pt-6 md:pt-7 font-display italic text-lg md:text-xl">Lady Victoria Designs</div>

        <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-6 lg:py-10 grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
          <div className="relative mx-auto h-[33svh] min-h-[220px] max-h-[300px] lg:h-auto lg:max-h-none lg:w-[min(100%,66svh)] aspect-[1/1]">
            <div className="absolute left-[3%] top-[8%] h-[88%] aspect-[1100/1424] rotate-[-7deg]">
              <div className={`${styles.fanLeft} shadow-[0_18px_40px_rgba(20,18,15,0.18)]`}>
                <Image src="/venue-checklist/v4-questions-tips.jpg" alt="" width={1100} height={1424} sizes="(min-width: 1024px) 380px, 200px" className="w-full h-auto" />
              </div>
            </div>
            <div className="absolute right-[3%] top-[8%] h-[88%] aspect-[1100/1424] rotate-[7deg]">
              <div className={`${styles.fanRight} shadow-[0_18px_40px_rgba(20,18,15,0.18)]`}>
                <Image src="/venue-checklist/v4-top10.jpg" alt="" width={1100} height={1424} sizes="(min-width: 1024px) 380px, 200px" className="w-full h-auto" />
              </div>
            </div>
            <div className="absolute left-1/2 top-0 h-full aspect-[1100/1424] -translate-x-1/2">
              <div className={`${styles.land} shadow-[0_24px_50px_rgba(20,18,15,0.25)]`}>
                <Image src={COVER[edition]} alt="The cover of your venue checklist" width={1100} height={1424} priority
                  sizes="(min-width: 1024px) 430px, 230px" className="w-full h-auto" />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left w-full max-w-md mx-auto lg:mx-0">
            <div className={styles.rise}>
              <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-3">Your checklist is ready</p>
              <h2 id="checklist-ready" ref={heading} tabIndex={-1} className="font-display text-[clamp(2.4rem,7vw,3.75rem)] leading-[1.05] tracking-tight mb-3 outline-none">
                It’s yours, {firstName}.
              </h2>
              <p className="font-body text-sm md:text-base text-ink/70 leading-relaxed mb-6">
                {edition === "multicultural"
                  ? "Here is the Multicultural Edition, with a chapter for multiple ceremonies, sacred traditions, and processions."
                  : "Save it to your phone or print it before your next venue tour."}
              </p>
            </div>
            {/* PDF only for now (Irene, Oct 31). The phone checklist stays built at /venue-checklist/tour. */}
            <a href={PDF[edition]} download onClick={() => trackMetaChecklistDownload(edition)}
              className={`${styles.rise} ${styles.riseNow} flex items-center justify-center gap-2.5 w-full bg-ink text-ivory font-body text-[13px] sm:text-sm uppercase tracking-[0.12em] font-semibold px-4 py-5 rounded-full shadow-[0_14px_30px_rgba(20,18,15,0.22)] hover:bg-gold hover:text-ink transition-colors`}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
              </svg>
              Download the checklist
            </a>
            <div className={styles.rise}>
              {/* No saved lead means no email went out, so don't promise one. */}
              {leadId && (
                <>
                  <p className="font-body text-xs text-ink/55 leading-relaxed mt-4">
                    We’ve also emailed you a copy. If you don’t see it, check your Promotions or spam folder.
                  </p>
                  <div className="text-left border-t border-ink/10 mt-7 pt-6"><TextMe leadId={leadId} /></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Choice({ name, value, current, onPick, children }: {
  name: string; value: string; current: string; onPick: (value: string) => void; children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <label className={`rounded-full border px-5 py-2.5 font-body text-sm cursor-pointer transition-colors text-center ${active ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink/70 hover:border-gold hover:text-gold"}`}>
      <input type="radio" name={name} value={value} checked={active} onChange={() => onPick(value)} className="sr-only" />
      {children}
    </label>
  );
}

export default function ChecklistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [budget, setBudget] = useState("");
  const [venue, setVenue] = useState("");
  const [multicultural, setMulticultural] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please add your name and a valid email.");
    if (!year || !budget || !venue || !multicultural) return setError("Please answer each question so we can send the right edition.");
    setError("");
    setSaving(true);
    const edition = multicultural === "yes" ? "multicultural" : "standard";
    try {
      // Mapped onto the inquiry columns the studio already sees: celebration, venue, budget.
      // Only the year is asked, so the date stays open and the year goes in the notes.
      const saved = await submitLead({
        source: "venue_checklist",
        name: name.trim(),
        email: email.trim(),
        phone: "",
        celebrationType: edition === "multicultural" ? "Multicultural wedding" : "Wedding",
        dateUndecided: true,
        vision: `Wedding year: ${year}`,
        venue: venue === "booked" ? "Already booked (not named)" : undefined,
        investment: budget,
        payload: { edition, venueStatus: venue, weddingYear: year },
      });
      setLeadId(saved.leadId);
    } catch (saveError) {
      // The download matters more than the record: never hold the guide back over a failed save.
      console.error("Venue checklist signup was not saved:", saveError);
    }
    setSaving(false);
    setDone(true);
  };

  if (done) {
    const firstName = name.trim().split(/\s+/)[0];
    const edition = multicultural === "yes" ? "multicultural" : "standard";
    return <ReadyScreen firstName={firstName} edition={edition} leadId={leadId} />;
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7">
      <div className="grid sm:grid-cols-2 gap-7">
        <label className="flex flex-col gap-1">
          <span className={label}>Name</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Email</span>
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@email.com" />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={label}>Wedding year</span>
        <select className={`${field} cursor-pointer ${year ? "" : "text-ink/40"}`} value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="" disabled>Choose a year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className={label}>Estimated full wedding budget</span>
        <select className={`${field} cursor-pointer ${budget ? "" : "text-ink/40"}`} value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="" disabled>Choose a range</option>
          {BUDGETS.map((range) => <option key={range} value={range}>{range}</option>)}
        </select>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${label} mb-3`}>Your venue</legend>
        <div className="grid grid-cols-2 gap-3">
          <Choice name="venue" value="looking" current={venue} onPick={setVenue}>Still looking</Choice>
          <Choice name="venue" value="booked" current={venue} onPick={setVenue}>Already booked</Choice>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${label} mb-3`}>Planning a multicultural or multi-ceremony wedding?</legend>
        <div className="grid grid-cols-2 gap-3">
          <Choice name="multicultural" value="yes" current={multicultural} onPick={setMulticultural}>Yes</Choice>
          <Choice name="multicultural" value="no" current={multicultural} onPick={setMulticultural}>No</Choice>
        </div>
      </fieldset>

      {error && <p className="font-body text-sm text-[#9a3b2e]" role="alert">{error}</p>}

      <button type="submit" disabled={saving}
        className="w-full bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors disabled:opacity-60">
        {saving ? "Preparing your checklist…" : "Send me the venue checklist"}
      </button>
      <p className="font-body text-[11px] text-ink/45 text-center -mt-3">Complimentary from Lady Victoria Designs.</p>
    </form>
  );
}
