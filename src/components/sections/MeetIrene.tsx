import Image from "next/image";
import { media } from "@/lib/media-slots";

export default function MeetIrene() {
  return (
    <section className="relative w-full overflow-hidden border-t border-ink/10 bg-ivory py-20 md:py-36">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Mobile Layout (< md) */}
        <div className="flex flex-col md:hidden">
          <div className="mb-8">
            <span className="font-body text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-4">Founder & Creative Director</span>
            <h2 className="font-display text-4xl sm:text-5xl text-ink tracking-tight uppercase">
              Meet <span className="italic font-normal text-gold lowercase">Irene</span>
            </h2>
          </div>

          <div className="w-full aspect-[4/5] relative bg-ecru overflow-hidden mb-8 border border-ink/10 shadow-md">
            <Image
              src={media["home.founder"]}
              alt="Irene - Creative Director"
              fill
              sizes="100vw"
              className="w-full h-full object-cover grayscale opacity-90"
            />
          </div>

          <div className="bg-ecru/60 border border-ink/10 p-6 sm:p-8">
            <p className="font-body text-ink/85 text-base leading-relaxed mb-6">
              “I believe that true luxury is not just what you see, but how you feel. My approach to design is deeply personal, obsessively detailed, and unapologetically bold. We don’t just build events; we craft memories that linger for a lifetime.”
            </p>
            <div className="font-display italic text-2xl text-ink">Irene</div>
            <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mt-1">Creative Director</div>
          </div>
        </div>

        {/* Desktop Layout (md+) */}
        <div className="hidden md:grid md:grid-cols-12 gap-12 items-center min-h-[70vh]">
          
          {/* Left Column: Heading & Quote Card */}
          <div className="md:col-span-7 flex flex-col justify-center z-10">
            <span className="font-body text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-4">Founder & Creative Director</span>
            <h2 className="font-display text-7xl lg:text-8xl text-ink tracking-tighter uppercase mb-10 leading-[0.9]">
              Meet <span className="italic font-normal text-gold block">Irene</span>
            </h2>

            <div className="bg-ecru/80 border border-ink/10 p-10 lg:p-12 max-w-[54ch] shadow-sm backdrop-blur-sm">
              <p className="font-body text-ink/85 text-lg leading-[1.8] mb-8">
                “I believe that true luxury is not just what you see, but how you feel. My approach to design is deeply personal, obsessively detailed, and unapologetically bold. We don’t just build events; we craft memories that linger for a lifetime.”
              </p>
              <div className="font-display italic text-3xl text-ink">Irene</div>
              <div className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mt-1">Creative Director & Lead Designer</div>
            </div>
          </div>

          {/* Right Column: Portrait */}
          <div className="md:col-span-5 relative h-[600px] lg:h-[680px]">
            <div className="w-full h-full bg-ecru border border-ink/10 relative overflow-hidden group shadow-xl">
              <Image
                src={media["home.founder"]}
                alt="Irene Portrait"
                fill
                sizes="(max-width: 1023px) 42vw, 600px"
                className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 transition-all duration-700"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
