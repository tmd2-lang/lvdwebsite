export default function MeetIrene() {
  return (
    <section className="w-full bg-ivory py-32 md:py-48 relative overflow-hidden">
      {/* Background oversized image */}
      <div className="absolute top-0 right-0 w-[80vw] md:w-[60vw] h-full bg-ecru">
        <img 
          src="/Irene.avif" 
          alt="Irene Portrait" 
          className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
        />
      </div>
      
      {/* Foreground overlapping text */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 h-[80vh] flex flex-col justify-center pointer-events-none mix-blend-difference text-ivory">
        <h2 className="font-display text-[15vw] leading-[0.75] tracking-tighter uppercase flex flex-col">
          <span className="block italic">Meet</span>
          <span className="block ml-[10vw]">Irene</span>
        </h2>
        
        <div className="mt-16 pointer-events-auto mix-blend-normal">
          <div className="bg-ivory text-ink p-8 md:p-12 max-w-[50ch] shadow-2xl">
            <p className="font-body text-ink/80 text-base md:text-lg leading-[1.8] mb-8">
              I believe that true luxury is not just what you see, but how you feel. My approach to design is deeply personal, obsessively detailed, and unapologetically bold. We don't just build events; we craft memories that linger for a lifetime.
            </p>
            <div className="font-display italic text-3xl md:text-4xl text-ink">Irene</div>
            <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mt-2">Creative Director</div>
          </div>
        </div>
      </div>
    </section>
  );
}
