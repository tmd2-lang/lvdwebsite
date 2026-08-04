import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-ink text-ivory pt-24 pb-8 px-6 md:px-12 flex flex-col justify-between overflow-hidden">
      
      {/* Top Grid */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-24 md:mb-32">
        
        {/* Brand / Tagline */}
        <div className="flex flex-col gap-6 lg:pr-12">
          <div className="font-display text-4xl text-gold italic">LVD</div>
          <p className="font-body text-xs md:text-sm text-ivory/70 leading-relaxed">
            Curating breathtaking floral design and unforgettable luxury events. Your vision, meticulously crafted.
          </p>
          <p className="font-body text-[10px] uppercase tracking-[0.1em] text-ivory/50">
            Serving Washington D.C., Maryland, Virginia, Delaware, Pennsylvania, and New Jersey.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">Explore</h4>
          <Link href="/" className="font-body text-sm hover:text-gold transition-colors w-fit">Home</Link>
          <Link href="/about" className="font-body text-sm hover:text-gold transition-colors w-fit">About</Link>
          <Link href="/services" className="font-body text-sm hover:text-gold transition-colors w-fit">Services</Link>
          <Link href="/gallery" className="font-body text-sm hover:text-gold transition-colors w-fit">Gallery</Link>
          <Link href="/testimonials" className="font-body text-sm hover:text-gold transition-colors w-fit">Kind Words</Link>
          <Link href="/inquire" className="font-body text-sm hover:text-gold transition-colors w-fit">Inquire</Link>
        </div>

        {/* Socials & Directories */}
        <div className="flex flex-col gap-3">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">Connect</h4>
          <a href="https://www.instagram.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">Instagram</a>
          <a href="https://www.pinterest.com/ladyvictoriadesigns/" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">Pinterest</a>
          <a href="https://www.facebook.com/LadyVictoriaDesign/" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">Facebook</a>
          <a href="https://www.tiktok.com/@ladyvictoriadesigns" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">TikTok</a>
          <a href="https://www.theknot.com/marketplace/lady-victoria-design-brandywine-md-2036012" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">The Knot</a>
          <a href="https://www.weddingwire.com/biz/lady-victoria-design-brandywine/f0e91afe3a54e207.html" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:text-gold transition-colors w-fit">WeddingWire</a>
        </div>

        {/* Direct Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="font-body text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-2">Contact</h4>
          <p className="font-body text-xs text-ivory/70 mb-2 leading-relaxed">
            Planning a celebration? Reach the studio directly or begin with our guided inquiry.
          </p>
          <a href="mailto:hello@ladyvictoriadesigns.com" className="font-body text-sm text-ivory hover:text-gold transition-colors w-fit">
            hello@ladyvictoriadesigns.com
          </a>
          <Link href="/inquire" className="font-body text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors w-fit">
            Begin Your Inquiry →
          </Link>
        </div>
      </div>

      {/* Massive Typography */}
      <div className="w-full flex items-center justify-center border-t border-ivory/10 pt-12 md:pt-20 mb-12 md:mb-16">
        <h2 className="font-display text-[clamp(2.5rem,8vw,8.5rem)] leading-[0.85] text-ivory tracking-tighter text-center uppercase">
          Lady Victoria <span className="italic text-gold lowercase font-normal">Designs</span>
        </h2>
      </div>

      {/* Bottom Bar */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-body text-ivory/40 uppercase tracking-[0.2em] text-center md:text-left">
        <p>© 2026 Lady Victoria Designs</p>
        <p>Washington, DC & Beyond</p>
        <p>Designed by Antigravity</p>
      </div>

    </footer>
  );
}
