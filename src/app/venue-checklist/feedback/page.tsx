import type { Metadata } from "next";
import Image from "next/image";
import { bookingUrl, checklistPdfUrl, getChecklistLead, readLead, validFeedbackToken, type ChecklistFeedback } from "@/lib/checklist-emails";
import { SaveAnswer, MissingForm } from "./FeedbackParts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Thank you | Venue Checklist",
  robots: { index: false, follow: false },
};

const PLANNING_URL = "/planning?utm_source=email&utm_medium=email&utm_campaign=venue_checklist_feedback";
const kicker = "font-body text-[10px] uppercase tracking-[0.25em] text-gold font-semibold";
const primary = "inline-flex justify-center bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-9 py-4 rounded-full hover:bg-gold hover:text-ink transition-colors";
const quiet = "font-body text-[11px] uppercase tracking-[0.22em] text-ink/70 border-b border-ink/25 pb-1 hover:text-gold hover:border-gold transition-colors";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full min-h-screen bg-ivory text-ink overflow-x-clip flex flex-col">
      <a href="/" className="px-6 md:px-12 pt-7 pb-2 font-display italic text-lg md:text-xl">Lady Victoria Designs</a>
      <div className="flex-1">{children}</div>
      <footer className="px-6 md:px-12 py-8 border-t border-ink/10 flex flex-wrap justify-between gap-3 font-body text-[11px] text-ink/45">
        <p>© {new Date().getFullYear()} Lady Victoria Designs</p>
        <a href="/privacy" className="hover:text-gold transition-colors">Privacy</a>
      </footer>
    </main>
  );
}

// Email 2 links here with the couple's answer to "Was the checklist useful?".
// The page saves it, then offers the next step that fits the answer.
export default async function ChecklistFeedbackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : "";
  const token = typeof params.t === "string" ? params.t : "";
  const answer = params.a === "no" ? "no" : params.a === "yes" ? "yes" : null;
  const lead = answer && id && token && validFeedbackToken(id, token) ? await getChecklistLead(id).catch(() => null) : null;

  if (!lead || !answer) return (
    <Shell>
      <section className="px-6 md:px-12 py-24 max-w-xl mx-auto text-center">
        <h1 className="font-display text-4xl mb-5">Link not recognized</h1>
        <p className="font-body text-ink/65 leading-relaxed mb-10">Reply to any of our emails and let us know what you thought of the checklist. Irene reads every one.</p>
        <a href="/venue-checklist" className={primary}>Back to the venue checklist</a>
      </section>
    </Shell>
  );

  const { firstName, booked } = readLead(lead);
  const name = firstName === "there" ? "" : `, ${firstName}`;
  const props = { id, answer: answer as ChecklistFeedback, token };

  return (
    <Shell>
      <SaveAnswer {...props} />
      <section className="px-6 md:px-12 pt-8 pb-20 lg:pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className={`${kicker} mb-5`}>Thank you{name}</p>
            {answer === "yes" ? (<>
              <h1 className="font-display text-[clamp(2.6rem,8vw,4.5rem)] leading-[1.02] tracking-tight mb-6">
                So glad it <span className="italic text-gold">helped.</span>
              </h1>
              <p className="font-display text-[clamp(1.25rem,2.6vw,1.6rem)] leading-snug max-w-xl mb-10">
                {booked
                  ? "Your venue is chosen. Now make sure it can hold the celebration you’re imagining."
                  : "When one venue starts to feel right, a second set of eyes can save you from an expensive surprise."}
              </p>
              <div className="bg-white/60 border border-ink/10 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(20,18,15,0.08)] max-w-xl">
                <h2 className="font-display text-2xl sm:text-3xl mb-3">A 20-minute venue consultation</h2>
                <p className="font-body text-sm md:text-base text-ink/65 leading-relaxed mb-7">
                  Bring your checklist and what the venue has told you. Irene will go through it with you: what’s confirmed, what’s still only a promise, and what to ask before anything is final.
                </p>
                <a href={bookingUrl(lead)} className={primary}>Book your consultation</a>
              </div>
            </>) : (<>
              <h1 className="font-display text-[clamp(2.6rem,8vw,4.5rem)] leading-[1.02] tracking-tight mb-6">
                What was <span className="italic text-gold">missing?</span>
              </h1>
              <p className="font-display text-[clamp(1.25rem,2.6vw,1.6rem)] leading-snug max-w-xl mb-10">
                Tell us in a sentence or two. Irene reads every answer, and it shapes the next version of the checklist.
              </p>
              <div className="bg-white/60 border border-ink/10 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(20,18,15,0.08)] max-w-xl">
                <MissingForm {...props} />
              </div>
            </>)}
          </div>
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden">
            <Image
              src={answer === "yes" ? "/gallery/terri-baskin/blueford2022-1031.jpg" : "/venue-checklist/rule-lounge.jpg"}
              alt={answer === "yes" ? "A bride and groom laughing in front of white florals" : "An evening reception lounge with a tall gold vase of white roses"}
              fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover object-[50%_35%]" priority />
          </div>
        </div>
      </section>

      <section className="bg-ecru/60 px-6 md:px-12 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <Image src="/venue-checklist/irene.jpg" alt="Irene Ntiako" width={160} height={160} className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <p className="font-display text-[clamp(1.3rem,2.8vw,1.9rem)] leading-snug mb-2">
              {answer === "yes" ? "Rather have us handle the venue questions for you?" : "Still working through your venue? A conversation may help more than any checklist."}
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink/50">Irene Ntiako · Founder &amp; Creative Director</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
            {answer === "yes"
              ? <a href={PLANNING_URL} className={primary}>See how we plan</a>
              : <a href={bookingUrl(lead)} className={primary}>Book a consultation</a>}
            <a href={checklistPdfUrl(lead)} className={quiet}>Download the checklist again</a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
