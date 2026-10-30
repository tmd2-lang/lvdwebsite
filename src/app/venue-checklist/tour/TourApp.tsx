"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChecklistSection } from "@/lib/venue-checklist-questions";
import { MAX_VENUES, newVenue, type Mark, type TourState, type Verdict, type VenueProgress } from "@/lib/venue-checklist-tour";

type Props = {
  leadId: string; token: string; firstName: string; sections: ChecklistSection[];
  initialTour: TourState; pdfUrl: string; consultationUrl: string;
};
type SaveState = "saved" | "saving" | "offline";
type View = "checklist" | "chase" | "compare";

const NEXT_MARK: Record<string, Mark | undefined> = { none: "slash", slash: "check", check: undefined };
const VERDICTS: [Verdict, string][] = [["clear", "Clear"], ["follow", "Needs follow-up"], ["deal", "Dealbreaker"]];
const VERDICT_STYLE: Record<Verdict, string> = {
  clear: "bg-[#E4EDE2] text-[#2F5130] border-[#2F5130]/30",
  follow: "bg-[#F5EBD7] text-[#7A5A1C] border-[#7A5A1C]/30",
  deal: "bg-[#F4E0DC] text-[#8A2F22] border-[#8A2F22]/30",
};
const kicker = "font-body text-[10px] uppercase tracking-[0.22em] text-ink/60 font-semibold";
const input = "w-full bg-transparent border-b border-ink/25 py-2 font-body text-[15px] text-ink outline-none focus:border-gold placeholder:text-ink/35";

