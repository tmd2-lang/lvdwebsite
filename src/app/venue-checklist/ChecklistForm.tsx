"use client";

import { useState, type FormEvent } from "react";

const BUDGETS = [
  "Under $60,000",
  "$60,000–$100,000",
  "$100,000–$150,000",
  "$150,000–$200,000",
  "$200,000+",
];

const PDF = {
  standard: "/venue-checklist/before-you-book-the-venue.pdf",
  multicultural: "/venue-checklist/before-you-book-the-venue-multicultural.pdf",
};

const label = "font-body text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold";
const field =
  "w-full bg-transparent border-b border-ink/20 pb-3 pt-2 font-body text-base text-ink outline-none focus:border-gold transition-colors placeholder:text-ink/25";

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
  const [month, setMonth] = useState("");
  const [dateUnsure, setDateUnsure] = useState(false);
  const [budget, setBudget] = useState("");
  const [venue, setVenue] = useState("");
  const [multicultural, setMulticultural] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Saving the signup and sending the email come later; for now the form only reveals the download.
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please add your name and a valid email.");
    if (!month && !dateUnsure) return setError("Please add your wedding month, or tick “Not sure yet.”");
    if (!budget || !venue || !multicultural) return setError("Please answer each question so we can send the right edition.");
    setError("");
    setDone(true);
  };

  if (done) {
    const firstName = name.trim().split(/\s+/)[0];
    const edition = multicultural === "yes" ? "multicultural" : "standard";
    return (
      <div className="text-center py-6">
        <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-4">Your checklist is ready</p>
        <h2 className="font-display text-3xl sm:text-4xl leading-tight mb-4">It’s yours, {firstName}.</h2>
        <p className="font-body text-sm text-ink/70 leading-relaxed max-w-sm mx-auto mb-8">
          {edition === "multicultural"
            ? "Here is the Multicultural Edition, with a chapter for multiple ceremonies, sacred traditions, and processions."
            : "Save it to your phone or print it before your next venue tour."}
        </p>
        <a href={PDF[edition]} download
          className="inline-flex items-center gap-3 bg-ink text-ivory font-body text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors">
          Download the checklist
        </a>
      </div>
    );
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

      <div className="flex flex-col gap-1">
        <span className={label}>Wedding date</span>
        <div className="flex items-end gap-5">
          <input className={`${field} ${dateUnsure ? "opacity-40" : ""}`} type="month" value={month} disabled={dateUnsure}
            onChange={(e) => setMonth(e.target.value)} aria-label="Wedding month" />
          <label className="flex items-center gap-2 pb-3 font-body text-sm text-ink/70 whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={dateUnsure} onChange={(e) => setDateUnsure(e.target.checked)} className="accent-[#A8894E] w-4 h-4" />
            Not sure yet
          </label>
        </div>
      </div>

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

      <button type="submit"
        className="w-full bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors">
        Send me the venue checklist
      </button>
      <p className="font-body text-[11px] text-ink/45 text-center -mt-3">Complimentary from Lady Victoria Designs.</p>
    </form>
  );
}
