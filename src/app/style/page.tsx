export default function StyleGuide() {
  return (
    <main className="p-12 md:p-24 max-w-[1440px] mx-auto min-h-screen">
      <div className="mb-16">
        <h1 className="font-display text-4xl mb-4">Design Tokens & Style Guide</h1>
        <p className="text-lg opacity-70 max-w-[65ch]">
          This page renders the typography and color tokens defined in Phase 0.
        </p>
      </div>

      <section className="mb-24">
        <h2 className="text-xs uppercase tracking-[0.2em] text-gold mb-8">Typography Scale</h2>
        
        <div className="space-y-12">
          <div>
            <div className="text-xs text-ink/50 mb-2">Display (Fraunces) - Hero 8-11vw clamp</div>
            <div className="font-display text-[clamp(4rem,8vw,8rem)] leading-[0.9] tracking-tight">
              Curators of <br/><span className="italic">Atmosphere</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-ink/50 mb-2">Display (Fraunces) - Section Header 4-6vw</div>
            <div className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[1.1]">
              Your wedding isn’t an event.<br/>
              <span className="italic">It’s a masterpiece.</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-ink/50 mb-2">Body (Manrope) - max 65ch</div>
            <p className="font-body text-base md:text-lg leading-[1.7] max-w-[65ch]">
              The doors open, the bride walks in, and the room is unrecognizable. Guests gasp. People text for weeks asking “who did this?” This is maximalist opulence—crystal chandeliers, saturated florals, gold, dramatic ceiling installations.
            </p>
          </div>

          <div>
            <div className="text-xs text-ink/50 mb-2">Utility / Eyebrow (Manrope, uppercase, tracked)</div>
            <div className="font-body text-[11px] md:text-[12px] uppercase tracking-[0.2em] text-gold">
              Luxury Wedding Design · Washington, DC & Beyond
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-gold mb-8">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-32 rounded-none bg-ink border border-ink/10"></div>
            <div className="text-sm font-semibold">Ink</div>
            <div className="text-xs font-mono opacity-60">#14120F</div>
          </div>
          <div className="space-y-2">
            <div className="h-32 rounded-none bg-ivory border border-ink/10"></div>
            <div className="text-sm font-semibold">Ivory</div>
            <div className="text-xs font-mono opacity-60">#F7F4EE</div>
          </div>
          <div className="space-y-2">
            <div className="h-32 rounded-none bg-ecru border border-ink/10"></div>
            <div className="text-sm font-semibold">Ecru</div>
            <div className="text-xs font-mono opacity-60">#EDE7DB</div>
          </div>
          <div className="space-y-2">
            <div className="h-32 rounded-none bg-gold border border-ink/10"></div>
            <div className="text-sm font-semibold">Gold</div>
            <div className="text-xs font-mono opacity-60">#A8894E</div>
          </div>
          <div className="space-y-2">
            <div className="h-32 rounded-none bg-rose-smoke border border-ink/10"></div>
            <div className="text-sm font-semibold">Rose Smoke</div>
            <div className="text-xs font-mono opacity-60">#C9B6B2</div>
          </div>
        </div>
      </section>
    </main>
  );
}