function Box({ mark, size = 30 }: { mark?: Mark; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <rect x="1.5" y="1.5" width="27" height="27" rx="3" fill={mark === "check" ? "#14120F" : "#fff"} stroke="#14120F" strokeWidth="2" />
      {mark === "slash" && <path d="M8 22 22 8" stroke="#14120F" strokeWidth="2.6" strokeLinecap="round" />}
      {mark === "check" && <path d="M8 15.5 13 20.5 22.5 9.5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export default function TourApp({ leadId, token, firstName, sections, initialTour, pdfUrl, consultationUrl }: Props) {
  const storageKey = `lvd-venue-tour-${leadId}`;
  const [tour, setTour] = useState<TourState>(initialTour);
  const [venueId, setVenueId] = useState(initialTour.venues[0].id);
  const [view, setView] = useState<View>("checklist");
  const [open, setOpen] = useState<Record<string, boolean>>({ [sections[0].id]: true });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [copied, setCopied] = useState(false);
  const [onlyStars, setOnlyStars] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const dirty = useRef(false);
  const latest = useRef(tour);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(async () => {
    if (!dirty.current) return;
    setSaveState("saving");
    const sending = latest.current;
    try {
      const response = await fetch("/api/venue-checklist/tour", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, t: token, tour: sending }),
      });
      if (!response.ok) throw new Error(String(response.status));
      // Only clear the flag if nothing changed while this save was in flight.
      if (latest.current === sending) {
        dirty.current = false;
        try { localStorage.setItem(storageKey, JSON.stringify({ tour: sending, dirty: false })); } catch { /* Private mode: the server copy is enough. */ }
      }
      setSaveState(dirty.current ? "saving" : "saved");
    } catch {
      setSaveState("offline");
    }
  }, [leadId, token, storageKey]);

  // A copy is kept on the phone too, so a tour with no signal loses nothing:
  // unsaved changes from an earlier visit win, then sync once online.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null") as { tour?: TourState; dirty?: boolean } | null;
      if (stored?.dirty && stored.tour?.venues?.length) {
        latest.current = stored.tour;
        setTour(stored.tour);
        setVenueId(stored.tour.venues[0].id);
        dirty.current = true;
        save();
      }
    } catch { /* Nothing usable stored. */ }
    const retry = () => { if (dirty.current) save(); };
    window.addEventListener("online", retry);
    const interval = setInterval(retry, 20_000);
    return () => { window.removeEventListener("online", retry); clearInterval(interval); };
  }, [storageKey, save]);

  const update = useCallback((change: (draft: TourState) => TourState) => {
    setTour((current) => {
      const next = change(current);
      latest.current = next;
      dirty.current = true;
      try { localStorage.setItem(storageKey, JSON.stringify({ tour: next, dirty: true })); } catch { /* Server save still runs. */ }
      return next;
    });
    setSaveState("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 900);
  }, [save, storageKey]);

  const venue = tour.venues.find((v) => v.id === venueId) || tour.venues[0];
  const editVenue = (change: (v: VenueProgress) => VenueProgress) =>
    update((t) => ({ ...t, venues: t.venues.map((v) => (v.id === venue.id ? change(v) : v)) }));

  const cycle = (qid: string) => editVenue((v) => {
    const marks = { ...v.marks };
    const next = NEXT_MARK[marks[qid] && marks[qid] !== "na" ? marks[qid] : "none"];
    if (next) marks[qid] = next; else delete marks[qid];
    return { ...v, marks };
  });
  const toggleNa = (qid: string) => editVenue((v) => {
    const marks = { ...v.marks };
    if (marks[qid] === "na") delete marks[qid]; else marks[qid] = "na";
    return { ...v, marks };
  });
  // Writing down an answer means it was asked: an unmarked box becomes "told yes".
  const setAnswer = (qid: string, field: "answer" | "who", value: string) => editVenue((v) => ({
    ...v,
    answers: { ...v.answers, [qid]: { ...(v.answers[qid] || { answer: "", who: "" }), [field]: value } },
    marks: v.marks[qid] || !value.trim() ? v.marks : { ...v.marks, [qid]: "slash" },
  }));
  const setVerdict = (sid: string, verdict: Verdict) => editVenue((v) => {
    const verdicts = { ...v.verdicts };
    if (verdicts[sid] === verdict) delete verdicts[sid]; else verdicts[sid] = verdict;
    return { ...v, verdicts };
  });
  const addVenue = () => {
    const added = newVenue(`Venue ${tour.venues.length + 1}`);
    update((t) => ({ ...t, venues: [...t.venues, added] }));
    setVenueId(added.id);
    setView("checklist");
  };
  // With one venue left there is nothing to switch to, so "remove" starts it over instead.
  // Confirmed in the page, not with window.confirm: in-app browsers (Instagram, Facebook)
  // often block that dialog, so the delete would silently never happen.
  const removeVenue = () => {
    const rest = tour.venues.length < 2 ? [newVenue("Venue 1")] : tour.venues.filter((v) => v.id !== venue.id);
    update((t) => ({ ...t, venues: rest }));
    setVenueId(rest[0].id);
    setConfirmRemove(false);
  };

  const allQuestions = useMemo(() => sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s }))), [sections]);
  const counts = (v: VenueProgress) => {
    const live = allQuestions.filter((q) => v.marks[q.id] !== "na");
    return {
      total: live.length,
      asked: live.filter((q) => v.marks[q.id]).length,
      confirmed: live.filter((q) => v.marks[q.id] === "check").length,
    };
  };
  const chase = allQuestions.filter((q) => venue.marks[q.id] === "slash");
  const progress = counts(venue);
  const venueLabel = venue.name.trim() || "this venue";

  const chaseText = [
    `Hi${venue.name.trim() ? ` ${venue.name.trim()} team` : ""},`,
    "",
    "Thank you for the tour. Before we move forward, could you confirm the following by email?",
    "",
    ...chase.map((q, i) => `${i + 1}. ${q.text}${venue.answers[q.id]?.answer ? ` (We understood: ${venue.answers[q.id].answer})` : ""}`),
    "",
    "Thank you!",
    firstName,
  ].join("\n");
  const mailto = `mailto:${encodeURIComponent(venue.email.trim())}?subject=${encodeURIComponent("Confirming a few details from our tour")}&body=${encodeURIComponent(chaseText)}`;
  const copyChase = async () => {
    try { await navigator.clipboard.writeText(chaseText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* Clipboard blocked. */ }
  };

  return (
    <main className="w-full min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="/" className="font-display italic text-lg">Lady Victoria Designs</a>
          <span className="font-body text-[11px] text-ink/55" aria-live="polite">
            {saveState === "saving" ? "Saving…" : saveState === "offline" ? "No signal · saved on this phone" : "Saved"}
          </span>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {tour.venues.map((v) => (
            <span key={v.id} className={`shrink-0 flex items-center rounded-full border font-body text-sm ${v.id === venue.id ? "bg-ink text-white border-ink" : "border-ink/25 text-ink/75"}`}>
              <button onClick={() => { setVenueId(v.id); setConfirmRemove(false); }} className={`py-2 ${v.id === venue.id && tour.venues.length > 1 ? "pl-4 pr-1" : "px-4"}`}>
                {v.name.trim() || "Untitled venue"}
              </button>
              {/* Delete straight from the tab, for a venue added by mistake. */}
              {v.id === venue.id && tour.venues.length > 1 && (
                <button onClick={() => { setVenueId(v.id); setConfirmRemove(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Delete ${v.name.trim() || "this venue"}`} className="pl-1 pr-3 py-2 text-white/70 text-base leading-none">×</button>
              )}
            </span>
          ))}
          {tour.venues.length < MAX_VENUES && (
            <button onClick={addVenue} className="shrink-0 rounded-full border border-dashed border-ink/40 px-4 py-2 font-body text-sm text-ink/70">+ Add venue</button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pb-24">
        <section className="pt-8 pb-6">
          <p className={`${kicker} mb-3`}>Your venue checklist{firstName ? `, ${firstName}` : ""}</p>
          {/* Looks editable on purpose: couples rename "Venue 1" to the real venue. */}
          <label className="flex items-center gap-3 border-b border-dashed border-ink/30 focus-within:border-gold focus-within:border-solid">
            <span className="sr-only">Venue name</span>
            <input value={venue.name} onChange={(e) => editVenue((v) => ({ ...v, name: e.target.value }))} placeholder="Name this venue"
              onFocus={(e) => { if (/^Venue \d+$/.test(venue.name)) e.target.select(); }}
              className="flex-1 min-w-0 bg-transparent font-display text-[2rem] leading-tight py-1 outline-none placeholder:text-ink/30" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-ink/45" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" />
            </svg>
          </label>
          <div className="flex items-center justify-between gap-4 mt-2">
            <p className="font-body text-[13px] text-gold">{/^Venue \d+$/.test(venue.name.trim()) ? "Tap the name to rename it." : ""}</p>
            <button onClick={() => setConfirmRemove(true)} className="shrink-0 font-body text-[12px] text-ink/50 underline underline-offset-4">
              {tour.venues.length > 1 ? "Remove venue" : "Start over"}
            </button>
          </div>
          {confirmRemove && (
            <div role="alertdialog" aria-label="Confirm" className="mt-3 p-4 rounded-xl border border-[#8A2F22]/30 bg-[#F4E0DC]/60">
              <p className="font-body text-[14px] mb-3">
                {tour.venues.length > 1 ? `Delete ${venue.name.trim() || "this venue"} and all its answers?` : "Clear every answer and start over?"}
              </p>
              <div className="flex gap-3">
                <button onClick={removeVenue} className="rounded-full bg-[#8A2F22] text-white font-body text-[13px] px-5 py-2.5">
                  {tour.venues.length > 1 ? "Delete venue" : "Clear everything"}
                </button>
                <button onClick={() => setConfirmRemove(false)} className="rounded-full border border-ink/25 font-body text-[13px] px-5 py-2.5">Cancel</button>
              </div>
            </div>
          )}
          <p className="font-body text-sm text-ink/70 mt-3">
            {progress.asked} of {progress.total} asked · {progress.confirmed} confirmed in writing
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div className="h-full bg-ink" style={{ width: `${progress.total ? (progress.asked / progress.total) * 100 : 0}%` }} />
          </div>
        </section>

        <nav className="grid grid-cols-3 gap-1 p-1 rounded-full bg-ink/[0.06] mb-7" aria-label="Views">
          {([["checklist", "Checklist"], ["chase", `Chase list${chase.length ? ` (${chase.length})` : ""}`], ["compare", "Compare"]] as [View, string][]).map(([key, labelText]) => (
            <button key={key} onClick={() => setView(key)}
              className={`rounded-full py-2.5 font-body text-[13px] ${view === key ? "bg-white shadow-sm text-ink font-medium" : "text-ink/65"}`}>
              {labelText}
            </button>
          ))}
        </nav>

        {view === "checklist" && (<>
          <div className="mb-4 p-4 rounded-xl bg-ink/[0.04] font-body text-[13px] text-ink/70">
            <div className="flex items-center justify-between gap-3 text-ink">
              <span className="flex items-center gap-2"><Box size={18} />Not asked</span>
              <span className="flex items-center gap-2"><Box mark="slash" size={18} />Told yes</span>
              <span className="flex items-center gap-2"><Box mark="check" size={18} />In writing</span>
            </div>
            <p className="mt-3">Tap a box to change it. Skip anything that doesn’t apply.</p>
          </div>
          <label className="flex items-center justify-between gap-4 mb-8 px-1 font-body text-[14px] cursor-pointer">
            <span><span className="text-gold mr-1.5">★</span>Just the 10 dealbreakers</span>
            <input type="checkbox" role="switch" checked={onlyStars} className="sr-only peer"
              onChange={() => { setOnlyStars((on) => !on); if (!onlyStars) setOpen(Object.fromEntries(sections.map((s) => [s.id, true]))); }} />
            <span aria-hidden="true" className="relative w-11 h-6 rounded-full bg-ink/20 peer-checked:bg-ink transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>

          {sections.map((section) => {
            if (onlyStars && !section.questions.some((q) => q.star)) return null;
            const isOpen = open[section.id];
            const live = section.questions.filter((q) => venue.marks[q.id] !== "na");
            const done = live.filter((q) => venue.marks[q.id]).length;
            const verdict = venue.verdicts[section.id];
            return (
              <section key={section.id} className="border-t border-ink/15">
                <button onClick={() => setOpen((o) => ({ ...o, [section.id]: !o[section.id] }))} aria-expanded={!!isOpen}
                  className="w-full flex items-center gap-3 py-5 text-left">
                  <span className="font-body text-xs text-ink/45 w-6 tabular-nums">{section.num}</span>
                  <span className="flex-1 font-display text-[1.3rem] leading-snug">{section.title}</span>
                  {verdict && <span className={`rounded-full border px-2.5 py-1 font-body text-[11px] ${VERDICT_STYLE[verdict]}`}>{VERDICTS.find(([k]) => k === verdict)?.[1]}</span>}
                  <span className="font-body text-xs text-ink/55 tabular-nums">{done}/{live.length}</span>
                  <span className={`text-ink/50 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
                </button>
                {isOpen && (
                  <div className="pb-7">
                    {section.why && <p className="font-body text-[14px] text-ink/60 mb-2 leading-relaxed">{section.why}</p>}
                    <ul>
                      {section.questions.filter((q) => !onlyStars || q.star).map((q) => {
                        const mark = venue.marks[q.id];
                        const skipped = mark === "na";
                        return (
                          <li key={q.id} className="py-5 border-b border-ink/10">
                            <div className="flex gap-3.5 items-start">
                              <button onClick={() => cycle(q.id)} disabled={skipped} className="shrink-0 -m-1 p-1 disabled:opacity-30"
                                aria-label={`${q.text} ${mark === "check" ? "confirmed in writing" : mark === "slash" ? "told yes" : "not asked"}. Tap to change.`}>
                                <Box mark={skipped ? undefined : mark} />
                              </button>
                              <p className={`flex-1 font-body text-[15px] leading-relaxed pt-0.5 ${skipped ? "line-through text-ink/35" : ""}`}>
                                {q.star && <span className="text-gold mr-1.5">★</span>}{q.text}
                                {(q.why || q.tip) && !skipped && <span className="block font-body text-[13px] text-ink/55 mt-1.5 leading-snug">{q.why || q.tip}</span>}
                              </p>
                              <button onClick={() => toggleNa(q.id)} className="shrink-0 font-body text-[11px] uppercase tracking-[0.12em] text-ink/45 pt-1.5">
                                {skipped ? "Undo" : "Skip"}
                              </button>
                            </div>
                            {q.star && !skipped && (mark || venue.answers[q.id]) && (
                              <div className="ml-[2.9rem] mt-3 grid grid-cols-[1fr_8rem] gap-3">
                                <input className={input} value={venue.answers[q.id]?.answer || ""} onChange={(e) => setAnswer(q.id, "answer", e.target.value)} placeholder="Answer" aria-label="Answer" />
                                <input className={input} value={venue.answers[q.id]?.who || ""} onChange={(e) => setAnswer(q.id, "who", e.target.value)} placeholder="Who said it" aria-label="Who said it" />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {section.planner && !onlyStars && (
                      <p className="mt-4 p-4 rounded-xl bg-ink/[0.04] font-body text-[13px] leading-relaxed text-ink/75">
                        <b className="font-semibold text-ink">For your planner:</b> {section.planner}
                      </p>
                    )}
                    <div className="mt-5">
                      <p className={`${kicker} mb-2.5`}>Verdict</p>
                      <div className="flex flex-wrap gap-2">
                        {VERDICTS.map(([key, labelText]) => (
                          <button key={key} onClick={() => setVerdict(section.id, key)}
                            className={`rounded-full border px-4 py-2 font-body text-sm ${verdict === key ? VERDICT_STYLE[key] : "border-ink/25 text-ink/70"}`}>
                            {labelText}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          <section className="border-t border-ink/15 pt-6">
            <p className={`${kicker} mb-2`}>Notes on {venueLabel}</p>
            <textarea value={venue.notes} onChange={(e) => editVenue((v) => ({ ...v, notes: e.target.value }))} rows={5}
              placeholder="Anything else you noticed on the tour…"
              className="w-full border border-ink/20 rounded-xl p-4 font-body text-[15px] outline-none focus:border-gold resize-y" />
          </section>
        </>)}

        {view === "chase" && (
          <section>
            <h2 className="font-display text-3xl mb-3">Your Chase List</h2>
            {chase.length > 0 && (
              <p className="font-body text-[15px] text-ink/75 leading-relaxed mb-6">
                Everything {venueLabel} told you yes to out loud, but hasn’t put in writing. Send it to them and tap “Got it” as each one comes back.
              </p>
            )}
            {chase.length === 0 ? (
              <p className="font-body text-[15px] p-5 rounded-xl bg-ink/[0.04]">Nothing to chase yet. Questions you mark with a slash show up here.</p>
            ) : (<>
              <ol className="border-t border-ink/15 mb-7">
                {chase.map((q, i) => (
                  <li key={q.id} className="flex gap-3.5 py-3.5 border-b border-ink/10">
                    <span className="font-body text-sm text-ink/45 w-5 tabular-nums">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-body text-[15px] leading-relaxed">{q.text}</p>
                      {venue.answers[q.id]?.answer && <p className="font-body text-sm text-ink/60 mt-1">They said: {venue.answers[q.id].answer}{venue.answers[q.id].who ? ` (${venue.answers[q.id].who})` : ""}</p>}
                    </div>
                    <button onClick={() => cycle(q.id)} className="shrink-0 font-body text-[11px] uppercase tracking-[0.12em] text-ink/55">Got it</button>
                  </li>
                ))}
              </ol>
              <label className="block mb-5">
                <span className={kicker}>Venue’s email (optional)</span>
                <input className={input} type="email" value={venue.email} onChange={(e) => editVenue((v) => ({ ...v, email: e.target.value }))} placeholder="events@venue.com" />
              </label>
              <div className="flex flex-wrap gap-3">
                <a href={mailto} className="inline-flex bg-ink text-white font-body text-[11px] uppercase tracking-[0.2em] px-7 py-4 rounded-full">Email the venue</a>
                <button onClick={copyChase} className="inline-flex border border-ink font-body text-[11px] uppercase tracking-[0.2em] px-7 py-4 rounded-full">{copied ? "Copied" : "Copy the list"}</button>
              </div>
              <p className="font-body text-xs text-ink/55 mt-4">“Email the venue” opens your own email app with the list written for you. Nothing is sent until you press send.</p>
            </>)}
          </section>
        )}

        {view === "compare" && (
          <section>
            <h2 className="font-display text-3xl mb-3">Compare venues</h2>
            {tour.venues.length < 2 ? (
              <div className="p-5 rounded-xl bg-ink/[0.04]">
                <p className="font-body text-[15px] mb-4">Add the next venue you tour to see them side by side.</p>
                <button onClick={addVenue} className="inline-flex bg-ink text-white font-body text-[11px] uppercase tracking-[0.2em] px-7 py-3.5 rounded-full">+ Add venue</button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full border-collapse font-body text-[13px]" style={{ minWidth: `${7.5 + tour.venues.length * 7.5}rem` }}>
                  <thead>
                    <tr className="border-b border-ink">
                      <th className="sticky left-0 bg-white text-left py-3 pr-3 font-medium w-[7.5rem]">Section</th>
                      {tour.venues.map((v) => <th key={v.id} className="text-left py-3 px-2 font-medium">{v.name.trim() || "Untitled"}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-ink/10">
                      <td className="sticky left-0 bg-white py-3 pr-3 text-ink/70">Confirmed in writing</td>
                      {tour.venues.map((v) => { const c = counts(v); return <td key={v.id} className="py-3 px-2 tabular-nums">{c.confirmed}/{c.total}</td>; })}
                    </tr>
                    {sections.map((s) => (
                      <tr key={s.id} className="border-b border-ink/10">
                        <td className="sticky left-0 bg-white py-3 pr-3">{s.title}</td>
                        {tour.venues.map((v) => {
                          const verdict = v.verdicts[s.id];
                          return <td key={v.id} className="py-3 px-2">{verdict
                            ? <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] ${VERDICT_STYLE[verdict]}`}>{VERDICTS.find(([k]) => k === verdict)?.[1]}</span>
                            : <span className="text-ink/35">–</span>}</td>;
                        })}
                      </tr>
                    ))}
                    {allQuestions.filter((q) => q.star).map((q) => (
                      <tr key={q.id} className="border-b border-ink/10 align-top">
                        <td className="sticky left-0 bg-white py-3 pr-3"><span className="text-gold mr-1">★</span>{q.text}</td>
                        {tour.venues.map((v) => <td key={v.id} className="py-3 px-2 text-ink/80">{v.answers[q.id]?.answer || <span className="text-ink/35">–</span>}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <section className="mt-14 p-6 rounded-2xl bg-ecru/60">
          <p className="font-display text-2xl leading-snug mb-2">Want a second set of eyes?</p>
          <p className="font-body text-[15px] text-ink/75 leading-relaxed mb-5">Book a complimentary 30-minute consultation with Irene. Bring this checklist and we’ll go through what’s confirmed and what’s still only a promise.</p>
          <a href={consultationUrl} className="inline-flex bg-ink text-white font-body text-[11px] uppercase tracking-[0.2em] px-7 py-4 rounded-full">Book a consultation</a>
        </section>

        <footer className="mt-10 font-body text-xs text-ink/55 leading-relaxed space-y-2">
          <p>Your answers save automatically, privately with Lady Victoria Designs, so you can pick up on any phone or computer from the link in your email.</p>
          <p><a href={pdfUrl} className="underline underline-offset-4">Download the printable PDF</a></p>
        </footer>
      </div>
    </main>
  );
}
