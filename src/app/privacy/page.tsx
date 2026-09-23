import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Lady Victoria Designs collects, uses, and protects information shared through our website, inquiry forms, and advertisements.",
  alternates: { canonical: "/privacy" },
};

const sectionClass = "border-t border-ink/15 py-8 md:py-10";
const headingClass = "font-display text-2xl md:text-3xl mb-4";
const paragraphClass = "font-body text-sm md:text-base leading-7 text-ink/70";

export default function PrivacyPage() {
  return (
    <main className="bg-ivory text-ink px-6 md:px-12 pt-36 md:pt-48 pb-24">
      <article className="max-w-4xl mx-auto">
        <header className="pb-10 md:pb-16">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-5">
            Lady Victoria Designs
          </p>
          <h1 className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] mb-5">
            Privacy Policy
          </h1>
          <p className="font-body text-xs uppercase tracking-[0.18em] text-ink/50">
            Effective date: September 22, 2026
          </p>
          <p className={`${paragraphClass} mt-8 max-w-3xl`}>
            Lady Victoria Designs ("we," "our," or "us") respects your privacy. This policy explains what information we collect when you interact with our website, advertisements, and inquiry forms, and how we use it.
          </p>
        </header>

        <section className={sectionClass} aria-labelledby="business-contact">
          <h2 id="business-contact" className={headingClass}>Business contact</h2>
          <address className={`${paragraphClass} not-italic`}>
            Lady Victoria Designs · Brandywine, Maryland<br />
            Phone: <a className="underline underline-offset-4 hover:text-gold" href="tel:+13013120332">+1 301-312-0332</a><br />
            Website: <a className="underline underline-offset-4 hover:text-gold" href="https://www.ladyvictoriadesigns.com">ladyvictoriadesigns.com</a>
          </address>
        </section>

        <section className={sectionClass} aria-labelledby="information-we-collect">
          <h2 id="information-we-collect" className={headingClass}>Information we collect</h2>
          <div className="space-y-5">
            <p className={paragraphClass}>
              <strong className="font-semibold text-ink">Information you provide directly.</strong> When you submit an inquiry form, contact form, scope estimator, or Meta (Facebook/Instagram) lead form, we collect:
            </p>
            <ul className="list-disc space-y-2 pl-6 font-body text-sm md:text-base leading-7 text-ink/70">
              <li>Full name, email address, and phone number</li>
              <li>Event details you share: event date, venue, guest count, event type, design vision, and décor budget range</li>
              <li>How you heard about us</li>
            </ul>
            <p className={paragraphClass}>
              <strong className="font-semibold text-ink">Information collected automatically.</strong> When you visit our website we may collect:
            </p>
            <ul className="list-disc space-y-2 pl-6 font-body text-sm md:text-base leading-7 text-ink/70">
              <li>Device and browser information, pages visited, and time spent (via cookies and analytics tools such as Google Analytics)</li>
              <li>Ad interaction data (via the Meta Pixel), used to measure advertising performance</li>
            </ul>
          </div>
        </section>

        <section className={sectionClass} aria-labelledby="how-we-use">
          <h2 id="how-we-use" className={headingClass}>How we use your information</h2>
          <ul className="list-disc space-y-2 pl-6 font-body text-sm md:text-base leading-7 text-ink/70">
            <li>Respond to your inquiry and schedule consultations</li>
            <li>Prepare proposals tailored to your event</li>
            <li>Send follow-up communications about your inquiry (email, phone, or text)</li>
            <li>Improve our website, advertising, and services</li>
            <li>With your consent, send occasional marketing updates — you may opt out at any time</li>
          </ul>
          <p className={`${paragraphClass} mt-5`}><strong className="font-semibold text-ink">We do not sell your personal information.</strong></p>
        </section>

        <section className={sectionClass} aria-labelledby="how-we-share">
          <h2 id="how-we-share" className={headingClass}>How we share your information</h2>
          <p className={`${paragraphClass} mb-4`}>We share information only as needed to operate our business:</p>
          <ul className="list-disc space-y-2 pl-6 font-body text-sm md:text-base leading-7 text-ink/70">
            <li><strong className="font-semibold text-ink">Service providers</strong> that help us run the business (e.g., email delivery, lead management via Google Sheets, website hosting, analytics) — they may only use it for the services they provide to us</li>
            <li><strong className="font-semibold text-ink">Legal requirements</strong> — if required by law or to protect our rights</li>
          </ul>
        </section>

        <section className={sectionClass} aria-labelledby="meta-lead-ads">
          <h2 id="meta-lead-ads" className={headingClass}>Meta lead ads</h2>
          <p className={paragraphClass}>If you submit a lead form on Facebook or Instagram, Meta shares the information you entered with us under Meta&apos;s Lead Ads terms. That data is then handled according to this policy.</p>
        </section>

        <section className={sectionClass} aria-labelledby="data-retention">
          <h2 id="data-retention" className={headingClass}>Data retention</h2>
          <p className={paragraphClass}>We keep inquiry information for as long as needed to serve you and operate our business, or as required by law. You may request deletion of your information at any time (see below).</p>
        </section>

        <section className={sectionClass} aria-labelledby="your-rights">
          <h2 id="your-rights" className={headingClass}>Your rights</h2>
          <p className={paragraphClass}>You may request to access, correct, or delete the personal information we hold about you by contacting us at the phone number above. We will respond within a reasonable time.</p>
        </section>

        <section className={sectionClass} aria-labelledby="childrens-privacy">
          <h2 id="childrens-privacy" className={headingClass}>Children&apos;s privacy</h2>
          <p className={paragraphClass}>Our services are directed to adults planning events. We do not knowingly collect information from children under 13.</p>
        </section>

        <section className={sectionClass} aria-labelledby="cookies">
          <h2 id="cookies" className={headingClass}>Cookies</h2>
          <p className={paragraphClass}>Our website uses cookies for basic functionality and analytics. You can control cookies through your browser settings.</p>
        </section>

        <section className={sectionClass} aria-labelledby="changes">
          <h2 id="changes" className={headingClass}>Changes to this policy</h2>
          <p className={paragraphClass}>We may update this policy from time to time. The current version will always be posted on this page with its effective date.</p>
        </section>

        <p className="border-t border-ink/15 pt-6 mt-8 font-body text-xs leading-6 text-ink/45 italic">
          This is a standard small-business template prepared September 2026. Consider having it reviewed by your attorney.
        </p>
      </article>
    </main>
  );
}
