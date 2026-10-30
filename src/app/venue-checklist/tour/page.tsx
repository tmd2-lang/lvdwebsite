import type { Metadata } from "next";
import { bookingUrl, checklistPdfUrl, getChecklistLead, readLead, validTourToken } from "@/lib/checklist-emails";
import { sectionsFor } from "@/lib/venue-checklist-questions";
import { cleanTour } from "@/lib/venue-checklist-tour";
import TourApp from "./TourApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your Venue Checklist",
  robots: { index: false, follow: false },
};

// The phone version of the venue checklist. Each couple reaches it through a private
// link (from the signup thank-you screen and the emails); progress saves on their lead.
export default async function VenueTourPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : "";
  const token = typeof params.t === "string" ? params.t : "";
  const lead = id && token && validTourToken(id, token) ? await getChecklistLead(id).catch(() => null) : null;

  if (!lead) return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col">
      <a href="/" className="px-6 pt-7 pb-2 font-display italic text-lg">Lady Victoria Designs</a>
      <section className="px-6 py-24 max-w-xl mx-auto text-center">
        <h1 className="font-display text-4xl mb-5">Link not recognized</h1>
        <p className="font-body text-ink/65 leading-relaxed mb-10">Open your checklist from the link in our email, or get the checklist again below.</p>
        <a href="/venue-checklist" className="inline-flex bg-ink text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-9 py-4 rounded-full">Get the venue checklist</a>
      </section>
    </main>
  );

  const { firstName, multicultural } = readLead(lead);
  return (
    <TourApp
      leadId={id}
      token={token}
      firstName={firstName === "there" ? "" : firstName}
      sections={sectionsFor(multicultural ? "multicultural" : "standard")}
      initialTour={cleanTour((lead.payload || {}).tour)}
      pdfUrl={checklistPdfUrl(lead)}
      consultationUrl={bookingUrl(lead)}
    />
  );
}
