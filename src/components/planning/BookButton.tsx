"use client";

import { useEffect, useRef, useState } from "react";
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
  variant?: "solid" | "outline";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
        investment: String(form.get("budget") || "") || undefined,
        services: [packageName],
        payload: { formType: "planning-booking", package: packageName },
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
      : "inline-flex items-center gap-4 border border-ink px-8 py-4 font-body text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors duration-300";

  return (
    <>
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        {label || `Book ${packageName}`}
        <span aria-hidden="true">→</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-ink/60 overflow-y-auto p-4 md:p-8"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="relative w-full max-w-lg bg-ivory my-auto"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close booking form"
              className="absolute top-4 right-4 text-ink/50 hover:text-ink text-xl leading-none"
            >
              ×
            </button>

            {status === "sent" ? (
              <div className="px-8 py-14 text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-gold mb-5 font-body">Received</div>
                <h2 id="booking-title" className="font-display text-3xl md:text-4xl mb-5">
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
                <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3 font-body">Booking request</div>
                <h2 id="booking-title" className="font-display text-3xl md:text-4xl leading-tight mb-2">
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
                    Budget range
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
                  {status === "sending" ? "Sending…" : "Send booking request"}
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
