import Magnetic from "@/components/Magnetic";
import Image from "next/image";
import Link from "next/link";

export default function FooterCTA() {
  return (
    <footer className="w-full">
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 flex items-center justify-center opacity-40 overflow-hidden bg-ink">
          <Image
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=2000"
            alt="Wedding celebration"
            fill
            sizes="100vw"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="font-display text-[clamp(3rem,6vw,6rem)] text-ivory leading-tight max-w-[20ch] mb-16">
            Let’s create something <br/><span className="italic text-gold">unforgettable.</span>
          </h2>
          <Magnetic>
            <Link href="/inquire" className="font-body text-xs uppercase tracking-[0.2em] text-ivory border-b border-gold pb-1 hover:text-gold transition-colors">
              Book a Consultation
            </Link>
          </Magnetic>
        </div>
      </section>

      <div className="w-full bg-ink text-ivory py-12 px-6 md:px-12 border-t border-ivory/10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 font-body text-[10px] uppercase tracking-[0.2em] text-ivory/50">
          <div>© {new Date().getFullYear()} Lady Victoria Designs</div>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a>
            <a href="mailto:hello@ladyvictoriadesigns.com" className="hover:text-gold transition-colors">Contact</a>
          </div>
          <div>Washington, DC & Beyond</div>
        </div>
      </div>
    </footer>
  );
}
