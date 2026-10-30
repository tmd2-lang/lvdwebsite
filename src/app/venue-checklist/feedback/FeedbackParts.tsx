"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Props = { id: string; answer: "yes" | "no"; token: string };

function send(props: Props, comment?: string) {
  return fetch("/api/venue-checklist/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: props.id, a: props.answer, t: props.token, comment }),
  });
}

// Saved from the browser rather than on page load: email scanners open links
// automatically, and that must not count as an answer.
export function SaveAnswer(props: Props) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    send(props).catch(() => undefined);
  }, [props]);
  return null;
}

export function MissingForm(props: Props) {
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    setState("sending");
    const response = await send(props, comment).catch(() => null);
    setState(response?.ok ? "sent" : "error");
  }

  if (state === "sent") return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl mb-3">Thank you.</h2>
      <p className="font-body text-sm md:text-base text-ink/65 leading-relaxed">Irene will read it personally. If you’d like an answer to a specific question about your venue, just reply to any of our emails.</p>
    </div>
  );

  return (
    <form onSubmit={submit}>
      <label htmlFor="missing" className="block font-body text-[10px] uppercase tracking-[0.2em] text-ink/55 font-semibold mb-3">What would have helped?</label>
      <textarea id="missing" value={comment} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={2000}
        placeholder="A question you wish it asked, something that was confusing…"
        className="w-full bg-transparent border border-ink/20 rounded-xl p-4 font-body text-base text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold resize-y mb-5" />
      {state === "error" && <p className="font-body text-sm text-red-700 mb-4">That didn’t send. Please try again, or reply to any of our emails.</p>}
      <button type="submit" disabled={state === "sending" || !comment.trim()}
        className="inline-flex justify-center bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-9 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-ivory">
        {state === "sending" ? "Sending…" : "Send to Irene"}
      </button>
    </form>
  );
}
