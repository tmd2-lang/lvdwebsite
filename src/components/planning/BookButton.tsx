"use client";

import { useEffect, useId, useRef, useState } from "react";
import { submitLead } from "@/lib/lead-submit";

const BUDGET_RANGES = [
  "Not sure yet",
  "Under $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000+",
];

type Status = "idle" | "sending" | "sent";

export default function BookButton({
  packageName,
  variant = "solid",
  label,
}: {
  packageName: string;
  variant?: "solid" | "outline" | "row";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const bookedVendors = String(form.get("bookedVendors") || "").trim();
    setError("");
    setStatus("sending");

    try {
      await submitLead({
        source: "inquire",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        date: String(form.get("date") || "") || undefined,
        venue: String(form.get("venue") || "") || undefined,
        guestCount: String(form.get("guestCount") || "") || undefined,
        vision: bookedVendors ? `Already booked: ${bookedVendors}` : undefined,
        investment: String(form.get("budget") || "") || undefined,
        services: [packageName],
        payload: { formType: "planning-booking", package: packageName, bookedVendors },
      });
      setStatus("sent");
    } catch (submitError) {
      setStatus("idle");
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    }
  }

  const buttonClass =
    variant === "solid"
      ? "inline-flex items-center justify-between gap-6 border border-ink bg-ink text-ivory px-6 py-4 font-body text-xs uppercase tracking-[0.18em] hover:bg-transparent hover:text-ink transition-colors duration-300 self-start"
      : variant === "row"
        ? "flex w-full items-center justify-between gap-6 border-y border-ink/20 py-6 font-body text-xs font-light uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold"
        : "inline-flex items-center gap-4 border border-ink px-8 py-4 font-body text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors duration-300";

  return (
    <>
      <button ref={triggerRef} type="button" className={`${buttonClass} max-w-full text-left`} onClick={() => setOpen(true)}>
        <span>{label || "Inquire about this package"}</span>
        <span aria-hidden="true" className={variant === "row" ? "grid size-10 shrink-0 place-items-center rounded-full border border-gold/50 text-lg text-gold" : "shrink-0"}>→</span>
      </button>

      {open && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden overscroll-contain bg-ink/60 p-2 md:p-8"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className="relative my-auto max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto overscroll-contain bg-ivory [-webkit-overflow-scrolling:touch] md:max-h-[90dvh]"
          >
            <div className="sticky top-0 z-20 flex justify-end bg-ivory px-4 pt-4 md:px-6">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close booking form"
                className="grid size-8 place-items-center text-ink/50 hover:text-ink text-xl leading-none"
              >
                ×
              </button>
            </div>
            {status === "sent" ? (
              <div className="px-8 py-14 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-gold mb-5 font-body">Received</div>
                <h2 id={titleId} className="font-display text-3xl md:text-4xl mb-5">
                  Thank you.
                </h2>
                <p className="font-body text-sm text-ink/70 leading-relaxed mb-8">
                  We have your request for <span className="text-ink">{packageName}</span>. Irene will
                  be in touch within two business days to talk through your celebration.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 border border-ink px-7 py-3.5 font-body text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-7 md:px-9 py-9 md:py-11">
                <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3 font-body">Planning inquiry</div>
                <h2 id={titleId} className="font-display text-3xl md:text-4xl leading-tight mb-2">
                  {packageName}
                </h2>
                <p className="font-body text-sm text-ink/60 leading-relaxed mb-7">
                  A few details and Irene will reach out. Nothing is charged and nothing is committed.
                </p>

                <div className="flex flex-col gap-4">
                  <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                    Your name
                    <input
                      required
                      name="name"
                      autoComplete="name"
                      disabled={status === "sending"}
                      className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                      Email
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        disabled={status === "sending"}
                        className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                      />
                    </label>
                    <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                      Phone
                      <input
                        required
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        disabled={status === "sending"}
                        className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                      Event date
                      <input
                        type="date"
                        name="date"
                        disabled={status === "sending"}
                        className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                      />
                    </label>
                    <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                      Venue <span className="normal-case tracking-normal text-ink/40">(if known)</span>
                      <input
                        name="venue"
                        disabled={status === "sending"}
                        className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                      />
                    </label>
                  </div>

                  <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                    Estimated guest count
                    <input
                      type="number"
                      name="guestCount"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 150"
                      disabled={status === "sending"}
                      className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                    />
                    <span className="font-body text-xs normal-case tracking-normal text-ink/50">An estimate is fine. Leave blank if you&rsquo;re still deciding.</span>
                  </label>

                  <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                    What have you already booked?
                    <textarea
                      name="bookedVendors"
                      rows={3}
                      maxLength={3000}
                      placeholder="Venue, photographer, catering… or tell us you're just getting started."
                      disabled={status === "sending"}
                      className="resize-y border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                    />
                  </label>

                  <label className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink/60 flex flex-col gap-1.5">
                    Overall wedding budget
                    <select
                      name="budget"
                      defaultValue="Not sure yet"
                      disabled={status === "sending"}
                      className="border border-ink/25 bg-white px-3.5 py-3 font-body text-sm normal-case tracking-normal text-ink focus:border-gold focus:outline-none disabled:bg-ink/5"
                    >
                      {BUDGET_RANGES.map((range) => (
                        <option key={range}>{range}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {error && (
                  <p role="alert" className="mt-5 border-l-2 border-[#9c4a37] bg-[#f6e9e5] px-3 py-2 font-body text-xs text-[#7d3a2a]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-7 w-full inline-flex items-center justify-between gap-6 border border-ink bg-ink text-ivory px-6 py-4 font-body text-xs uppercase tracking-[0.18em] hover:bg-transparent hover:text-ink transition-colors duration-300 disabled:opacity-60 disabled:hover:bg-ink disabled:hover:text-ivory"
                >
                  {status === "sending" ? "Sending…" : "Send inquiry"}
                  <span aria-hidden="true">{status === "sending" ? "" : "→"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
