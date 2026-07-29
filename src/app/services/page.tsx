import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Lady Victoria Designs",
};

export default function ServicesPage() {
  return (
    <main className="w-full min-h-screen bg-ivory text-ink flex flex-col items-center justify-center pt-32 pb-24 px-6 md:px-12">
      <div className="font-body text-xs uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-4">
         <span className="w-8 h-px bg-gold/50"></span>
         THE EXPERIENCE
         <span className="w-8 h-px bg-gold/50"></span>
      </div>
      <h1 className="font-display text-[clamp(3rem,6vw,6rem)] text-ink mb-8 text-center leading-none">
        Our <span className="italic text-gold">Services</span>
      </h1>
      <p className="font-body text-ink/70 max-w-2xl text-center">
        This immersive experience is currently being crafted. Check back soon.
      </p>
    </main>
  );
}
